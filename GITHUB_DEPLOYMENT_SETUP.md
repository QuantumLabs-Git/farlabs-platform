# 🚀 GitHub Automated Deployment Setup

This guide will help you set up automated deployment from GitHub to AWS EC2.

## 📋 Prerequisites

- GitHub account
- AWS account with EC2 instance running (✅ Already done at 54.145.42.136)
- Git installed locally

## 🔧 Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `farlabs-platform`
3. Choose "Private" or "Public" based on your preference
4. Don't initialize with README (we already have code)

## 🔑 Step 2: Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

### Required Secrets:

1. **AWS_ACCESS_KEY_ID**
   - Your AWS Access Key ID
   - Get from AWS IAM Console

2. **AWS_SECRET_ACCESS_KEY**
   - Your AWS Secret Access Key
   - Get from AWS IAM Console

3. **EC2_SSH_KEY**
   - Your private SSH key content
   - Copy the entire content of `~/.ssh/id_rsa`
   ```bash
   cat ~/.ssh/id_rsa
   ```
   - Paste the entire output including BEGIN and END lines

4. **DATABASE_URL**
   ```
   postgresql://postgres:testpassword123!@[RDS-ENDPOINT]:5432/farlabs
   ```

5. **JWT_SECRET**
   - Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

## 📦 Step 3: Push Code to GitHub

```bash
# Navigate to project directory
cd /Volumes/PRO-G40/Development/Far\ Labs/farlabs-platform

# Add all files
git add .

# Commit
git commit -m "Initial commit - Far Labs Platform"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/farlabs-platform.git

# Push to GitHub
git push -u origin main
```

## 🔄 Step 4: GitHub Actions Workflow

The workflow is already configured in `.github/workflows/deploy.yml`

It will automatically:
- ✅ Trigger on push to `main` branch
- ✅ Run tests
- ✅ Build Docker images
- ✅ Deploy to EC2 instance
- ✅ Update running services

## 🎯 Step 5: Deployment Flow

### Automatic Deployment Process:

1. **Developer pushes code** → GitHub
2. **GitHub Actions triggers** → Runs workflow
3. **Tests run** → Ensures code quality
4. **Docker images built** → Containerized apps
5. **Deploy to EC2** → Services updated
6. **Live in production** → Changes live!

### Manual Trigger:
You can also manually trigger deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy to AWS" workflow
3. Click "Run workflow"

## 📊 Step 6: Monitor Deployments

### Check deployment status:
- GitHub → Actions tab → View running/completed workflows

### View logs:
- Click on any workflow run to see detailed logs

### Access deployed services:
- Frontend: http://54.145.42.136:3000
- API: http://54.145.42.136:8000/docs

## 🛠️ Advanced Configuration

### Environment Variables

Add to `.github/workflows/deploy.yml` env section:
```yaml
env:
  NODE_ENV: production
  NEXT_PUBLIC_API_URL: http://54.145.42.136:8000
```

### Branch Protection

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

### Notifications

Add Slack/Discord notifications:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🚨 Troubleshooting

### SSH Key Issues
- Ensure the SSH key has no extra whitespace
- Use the private key, not public
- Include full BEGIN/END lines

### AWS Credentials Issues
- Verify IAM user has necessary permissions
- Check credentials are active in AWS Console

### Docker Issues
- Ensure EC2 has Docker installed
- Check disk space: `df -h`
- View logs: `docker logs container_name`

## 🔒 Security Best Practices

1. **Never commit secrets** to repository
2. **Use GitHub Secrets** for sensitive data
3. **Rotate credentials** regularly
4. **Enable 2FA** on GitHub
5. **Use branch protection** rules
6. **Review deployment logs** regularly

## 📈 Next Steps

1. Set up staging environment
2. Add automated testing
3. Implement rollback mechanism
4. Add performance monitoring
5. Set up alerts for failures

## 📞 Support

- GitHub Actions Documentation: https://docs.github.com/actions
- AWS Documentation: https://docs.aws.amazon.com
- Docker Documentation: https://docs.docker.com

---

## Quick Start Commands

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/farlabs-platform.git

# Make changes
cd farlabs-platform
# ... edit files ...

# Deploy changes
git add .
git commit -m "Your change description"
git push origin main

# Deployment happens automatically! 🎉
```

Your code will be deployed to AWS within 5-10 minutes of pushing to GitHub!