from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import redis.asyncio as redis
from typing import Optional, List, Dict, Any
import uuid
import json
import logging
from datetime import datetime
from pydantic import BaseModel, Field
from web3 import Web3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
BSC_RPC = os.getenv("BSC_RPC", "https://bsc-dataseed.binance.org/")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")

# Initialize connections
w3 = Web3(Web3.HTTPProvider(BSC_RPC))

# Pydantic models
class InferenceRequest(BaseModel):
    model_id: str = Field(..., description="Model identifier")
    prompt: str = Field(..., description="Input prompt")
    max_tokens: int = Field(1000, ge=1, le=4000)
    temperature: float = Field(0.7, ge=0, le=2)
    top_p: float = Field(0.9, ge=0, le=1)
    stream: bool = Field(False)

class InferenceResponse(BaseModel):
    task_id: str
    result: Optional[str] = None
    tokens_used: int
    cost: float
    model: str
    status: str

class NodeRegistration(BaseModel):
    wallet_address: str
    gpu_model: str
    vram: int = Field(..., ge=8)
    bandwidth: float = Field(..., ge=10)
    cuda_cores: int
    location: str

class TaskStatus(BaseModel):
    task_id: str
    status: str
    progress: float
    result: Optional[str] = None
    error: Optional[str] = None

# Model registry
MODEL_REGISTRY = {
    "llama-70b": {
        "path": "meta-llama/Llama-2-70b-chat-hf",
        "min_gpu_vram": 140,
        "tokens_per_second": 50,
        "price_per_1m_tokens": 3.0
    },
    "mixtral-8x22b": {
        "path": "mistralai/Mixtral-8x22B-Instruct-v0.1",
        "min_gpu_vram": 180,
        "tokens_per_second": 40,
        "price_per_1m_tokens": 5.0
    },
    "llama-405b": {
        "path": "meta-llama/Llama-3-405b-instruct",
        "min_gpu_vram": 810,
        "tokens_per_second": 30,
        "price_per_1m_tokens": 15.0
    }
}

class GPUNodeManager:
    def __init__(self):
        self.nodes: Dict[str, Dict] = {}
        self.node_scores: Dict[str, float] = {}

    async def register_node(self, node_id: str, capabilities: dict):
        """Register a GPU node with its capabilities"""
        self.nodes[node_id] = {
            "capabilities": capabilities,
            "status": "available",
            "score": 100.0,
            "tasks_completed": 0,
            "uptime": 0,
            "last_heartbeat": datetime.now()
        }
        logger.info(f"Node {node_id} registered with {capabilities['vram']}GB VRAM")

    async def select_best_node(self, model_requirements: dict) -> Optional[str]:
        """Select the best available node for a task"""
        eligible_nodes = []

        for node_id, node_data in self.nodes.items():
            if (node_data["status"] == "available" and
                node_data["capabilities"]["vram"] >= model_requirements["min_gpu_vram"]):
                eligible_nodes.append((node_id, node_data["score"]))

        if not eligible_nodes:
            return None

        # Sort by score and return best node
        eligible_nodes.sort(key=lambda x: x[1], reverse=True)
        selected_node = eligible_nodes[0][0]
        self.nodes[selected_node]["status"] = "busy"
        return selected_node

    async def release_node(self, node_id: str):
        """Release a node after task completion"""
        if node_id in self.nodes:
            self.nodes[node_id]["status"] = "available"
            self.nodes[node_id]["tasks_completed"] += 1

    async def update_node_score(self, node_id: str, performance_metrics: dict) -> float:
        """Update node reliability score based on performance"""
        if node_id not in self.nodes:
            return 0

        base_score = self.nodes[node_id]["score"]

        # Calculate performance adjustments
        uptime_factor = performance_metrics.get("uptime", 100) / 100
        speed_factor = min(1.0, performance_metrics.get("actual_speed", 1) /
                          performance_metrics.get("expected_speed", 1))
        accuracy_factor = performance_metrics.get("accuracy", 1)

        new_score = (base_score * 0.7 +
                    uptime_factor * 10 +
                    speed_factor * 10 +
                    accuracy_factor * 10)

        self.nodes[node_id]["score"] = min(100, max(0, new_score))

        # Calculate payment adjustment (±10% based on score)
        adjustment = (new_score - 80) / 200  # -10% to +10%
        return adjustment

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.redis = await redis.from_url(REDIS_URL)
    app.state.node_manager = GPUNodeManager()
    logger.info("Inference service started")
    yield
    # Shutdown
    await app.state.redis.close()
    logger.info("Inference service stopped")

# Create FastAPI app
app = FastAPI(
    title="Far Labs Inference Service",
    description="Decentralized AI inference API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://farlabs.ai", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    # TODO: Implement proper JWT verification
    return {"user_id": "test_user", "wallet_address": "0x123..."}

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Far Labs Inference",
        "status": "operational",
        "models": list(MODEL_REGISTRY.keys())
    }

