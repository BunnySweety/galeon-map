# Deployment Guide

This document outlines the process for deploying the Hospital Map application to various environments.

## Table of Contents
- [Deployment Guide](#deployment-guide)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Deployment Environments](#deployment-environments)
    - [Production](#production)
    - [Staging](#staging)
  - [Deployment Process](#deployment-process)
    - [Manual Deployment](#manual-deployment)
    - [Automated CI/CD](#automated-cicd)
    - [Docker Deployment](#docker-deployment)
  - [Monitoring \& Maintenance](#monitoring--maintenance)
    - [Health Checks](#health-checks)
    - [Rollback Procedure](#rollback-procedure)
    - [Performance Monitoring](#performance-monitoring)
    - [Database Migrations](#database-migrations)
    - [CDN Cache Management](#cdn-cache-management)
    - [SSL/TLS Configuration](#ssltls-configuration)
    - [Backup Procedures](#backup-procedures)
    - [Disaster Recovery](#disaster-recovery)
    - [Security Procedures](#security-procedures)
    - [Release Process](#release-process)
    - [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18 or higher
- AWS CLI configured with appropriate credentials
- Docker (optional for containerized deployment)
- Access to deployment environments

## Environment Configuration

1. Create environment files:
```bash
cp .env.example .env.production
cp .env.example .env.staging
```

2. Configure environment variables:
```env
# Production
VITE_APP_ENV=production
VITE_API_URL=https://api.hospitalmap.com
VITE_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
VITE_SENTRY_DSN=your_sentry_dsn
AWS_S3_BUCKET=production-hospital-map
AWS_CLOUDFRONT_ID=production_distribution_id

# Staging
VITE_APP_ENV=staging
VITE_API_URL=https://api-staging.hospitalmap.com
AWS_S3_BUCKET=staging-hospital-map
AWS_CLOUDFRONT_ID=staging_distribution_id
```

## Deployment Environments

### Production

- Domain: https://hospitalmap.com
- AWS Region: eu-west-1
- S3 Bucket: production-hospital-map
- CloudFront Distribution: XXXXXXXXXXXXX

### Staging

- Domain: https://staging.hospitalmap.com
- AWS Region: eu-west-1
- S3 Bucket: staging-hospital-map
- CloudFront Distribution: XXXXXXXXXXXXX

## Deployment Process

### Manual Deployment

1. Build the application:
```bash
# Install dependencies
npm ci

# Build for production
npm run build
```

2. Deploy to AWS:
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Automated CI/CD

The application uses GitHub Actions for automated deployments:

1. Push to `develop` branch:
   - Triggers staging deployment
   - Runs tests and builds
   - Deploys to staging environment

2. Push to `main` branch:
   - Triggers production deployment
   - Runs tests and builds
   - Deploys to production environment
   - Creates release tag

### Docker Deployment

1. Build Docker image:
```bash
docker build -t hospital-map:latest .
```

2. Run container:
```bash
docker run -p 80:80 hospital-map:latest
```

## Monitoring & Maintenance

### Health Checks

- API Health: https://api.hospitalmap.com/health
- Frontend Status: https://hospitalmap.com/status
- Monitoring Dashboard: https://grafana.hospitalmap.com

### Rollback Procedure

1. Identify the last stable version
2. Execute rollback:
```bash
npm run rollback -- --version=X.X.X
```

3. Verify deployment:
- Check application status
- Run smoke tests
- Monitor error rates

### Performance Monitoring

1. Metrics to Monitor:
- Page Load Time
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

2. Tools:
```bash
# Run Lighthouse audit
npm run lighthouse

# Check bundle size
npm run analyze
```

3. Set up alerts:
```json
{
  "alerts": {
    "errorRate": {
      "threshold": "1%",
      "window": "5m"
    },
    "responseTime": {
      "threshold": "2s",
      "window": "5m"
    }
  }
}
```

### Database Migrations

1. Run migrations:
```bash
npm run migrate:up
```

2. Rollback migrations:
```bash
npm run migrate:down
```

### CDN Cache Management

1. Invalidate cache:
```bash
# Invalidate all files
aws cloudfront create-invalidation \
  --distribution-id ${AWS_CLOUDFRONT_ID} \
  --paths "/*"

# Invalidate specific paths
aws cloudfront create-invalidation \
  --distribution-id ${AWS_CLOUDFRONT_ID} \
  --paths "/index.html" "/assets/*"
```

2. Cache settings:
```nginx
# Cache-Control headers
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location / {
    add_header Cache-Control "public, max-age=0, must-revalidate";
}
```

### SSL/TLS Configuration

1. Certificate renewal:
```bash
# Check certificate expiry
aws acm list-certificates

# Renew certificate
aws acm import-certificate \
  --certificate-arn arn:aws:acm:region:account:certificate/certificate-id \
  --certificate file://cert.pem \
  --private-key file://privkey.pem \
  --certificate-chain file://chain.pem
```

2. Security headers:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

### Backup Procedures

1. Database backups:
```bash
# Create backup
npm run backup:create

# Restore backup
npm run backup:restore --file=backup_20240101.sql
```

2. S3 backup policy:
```json
{
  "Rules": [
    {
      "ID": "Daily Backups",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "backups/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

### Disaster Recovery

1. Recovery Point Objective (RPO): 24 hours
2. Recovery Time Objective (RTO): 1 hour

Recovery Steps:
```bash
# 1. Restore latest backup
npm run dr:restore-backup

# 2. Verify data integrity
npm run dr:verify-data

# 3. Switch to backup region
aws route53 change-resource-record-sets \
  --hosted-zone-id ${HOSTED_ZONE_ID} \
  --change-batch file://dns-failover.json

# 4. Verify application health
npm run dr:health-check
```

### Security Procedures

1. Regular security scans:
```bash
# Run security audit
npm audit

# Run OWASP ZAP scan
npm run security:zap-scan

# Check dependencies
npm run security:snyk
```

2. Access Management:
```bash
# Review IAM policies
aws iam list-policies

# Rotate access keys
aws iam create-access-key
aws iam delete-access-key
```

### Release Process

1. Create release:
```bash
npm run release
```

2. Release checklist:
- [ ] Update version numbers
- [ ] Update changelog
- [ ] Run tests
- [ ] Build assets
- [ ] Deploy to staging
- [ ] Verify staging deployment
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Tag release
- [ ] Update documentation

### Troubleshooting

1. Common issues:
```bash
# Check logs
npm run logs:prod

# Monitor errors
npm run monitor:errors

# Check performance
npm run monitor:performance
```

2. Debug mode:
```bash
# Enable debug mode
export DEBUG=true
npm run start:debug
```

3. Support contacts:
- Technical Lead: tech.lead@hospitalmap.com
- DevOps: devops@hospitalmap.com
- Security: security@hospitalmap.com