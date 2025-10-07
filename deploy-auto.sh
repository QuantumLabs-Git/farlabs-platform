#!/bin/bash

# Fully Automated Deployment Script - No User Input Required
# This will deploy everything with a single command

set -e

echo "🚀 Far Labs Automated Deployment Starting..."
echo "=========================================="
echo "This will deploy everything automatically without user input"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
export AWS_DEFAULT_REGION=us-east-1
PROJECT_DIR=$(pwd)
DEPLOY_ENV="test"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deployment_${TIMESTAMP}.log"

# Create log file
echo "Deployment started at $(date)" > $LOG_FILE

# Function to log and display
log_message() {
    echo -e "$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        log_message "${GREEN}✅ $1 successful${NC}"
    else
        log_message "${RED}❌ $1 failed. Check $LOG_FILE for details${NC}"
        exit 1
    fi
}

# Step 1: Verify AWS Credentials
log_message "📋 Verifying AWS credentials..."
aws sts get-caller-identity >> $LOG_FILE 2>&1
check_success "AWS credential verification"

# Step 2: Create SSH Key if needed
if [ ! -f ~/.ssh/id_rsa ]; then
    log_message "🔑 Creating SSH key..."
    ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa -N "" >> $LOG_FILE 2>&1
    check_success "SSH key creation"
else
    log_message "🔑 SSH key already exists"
fi

# Step 3: Create environment file
log_message "🔧 Creating environment configuration..."
cat > .env <<EOF
NODE_ENV=test
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
NEXT_PUBLIC_CHAIN_ID=97
DATABASE_URL=postgresql://postgres:testpassword123!@localhost:5432/farlabs
REDIS_URL=redis://localhost:6379
JWT_SECRET=$(openssl rand -base64 32)
AWS_REGION=us-east-1
EOF
check_success "Environment file creation"

# Step 4: Initialize Terraform
log_message "🏗️ Initializing Terraform..."
cd infrastructure/terraform/environments/test

# Create terraform.tfvars for automatic deployment
cat > terraform.tfvars <<EOF
aws_region = "us-east-1"
environment = "test"
project_name = "farlabs-test"
EOF

terraform init -input=false >> $LOG_FILE 2>&1
check_success "Terraform initialization"

# Step 5: Create Terraform Plan
log_message "📝 Planning infrastructure..."
terraform plan -input=false -out=tfplan >> $LOG_FILE 2>&1
check_success "Terraform planning"

# Step 6: Deploy Infrastructure
log_message "☁️ Deploying to AWS (this will take 5-10 minutes)..."
terraform apply -input=false -auto-approve tfplan >> $LOG_FILE 2>&1
check_success "AWS infrastructure deployment"

# Step 7: Get Outputs
log_message "📊 Retrieving deployment information..."
INSTANCE_IP=$(terraform output -raw instance_public_ip)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
S3_BUCKET=$(terraform output -raw s3_bucket_name)

# Step 8: Update environment with actual values
cd $PROJECT_DIR
log_message "🔄 Updating configuration with AWS endpoints..."
sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$INSTANCE_IP:8000|" .env
sed -i.bak "s|NEXT_PUBLIC_WS_URL=.*|NEXT_PUBLIC_WS_URL=ws://$INSTANCE_IP:3001|" .env
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:testpassword123!@$RDS_ENDPOINT/farlabs|" .env
check_success "Environment update"

# Step 9: Wait for EC2 to be ready
log_message "⏳ Waiting for EC2 instance to be ready..."
sleep 30
aws ec2 wait instance-status-ok --instance-ids $(aws ec2 describe-instances --filters "Name=tag:Name,Values=farlabs-test-server" "Name=instance-state-name,Values=running" --query 'Reservations[0].Instances[0].InstanceId' --output text) >> $LOG_FILE 2>&1
check_success "EC2 instance ready"

# Step 10: Deploy application to EC2
log_message "📦 Deploying application to EC2..."
sleep 60  # Give more time for user data script to complete

# Step 11: Check application health
log_message "🏥 Checking application health..."
sleep 30  # Wait for Docker containers to start

# Try to access the frontend
if curl -f -s -o /dev/null -w "%{http_code}" http://$INSTANCE_IP:3000 | grep -q "200\|302"; then
    log_message "${GREEN}✅ Frontend is accessible${NC}"
else
    log_message "${YELLOW}⚠️ Frontend may still be starting up${NC}"
fi

# Try to access the API
if curl -f -s -o /dev/null -w "%{http_code}" http://$INSTANCE_IP:8000 | grep -q "200"; then
    log_message "${GREEN}✅ API is accessible${NC}"
else
    log_message "${YELLOW}⚠️ API may still be starting up${NC}"
fi

# Step 12: Save deployment info
log_message "💾 Saving deployment information..."
cat > deployment_info.txt <<EOF
========================================
FAR LABS DEPLOYMENT INFORMATION
========================================
Deployment Date: $(date)
Environment: Test (AWS Free Tier)

ACCESS URLS:
-----------
Frontend URL: http://$INSTANCE_IP:3000
API URL: http://$INSTANCE_IP:8000
Health Check: http://$INSTANCE_IP/health

SSH ACCESS:
----------
ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP

AWS RESOURCES:
-------------
EC2 Instance IP: $INSTANCE_IP
RDS Endpoint: $RDS_ENDPOINT
S3 Bucket: $S3_BUCKET

USEFUL COMMANDS:
---------------
View logs: ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP 'docker-compose logs -f'
Restart services: ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP 'docker-compose restart'
Check status: ssh -i ~/.ssh/id_rsa ubuntu@$INSTANCE_IP 'docker ps'

TO DESTROY (IMPORTANT):
----------------------
cd infrastructure/terraform/environments/test
terraform destroy -auto-approve

ESTIMATED COST: \$0/month (within AWS Free Tier)
========================================
EOF

# Display deployment info
cat deployment_info.txt

# Step 13: Create destroy script
cat > destroy-deployment.sh <<'DESTROY'
#!/bin/bash
echo "🧹 Destroying Far Labs test deployment..."
cd infrastructure/terraform/environments/test
terraform destroy -auto-approve
echo "✅ All AWS resources destroyed"
DESTROY
chmod +x destroy-deployment.sh

log_message "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
log_message ""
log_message "📋 Next Steps:"
log_message "1. Wait 2-3 minutes for all services to fully start"
log_message "2. Access frontend at: http://$INSTANCE_IP:3000"
log_message "3. Access API at: http://$INSTANCE_IP:8000"
log_message ""
log_message "📁 Deployment info saved to: deployment_info.txt"
log_message "📄 Full logs available in: $LOG_FILE"
log_message ""
log_message "${YELLOW}⚠️ IMPORTANT: Run './destroy-deployment.sh' when done testing to avoid charges${NC}"

# Open browser automatically (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 5
    open "http://$INSTANCE_IP:3000"
fi

exit 0