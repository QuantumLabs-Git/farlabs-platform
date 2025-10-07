#!/bin/bash

# GitHub Repository Setup Script for Far Labs Platform
# This script helps you connect your local repository to GitHub

echo "🚀 Far Labs Platform - GitHub Setup"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Please commit them first."
    exit 1
fi

echo "Please enter your GitHub username:"
read GITHUB_USERNAME

echo ""
echo "Creating repository URL: https://github.com/$GITHUB_USERNAME/farlabs-platform.git"
echo ""

# Check if origin already exists
if git remote | grep -q "origin"; then
    echo "Remote 'origin' already exists. Updating..."
    git remote set-url origin "https://github.com/$GITHUB_USERNAME/farlabs-platform.git"
else
    echo "Adding GitHub remote..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/farlabs-platform.git"
fi

echo ""
echo "✅ GitHub remote configured!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo "   Repository name: farlabs-platform"
echo "   Make it private or public as you prefer"
echo "   DON'T initialize with README"
echo ""
echo "2. Push your code to GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. Add GitHub Secrets (Settings → Secrets and variables → Actions):"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - EC2_SSH_KEY (content of ~/.ssh/id_rsa)"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo ""
echo "4. Your code will automatically deploy on every push to main!"
echo ""
echo "📚 Full instructions: GITHUB_DEPLOYMENT_SETUP.md"