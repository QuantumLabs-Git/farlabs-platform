# 🚀 AWS Free Tier Deployment Guide

## Complete Step-by-Step Instructions for Test Deployment

### 📊 Free Tier Resources Used

| Service | Free Tier Allowance | Our Usage | Cost |
|---------|-------------------|-----------|------|
| EC2 | 750 hrs/month t2.micro | 1 instance | $0 |
| RDS | 750 hrs/month db.t3.micro | 1 PostgreSQL | $0 |
| S3 | 5GB storage | Static assets | $0 |
| Data Transfer | 15GB/month | Normal usage | $0 |
| CloudWatch | 10 metrics, 5GB logs | Basic monitoring | $0 |

**Estimated Monthly Cost: $0** (within free tier limits)

---

## 📋 Prerequisites

### 1. AWS Account Setup
- [ ] Create AWS account (if not already done)
- [ ] Complete account verification
- [ ] Add payment method (required but won't be charged within free tier)

### 2. Local Tools Installation

```bash
# macOS
brew install awscli terraform

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscli.zip"
unzip awscli.zip
sudo ./aws/install

# Windows
# Download installers from:
# AWS CLI: https://aws.amazon.com/cli/
# Terraform: https://www.terraform.io/downloads
```

### 3. AWS IAM Setup

1. **Go to AWS Console** → IAM → Users
2. **Create New User** → "farlabs-deploy"
3. **Attach Policies**:
   - AmazonEC2FullAccess
   - AmazonRDSFullAccess
   - AmazonS3FullAccess
   - AmazonVPCFullAccess
   - IAMFullAccess (for creating roles)
4. **Create Access Key** → Save credentials

---

## 🔧 Step 1: Initial Setup

```bash
# Clone or navigate to project
cd /Volumes/PRO-G40/Development/Far\ Labs/farlabs-platform

# Make deployment script executable
chmod +x deploy-test.sh

# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

---

## 🔐 Step 2: Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter when prompted:
AWS Access Key ID: [your-access-key]
AWS Secret Access Key: [your-secret-key]
Default region name: us-east-1
Default output format: json

# Verify configuration
aws sts get-caller-identity
```

---

## 🧪 Step 3: Test Locally First (Recommended)

```bash
# Start local services
docker-compose -f docker-compose.test.yml up -d

# Check services are running
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3000  # Frontend
curl http://localhost:8000  # API

# Stop when ready
docker-compose down
```

---

## ☁️ Step 4: Deploy to AWS

### Option A: Using Automated Script (Easiest)

```bash
# Run deployment script
./deploy-test.sh

# Follow the prompts
# The script will:
# 1. Check prerequisites
# 2. Configure AWS
# 3. Create SSH keys
# 4. Setup environment
# 5. Deploy infrastructure
```

### Option B: Manual Deployment

```bash
# Navigate to Terraform directory
cd infrastructure/terraform/environments/test

# Initialize Terraform
terraform init

# Review what will be created
terraform plan

# Deploy infrastructure (type 'yes' when prompted)
terraform apply

# Save outputs
terraform output > deployment-info.txt
```

---

## 🖥️ Step 5: Access Your Deployment

After deployment completes, you'll get:

```bash
# Outputs:
instance_public_ip = "54.123.45.67"
application_url = "http://54.123.45.67:3000"
api_url = "http://54.123.45.67:8000"
ssh_command = "ssh -i ~/.ssh/id_rsa ubuntu@54.123.45.67"
```

### Connect to Your Server

```bash
# SSH into the EC2 instance
ssh -i ~/.ssh/id_rsa ubuntu@[YOUR-IP]

# Check Docker services
sudo docker ps

# View logs
sudo docker-compose logs -f

# Restart services if needed
sudo docker-compose restart
```

---

## 🔍 Step 6: Verify Deployment

### 1. Check Frontend
- Open browser: `http://[YOUR-IP]:3000`
- Should see Far Labs homepage

### 2. Check API
- Open: `http://[YOUR-IP]:8000`
- Should see API documentation

### 3. Check Database Connection
```bash
# SSH into instance
ssh -i ~/.ssh/id_rsa ubuntu@[YOUR-IP]

# Check database
sudo docker exec -it farlabs-platform_postgres_1 psql -U postgres -d farlabs -c "\dt"
```

---

## 🛠️ Step 7: Post-Deployment Configuration

### Update Environment Variables

```bash
# SSH into instance
ssh -i ~/.ssh/id_rsa ubuntu@[YOUR-IP]

# Edit environment file
cd farlabs-platform
nano .env

# Update with actual RDS endpoint
DATABASE_URL=postgresql://postgres:testpassword123!@[RDS-ENDPOINT]:5432/farlabs

# Restart services
sudo docker-compose restart
```

### Configure Domain (Optional)

1. **Route 53** → Create Hosted Zone
2. Add A record pointing to EC2 IP
3. Update NGINX configuration

---

## 📊 Step 8: Monitoring

### CloudWatch Dashboards

1. Go to AWS Console → CloudWatch
2. Create Dashboard → "FarLabs-Test"
3. Add widgets:
   - EC2 CPU Utilization
   - RDS Connections
   - S3 Requests

### Application Logs

```bash
# View real-time logs
ssh -i ~/.ssh/id_rsa ubuntu@[YOUR-IP]
sudo docker-compose logs -f frontend
sudo docker-compose logs -f inference
```

---

## 🧹 Step 9: Cleanup (Important!)

**To avoid charges after testing:**

```bash
# Navigate to Terraform directory
cd infrastructure/terraform/environments/test

# Destroy all resources
terraform destroy

# Type 'yes' to confirm

# Verify in AWS Console that all resources are deleted
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Cannot connect to application
```bash
# Check security group allows traffic
aws ec2 describe-security-groups --group-ids [sg-xxx]

# Check Docker is running
ssh -i ~/.ssh/id_rsa ubuntu@[IP] 'sudo docker ps'
```

#### 2. Database connection failed
```bash
# Test RDS connectivity
telnet [rds-endpoint] 5432

# Check security group allows PostgreSQL port
```

#### 3. High memory usage
```bash
# SSH and check resources
ssh -i ~/.ssh/id_rsa ubuntu@[IP]
free -h
docker stats
```

---

## 💰 Cost Management

### Stay Within Free Tier

1. **Monitor Usage**:
   - AWS Console → Billing Dashboard
   - Set up billing alerts

2. **Free Tier Limits**:
   - EC2: 750 hours/month (31 days × 24 hours = 744 hours ✅)
   - RDS: 750 hours/month
   - Don't run multiple instances

3. **Set Billing Alerts**:
```bash
# AWS Console → Billing → Budgets
# Create budget: $5/month
# Get email alerts before charges
```

---

## 📝 Next Steps

Once test deployment is working:

1. **Add Custom Domain**
   - Register domain
   - Configure Route 53
   - Add SSL certificate

2. **Deploy Smart Contracts**
   - Deploy to BSC Testnet
   - Update contract addresses

3. **Scale for Production**
   - Upgrade instance types
   - Add load balancing
   - Enable Multi-AZ RDS
   - Add CloudFront CDN

---

## 🆘 Need Help?

### Resources
- AWS Free Tier FAQ: https://aws.amazon.com/free/free-tier-faqs/
- Terraform Docs: https://registry.terraform.io/providers/hashicorp/aws/latest
- Docker Docs: https://docs.docker.com/

### Check AWS Service Health
- https://status.aws.amazon.com/

### View Your Costs
- AWS Console → Billing → Cost Explorer

---

## ✅ Deployment Checklist

- [ ] AWS account created and verified
- [ ] AWS CLI installed and configured
- [ ] Terraform installed
- [ ] Docker installed
- [ ] SSH key generated
- [ ] Environment variables configured
- [ ] Local test successful
- [ ] AWS resources deployed
- [ ] Application accessible
- [ ] Monitoring configured
- [ ] Billing alerts set
- [ ] Documentation reviewed

---

**Remember:** This is a TEST deployment. Always destroy resources when not in use to avoid charges!