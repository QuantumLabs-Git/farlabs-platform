#!/bin/bash

# Simple deployment script to get frontend running quickly

echo "Deploying Far Labs Frontend..."

# Kill any existing processes on port 3000
ssh -i ~/.ssh/id_rsa ubuntu@54.145.42.136 << 'EOF'
# Stop any existing containers
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Kill any process on port 3000
sudo fuser -k 3000/tcp 2>/dev/null || true

# Start Python HTTP server with the simple frontend
cd ~
nohup python3 -m http.server 3000 --bind 0.0.0.0 > /dev/null 2>&1 &

echo "Simple frontend deployed on port 3000"
EOF

echo "Frontend should now be accessible at http://54.145.42.136:3000/simple-frontend.html"