@app.post("/api/inference/generate", response_model=InferenceResponse)
async def generate_text(
    request: InferenceRequest,
    user = Depends(verify_token)
):
    """Main inference endpoint"""
    try:
        # Validate model
        model_info = MODEL_REGISTRY.get(request.model_id)
        if not model_info:
            raise HTTPException(404, "Model not found")

        # Calculate cost
        estimated_cost = (request.max_tokens / 1_000_000) * model_info["price_per_1m_tokens"]

        # Select best GPU node
        node_id = await app.state.node_manager.select_best_node(model_info)
        if not node_id:
            raise HTTPException(503, "No available GPU nodes")

        # Create task
        task_id = str(uuid.uuid4())
        task_data = {
            "id": task_id,
            "model": request.model_id,
            "prompt": request.prompt,
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "top_p": request.top_p,
            "node_id": node_id,
            "status": "queued",
            "user_id": user["user_id"],
            "created_at": datetime.now().isoformat()
        }

        # Queue task for processing
        await app.state.redis.lpush("inference_queue", json.dumps(task_data))
        await app.state.redis.set(f"task:{task_id}", json.dumps(task_data), ex=3600)

        # For demo purposes, simulate immediate response
        # In production, this would be handled by worker processes
        await asyncio.sleep(0.1)  # Simulate processing

        # Mock result
        result = f"Generated response for: {request.prompt[:50]}..."
        tokens_used = min(request.max_tokens, len(request.prompt.split()) * 10)
        actual_cost = (tokens_used / 1_000_000) * model_info["price_per_1m_tokens"]

        # Release node
        await app.state.node_manager.release_node(node_id)

        return InferenceResponse(
            task_id=task_id,
            result=result,
            tokens_used=tokens_used,
            cost=actual_cost,
            model=request.model_id,
            status="completed"
        )

    except Exception as e:
        logger.error(f"Inference error: {str(e)}")
        raise HTTPException(500, str(e))

@app.get("/api/inference/status/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Get task status and result"""
    task_data = await app.state.redis.get(f"task:{task_id}")
    if not task_data:
        raise HTTPException(404, "Task not found")

    task = json.loads(task_data)
    return TaskStatus(
        task_id=task_id,
        status=task.get("status", "unknown"),
        progress=task.get("progress", 0),
        result=task.get("result"),
        error=task.get("error")
    )

@app.websocket("/ws/inference/{task_id}")
async def inference_websocket(websocket: WebSocket, task_id: str):
    """WebSocket for streaming inference results"""
    await websocket.accept()

    try:
        # Check if task exists
        task_data = await app.state.redis.get(f"task:{task_id}")
        if not task_data:
            await websocket.send_json({"error": "Task not found"})
            await websocket.close()
            return

        # Stream updates
        while True:
            # Get task updates from Redis
            task_data = await app.state.redis.get(f"task:{task_id}")
            if task_data:
                task = json.loads(task_data)
                await websocket.send_json({
                    "status": task.get("status"),
                    "progress": task.get("progress", 0),
                    "tokens": task.get("tokens_generated", 0)
                })

                if task.get("status") in ["completed", "failed"]:
                    if task.get("result"):
                        await websocket.send_json({"result": task["result"]})
                    break

            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for task {task_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()

# GPU Node Management Endpoints
@app.post("/api/node/register")
async def register_gpu_node(registration: NodeRegistration):
    """Register a new GPU provider node"""
    node_id = f"node_{registration.wallet_address}_{uuid.uuid4().hex[:8]}"

    capabilities = {
        "wallet": registration.wallet_address,
        "gpu_model": registration.gpu_model,
        "vram": registration.vram,
        "bandwidth": registration.bandwidth,
        "cuda_cores": registration.cuda_cores,
        "location": registration.location,
        "supported_models": []
    }

    # Determine which models this node can run
    for model_id, model_info in MODEL_REGISTRY.items():
        if registration.vram >= model_info["min_gpu_vram"]:
            capabilities["supported_models"].append(model_id)

    await app.state.node_manager.register_node(node_id, capabilities)

    return {
        "node_id": node_id,
        "status": "registered",
        "supported_models": capabilities["supported_models"]
    }

@app.post("/api/node/{node_id}/heartbeat")
async def node_heartbeat(node_id: str):
    """Update node heartbeat"""
    if node_id in app.state.node_manager.nodes:
        app.state.node_manager.nodes[node_id]["last_heartbeat"] = datetime.now()
        return {"status": "ok"}
    raise HTTPException(404, "Node not found")

@app.get("/api/network/status")
async def get_network_status():
    """Get current network statistics"""
    node_manager = app.state.node_manager
    total_nodes = len(node_manager.nodes)
    available_nodes = sum(
        1 for n in node_manager.nodes.values()
        if n["status"] == "available"
    )

    total_vram = sum(
        n["capabilities"]["vram"]
        for n in node_manager.nodes.values()
    )

    avg_score = 0
    if total_nodes > 0:
        avg_score = sum(
            n["score"] for n in node_manager.nodes.values()
        ) / total_nodes

    return {
        "total_nodes": total_nodes,
        "available_nodes": available_nodes,
        "total_vram_gb": total_vram,
        "models_available": list(MODEL_REGISTRY.keys()),
        "average_node_score": avg_score,
        "network_status": "operational" if available_nodes > 0 else "degraded"
    }

@app.get("/api/models")
async def get_available_models():
    """Get list of available models and their specifications"""
    return {
        "models": [
            {
                "id": model_id,
                "name": model_id.replace("-", " ").title(),
                **model_info
            }
            for model_id, model_info in MODEL_REGISTRY.items()
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "redis": "connected" if hasattr(app.state, "redis") else "disconnected",
        "nodes": len(app.state.node_manager.nodes) if hasattr(app.state, "node_manager") else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)