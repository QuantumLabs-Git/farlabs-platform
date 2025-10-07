# Far Labs Platform

## Complete Web3 Infrastructure for Decentralized AI

Far Labs is a comprehensive Web3 platform providing multiple revenue streams for $FAR token holders through seven integrated services.

## 🚀 Features

- **Far Inference**: Decentralized AI inference network for LLMs
- **Farcana Game**: Blockchain gaming ecosystem
- **Far DeSci**: Decentralized science platform
- **Far GameD**: Game distribution platform
- **FarTwin AI**: Digital twin AI platform
- **Far GPU De-Pin**: GPU resource sharing network
- **$FAR Staking**: Token staking mechanism

## 📁 Project Structure

```
farlabs-platform/
├── packages/
│   ├── frontend/          # Next.js 14 frontend application
│   ├── api-gateway/       # API Gateway service
│   ├── websocket/         # WebSocket server
│   ├── contracts/         # Smart contracts
│   └── shared/           # Shared utilities
├── services/
│   ├── inference/        # Python FastAPI inference service
│   ├── gpu-manager/      # GPU node management
│   └── payment/          # Payment processing
├── infrastructure/
│   ├── terraform/        # AWS infrastructure as code
│   ├── docker/          # Docker configurations
│   └── k8s/             # Kubernetes manifests
└── scripts/             # Deployment and utility scripts
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi, Viem, RainbowKit
- **State**: Zustand
- **Animations**: Framer Motion

### Backend
- **API**: FastAPI (Python), Node.js
- **Database**: PostgreSQL, MongoDB, Redis
- **Queue**: Celery, Redis
- **WebSocket**: Socket.io

### Blockchain
- **Network**: Binance Smart Chain (BSC)
- **Contracts**: Solidity, OpenZeppelin
- **Web3**: Ethers.js, Web3.py

### Infrastructure
- **Cloud**: AWS (ECS, RDS, ElastiCache, CloudFront)
- **Container**: Docker, Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch, Prometheus, Grafana

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker
- AWS CLI configured
- BSC wallet with BNB for gas

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/farlabs/farlabs-platform.git
cd farlabs-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development servers**
```bash
npm run dev
```

### Development

Start individual services:

```bash
# Frontend
cd packages/frontend
npm run dev

# Inference Service
cd services/inference
pip install -r requirements.txt
uvicorn main:app --reload

# Smart Contracts
cd packages/contracts
npx hardhat compile
npx hardhat test
```

## 📦 Deployment

### AWS Deployment

1. **Configure AWS credentials**
```bash
aws configure
```

2. **Deploy infrastructure**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

3. **Deploy services**
```bash
npm run deploy
```

### Docker Deployment

```bash
# Build all images
docker-compose build

# Run locally
docker-compose up

# Push to registry
docker-compose push
```

## 🔒 Security

- JWT authentication with refresh tokens
- Web3 wallet signatures
- Rate limiting per IP/wallet
- Input validation and sanitization
- Smart contract audits
- SSL/TLS encryption
- WAF protection

## 📊 Monitoring

Access monitoring dashboards:
- CloudWatch: AWS Console
- Grafana: http://monitoring.farlabs.ai
- Prometheus: http://metrics.farlabs.ai

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
cd packages/frontend
npm test

# Smart contract tests
cd packages/contracts
npx hardhat test

# API tests
cd services/inference
pytest
```

## 📝 API Documentation

- REST API: https://api.farlabs.ai/docs
- WebSocket: https://ws.farlabs.ai/docs
- Smart Contracts: https://docs.farlabs.ai/contracts

## 💰 Revenue Model

Platform revenue streams:
1. **Inference Fees**: 20% platform fee on AI inference
2. **GPU Network**: 20% fee on GPU rental
3. **Gaming Revenue**: 30% of in-game transactions
4. **DeSci Funding**: 10% of research grants
5. **GameD Sales**: 15% of game sales
6. **FarTwin Subscriptions**: Monthly SaaS fees
7. **Staking Rewards**: APY from platform revenue

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and submission process.

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- Website: https://farlabs.ai
- Documentation: https://docs.farlabs.ai
- Twitter: https://twitter.com/farlabs
- Discord: https://discord.gg/farlabs
- Telegram: https://t.me/farlabs

## 📞 Support

For support, email support@farlabs.ai or join our Discord server.

---

Built with ❤️ by the Far Labs Team