#!/usr/bin/env python3
"""
Far Labs GPU Node Client
Run this on your machine with a GPU to connect to the Far Labs platform
and start earning FAR tokens by processing inference requests.
"""

import asyncio
import json
import logging
import os
import platform
import subprocess
import sys
from typing import Dict, Any, Optional

import aiohttp
import websockets

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('gpu_node')

# Configuration
PLATFORM_URL = "http://54.145.42.136:8000"  # Far Labs platform URL
WS_URL = "ws://54.145.42.136:8000/ws"

class GPUNodeClient:
    def __init__(self, wallet_address: str, node_name: Optional[str] = None):
        self.wallet_address = wallet_address
        self.node_id = node_name or f"gpu-node-{platform.node()}"
        self.session = None
        self.ws = None
        self.capabilities = self._detect_capabilities()
        self.models_loaded = {}

    def _detect_capabilities(self) -> Dict[str, Any]:
        """Detect GPU capabilities"""
        capabilities = {
            "platform": platform.system(),
            "python_version": sys.version,
            "models_supported": []
        }

        # Try to detect NVIDIA GPU
        try:
            import torch
            if torch.cuda.is_available():
                capabilities["gpu_available"] = True
                capabilities["gpu_count"] = torch.cuda.device_count()
                capabilities["gpu_model"] = torch.cuda.get_device_name(0)
                capabilities["vram"] = torch.cuda.get_device_properties(0).total_memory / (1024**3)  # GB
                capabilities["cuda_version"] = torch.version.cuda
                capabilities["models_supported"] = ["llama", "stable-diffusion", "whisper"]
                logger.info(f"Detected GPU: {capabilities['gpu_model']} with {capabilities['vram']:.1f}GB VRAM")
            else:
                capabilities["gpu_available"] = False
                logger.warning("No GPU detected. Running in CPU mode.")
        except ImportError:
            logger.warning("PyTorch not installed. Install with: pip install torch")
            capabilities["gpu_available"] = False

        # Check for Apple Silicon
        if platform.system() == "Darwin" and platform.processor() == "arm":
            try:
                import torch
                if torch.backends.mps.is_available():
                    capabilities["gpu_available"] = True
                    capabilities["gpu_model"] = "Apple Silicon (MPS)"
                    capabilities["models_supported"] = ["llama", "stable-diffusion", "whisper"]
                    logger.info("Detected Apple Silicon GPU (MPS)")
            except:
                pass

        return capabilities

    async def register_node(self):
        """Register this node with the platform"""
        async with aiohttp.ClientSession() as session:
            data = {
                "node_id": self.node_id,
                "wallet_address": self.wallet_address,
                "capabilities": self.capabilities
            }

            try:
                async with session.post(f"{PLATFORM_URL}/api/node/register", json=data) as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        logger.info(f"✅ Node registered successfully: {result}")
                        return True
                    else:
                        logger.error(f"Failed to register node: {await resp.text()}")
                        return False
            except Exception as e:
                logger.error(f"Error registering node: {e}")
                return False

    async def load_model(self, model_name: str):
        """Load a model for inference"""
        if model_name in self.models_loaded:
            return self.models_loaded[model_name]

        logger.info(f"Loading model: {model_name}")

        try:
            if model_name == "llama":
                # Example: Load Llama model
                from transformers import AutoModelForCausalLM, AutoTokenizer
                model = AutoModelForCausalLM.from_pretrained("gpt2")  # Use gpt2 for testing
                tokenizer = AutoTokenizer.from_pretrained("gpt2")
                self.models_loaded[model_name] = {"model": model, "tokenizer": tokenizer}

            elif model_name == "stable-diffusion":
                # Example: Load Stable Diffusion
                logger.info("Stable Diffusion support coming soon")

            elif model_name == "whisper":
                # Example: Load Whisper
                logger.info("Whisper support coming soon")

            logger.info(f"✅ Model {model_name} loaded successfully")
            return self.models_loaded.get(model_name)

        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            return None

    async def process_inference(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process an inference request"""
        model_name = request.get("model", "llama")
        prompt = request.get("prompt", "")

        logger.info(f"Processing inference request: model={model_name}, prompt_length={len(prompt)}")

        # Load model if needed
        model_data = await self.load_model(model_name)

        if not model_data:
            return {"error": f"Model {model_name} not available"}

        try:
            if model_name == "llama":
                # Run inference
                model = model_data["model"]
                tokenizer = model_data["tokenizer"]

                inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)

                # Move to GPU if available
                if self.capabilities.get("gpu_available"):
                    import torch
                    if torch.cuda.is_available():
                        model = model.cuda()
                        inputs = {k: v.cuda() for k, v in inputs.items()}

                # Generate response
                with torch.no_grad():
                    outputs = model.generate(
                        **inputs,
                        max_new_tokens=100,
                        temperature=0.7,
                        do_sample=True
                    )

                response = tokenizer.decode(outputs[0], skip_special_tokens=True)

                return {
                    "status": "success",
                    "response": response,
                    "model": model_name,
                    "tokens_generated": len(outputs[0]) - len(inputs['input_ids'][0])
                }

        except Exception as e:
            logger.error(f"Inference error: {e}")
            return {"error": str(e)}

    async def connect_websocket(self):
        """Connect to platform via WebSocket for real-time communication"""
        while True:
            try:
                async with websockets.connect(f"{WS_URL}/node/{self.node_id}") as ws:
                    self.ws = ws
                    logger.info("✅ Connected to platform via WebSocket")

                    # Send initial registration
                    await ws.send(json.dumps({
                        "type": "register",
                        "node_id": self.node_id,
                        "capabilities": self.capabilities
                    }))

                    # Listen for requests
                    async for message in ws:
                        data = json.loads(message)

                        if data.get("type") == "inference_request":
                            # Process inference request
                            result = await self.process_inference(data.get("request", {}))

                            # Send response back
                            await ws.send(json.dumps({
                                "type": "inference_response",
                                "request_id": data.get("request_id"),
                                "result": result
                            }))

                            logger.info(f"✅ Processed request {data.get('request_id')}")

                        elif data.get("type") == "ping":
                            # Respond to health check
                            await ws.send(json.dumps({"type": "pong"}))

            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await asyncio.sleep(5)  # Reconnect after 5 seconds

    async def start(self):
        """Start the GPU node client"""
        logger.info(f"""
╔══════════════════════════════════════════════════╗
║         Far Labs GPU Node Client v1.0           ║
╠══════════════════════════════════════════════════╣
║ Node ID: {self.node_id:<40} ║
║ Wallet: {self.wallet_address:<41} ║
║ GPU: {self.capabilities.get('gpu_model', 'CPU Only'):<44} ║
╚══════════════════════════════════════════════════╝
        """)

        # Register node
        if not await self.register_node():
            logger.error("Failed to register node. Please check your connection.")
            return

        # Connect via WebSocket
        await self.connect_websocket()

def install_requirements():
    """Install required packages"""
    packages = [
        "torch",
        "transformers",
        "aiohttp",
        "websockets"
    ]

    print("Installing required packages...")
    for package in packages:
        subprocess.run([sys.executable, "-m", "pip", "install", package])

async def main():
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                 FAR LABS GPU NODE SETUP                      ║
    ╚══════════════════════════════════════════════════════════════╝

    This script will connect your GPU to the Far Labs network,
    allowing you to earn FAR tokens by processing AI inference requests.
    """)

    # Get wallet address
    wallet_address = input("Enter your wallet address (for receiving FAR tokens): ").strip()
    if not wallet_address:
        wallet_address = "0x0000000000000000000000000000000000000000"  # Test address
        print(f"Using test wallet address: {wallet_address}")

    # Optional: custom node name
    node_name = input("Enter a custom node name (press Enter for auto-generated): ").strip()

    # Check for required packages
    try:
        import torch
        import transformers
    except ImportError:
        response = input("Required packages not installed. Install now? (y/n): ")
        if response.lower() == 'y':
            install_requirements()
        else:
            print("Please install requirements manually: pip install torch transformers aiohttp websockets")
            return

    # Create and start client
    client = GPUNodeClient(wallet_address, node_name)
    await client.start()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 GPU node shutting down...")