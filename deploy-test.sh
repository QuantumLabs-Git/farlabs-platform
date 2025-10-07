#!/bin/bash

# Far Labs Test Deployment Script for AWS Free Tier
# This script helps you deploy the platform to AWS using free tier resources

set -e

echo "🚀 Far Labs Test Deployment Script"
echo "=================================="
echo "This will deploy using AWS Free Tier resources"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not found. Please install it first:${NC}"
        echo "   brew install awscli (macOS)"
        echo "   or visit: https://aws.amazon.com/cli/"
        exit 1
    fi

    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform not found. Please install it first:${NC}"
        echo "   brew install terraform (macOS)"
        echo "   or visit: https://www.terraform.io/downloads"
        exit 1
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found. Please install Docker Desktop${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ All prerequisites installed${NC}"
}

# Configure AWS credentials
configure_aws() {
    echo ""
    echo "🔐 Configuring AWS credentials..."
    echo "Please have your AWS Access Key ID and Secret Access Key ready."
    echo "You can find these in AWS Console > IAM > Users > Your User > Security credentials"
    echo ""

    read -p "Have you already configured AWS CLI? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        aws configure
    fi

    # Test AWS credentials
    echo "Testing AWS credentials..."
    if aws sts get-caller-identity &> /dev/null; then
        echo -e "${GREEN}✅ AWS credentials configured successfully${NC}"
        aws sts get-caller-identity
    else
        echo -e "${RED}❌ AWS credentials test failed${NC}"
        exit 1
    fi
}

# Create SSH key if it doesn't exist
create_ssh_key() {
    echo ""
    echo "🔑 Checking SSH key..."

    if [ ! -f ~/.ssh/id_rsa.pub ]; then
        echo "Creating new SSH key pair..."
        ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa -N ""
        echo -e "${GREEN}✅ SSH key created${NC}"
    else
        echo -e "${GREEN}✅ SSH key already exists${NC}"
    fi
}

# Setup environment variables
setup_environment() {
    echo ""
    echo "🔧 Setting up environment variables..."

    if [ ! -f .env ]; then
        cat > .env <<EOF
# Test Environment Configuration
NODE_ENV=test
PORT=3000

# API URLs (will be updated after deployment)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Blockchain (BSC Testnet)
NEXT_PUBLIC_BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
NEXT_PUBLIC_CHAIN_ID=97

# Database (will be updated after RDS deployment)
DATABASE_URL=postgresql://postgres:testpassword123!@localhost:5432/farlabs

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=$(openssl rand -base64 32)

# AWS Region
AWS_REGION=us-east-1
EOF
        echo -e "${GREEN}✅ Environment file created${NC}"
    else
        echo -e "${YELLOW}⚠️  .env file already exists. Skipping...${NC}"
    fi
}

# Test locally first
test_local() {
    echo ""
    echo "🧪 Testing local deployment..."
    read -p "Do you want to test locally first? (recommended) (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting local services with Docker Compose..."
        docker-compose up -d

        echo ""
        echo -e "${GREEN}✅ Local services started!${NC}"
        echo "   Frontend: http://localhost:3000"
        echo "   API: http://localhost:8000"
        echo "   Redis: localhost:6379"
        echo "   PostgreSQL: localhost:5432"
        echo ""

        read -p "Press any key to stop local services and continue with AWS deployment..." -n 1 -r
        echo
        docker-compose down
    fi
}

# Deploy to AWS
deploy_aws() {
    echo ""
    echo "☁️  Deploying to AWS..."
    echo -e "${YELLOW}Note: This will use AWS Free Tier resources${NC}"
    echo ""

    cd infrastructure/terraform/environments/test

    # Initialize Terraform
    echo "Initializing Terraform..."
    terraform init

    # Plan deployment
    echo ""
    echo "Planning deployment..."
    terraform plan -out=tfplan

    # Confirm deployment
    echo ""
    echo -e "${YELLOW}⚠️  Review the plan above. This will create AWS resources.${NC}"
    read -p "Do you want to proceed with deployment? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploying infrastructure..."
        terraform apply tfplan

        # Get outputs
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "📊 Deployment Information:"
        echo "=========================="
        terraform output

        # Update .env with actual values
        INSTANCE_IP=$(terraform output -raw instance_public_ip)
        RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

        cd ../../../..

        # Update .env file
        sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:8000|" .env
        sed -i.bak "s|NEXT_PUBLIC_WS_URL=.*|NEXT_PUBLIC_WS_URL=ws://$INSTANCE_IP:3001|" .env
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:testpassword123!@$RDS_ENDPOINT/farlabs|" .env

        echo ""
        echo "🌐 Access your application at:"
        echo "   Frontend: http://$INSTANCE_IP:3000"
        echo "   API: http://$INSTANCE_IP:8000"
        echo ""
        echo "SSH access: ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP"
    else
        echo "Deployment cancelled."
        rm tfplan
    fi
}

# Post-deployment setup
post_deployment() {
    echo ""
    echo "📝 Post-Deployment Steps:"
    echo "========================"
    echo "1. Wait 3-5 minutes for services to start"
    echo "2. Access the frontend URL shown above"
    echo "3. Monitor logs with: ssh -i ~/.ssh/id_rsa ubuntu@<IP> 'docker-compose logs -f'"
    echo "4. To stop services: ssh -i ~/.ssh/id_rsa ubuntu@<IP> 'docker-compose down'"
    echo ""
    echo -e "${YELLOW}💰 Cost Information:${NC}"
    echo "   - EC2 t2.micro: 750 hours/month free for 12 months"
    echo "   - RDS db.t3.micro: 750 hours/month free for 12 months"
    echo "   - S3: 5GB free, then $0.023/GB"
    echo "   - Data Transfer: 15GB/month free"
    echo ""
    echo -e "${RED}⚠️  Important:${NC}"
    echo "   - This is a TEST deployment. Do not use for production!"
    echo "   - Remember to destroy resources when done: terraform destroy"
    echo "   - Monitor your AWS billing dashboard regularly"
}

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 To clean up AWS resources:"
    echo "   cd infrastructure/terraform/environments/test"
    echo "   terraform destroy"
}

# Main execution
main() {
    check_prerequisites
    configure_aws
    create_ssh_key
    setup_environment
    test_local
    deploy_aws
    post_deployment

    echo ""
    echo -e "${GREEN}🎉 Deployment script completed!${NC}"
    echo ""

    # Trap for cleanup reminder
    trap cleanup EXIT
}

# Run main function
main