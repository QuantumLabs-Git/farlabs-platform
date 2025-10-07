terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables for free tier deployment
variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "test"
}

variable "project_name" {
  description = "Project name"
  default     = "farlabs-test"
}

# =================================================================
# FREE TIER OPTIMIZED RESOURCES
# =================================================================

# VPC (Free)
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
    Cost        = "free"
  }
}

# Internet Gateway (Free)
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
    Cost = "free"
  }
}

# Public Subnet (Free) - Single AZ for cost saving
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public"
    Type = "public"
    Cost = "free"
  }
}

# Route Table (Free)
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
    Cost = "free"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group for EC2 (Free)
resource "aws_security_group" "web" {
  name        = "${var.project_name}-web-sg"
  description = "Security group for web traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict this to your IP in production
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-web-sg"
    Cost = "free"
  }
}

# EC2 Instance (t2.micro - Free Tier)
resource "aws_instance" "main" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro" # Free tier eligible
  subnet_id     = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name      = aws_key_pair.deployer.key_name

  # User data to install Docker and Docker Compose
  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io docker-compose git
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu

    # Clone repository (you'll need to update this with your repo)
    cd /home/ubuntu
    git clone https://github.com/yourusername/farlabs-platform.git
    cd farlabs-platform

    # Create .env file
    cat > .env <<'ENVFILE'
    NODE_ENV=test
    NEXT_PUBLIC_API_URL=http://localhost:8000
    NEXT_PUBLIC_WS_URL=ws://localhost:3001
    NEXT_PUBLIC_BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
    DATABASE_URL=postgresql://postgres:password@localhost:5432/farlabs
    REDIS_URL=redis://localhost:6379
    JWT_SECRET=test-secret-key-change-in-production
    ENVFILE

    # Start services with docker-compose
    docker-compose up -d
  EOF

  tags = {
    Name        = "${var.project_name}-server"
    Environment = var.environment
    Cost        = "free-tier"
  }
}

# Create Key Pair for SSH access
resource "aws_key_pair" "deployer" {
  key_name   = "${var.project_name}-key"
  public_key = file("~/.ssh/id_rsa.pub") # You need to have SSH key generated

  tags = {
    Name = "${var.project_name}-keypair"
  }
}

# RDS (t3.micro - Free Tier for 12 months)
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = [aws_subnet.public.id, aws_subnet.public_secondary.id]

  tags = {
    Name = "${var.project_name}-db-subnet"
  }
}

# Additional subnet for RDS (requires 2 subnets)
resource "aws_subnet" "public_secondary" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-secondary"
    Type = "public"
    Cost = "free"
  }
}

resource "aws_route_table_association" "public_secondary" {
  subnet_id      = aws_subnet.public_secondary.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-postgres"
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro" # Free tier eligible

  allocated_storage = 20 # Free tier includes 20GB
  storage_type      = "gp2"
  storage_encrypted = false # Encryption not available in free tier

  db_name  = "farlabs"
  username = "postgres"
  password = "testpassword123!" # Change this!

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  skip_final_snapshot = true
  deletion_protection = false

  # Free tier settings
  backup_retention_period = 0 # Disable backups to save costs
  multi_az               = false # Single AZ for free tier

  tags = {
    Name        = "${var.project_name}-database"
    Environment = var.environment
    Cost        = "free-tier"
  }
}

# S3 Bucket (5GB free)
resource "aws_s3_bucket" "static" {
  bucket = "${var.project_name}-static-${random_id.bucket.hex}"

  tags = {
    Name        = "${var.project_name}-static"
    Environment = var.environment
    Cost        = "free-tier-5gb"
  }
}

resource "random_id" "bucket" {
  byte_length = 4
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static" {
  bucket = aws_s3_bucket.static.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static.arn}/*"
      }
    ]
  })
}

# CloudWatch (Free tier: 10 custom metrics, 5GB logs)
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/farlabs/${var.environment}"
  retention_in_days = 1 # Minimize retention for cost

  tags = {
    Name        = "${var.project_name}-logs"
    Environment = var.environment
    Cost        = "free-tier"
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Outputs
output "instance_public_ip" {
  value       = aws_instance.main.public_ip
  description = "Public IP of the EC2 instance"
}

output "instance_public_dns" {
  value       = aws_instance.main.public_dns
  description = "Public DNS of the EC2 instance"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS instance endpoint"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.static.id
  description = "Name of the S3 bucket"
}

output "application_url" {
  value       = "http://${aws_instance.main.public_ip}:3000"
  description = "URL to access the application"
}

output "api_url" {
  value       = "http://${aws_instance.main.public_ip}:8000"
  description = "URL to access the API"
}

output "ssh_command" {
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_instance.main.public_ip}"
  description = "SSH command to connect to the instance"
}