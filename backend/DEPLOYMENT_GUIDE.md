# EduNova Backend - Deployment & Production Guide

## Version 8.0

This guide covers everything needed to deploy the EduNova backend to production environments.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Traditional Server Deployment](#traditional-server-deployment)
6. [Cloud Deployment (AWS/Azure/GCP)](#cloud-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Hardening](#security-hardening)
9. [Scaling Strategy](#scaling-strategy)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist (Phase 5 Production Readiness)

### Infrastructure & Runtime
- [ ] Set `NODE_ENV=production` and deploy behind HTTPS only.
- [ ] Set `DB_MODE=mongo` for stable production runtime (current API routes are Mongoose-backed).
- [ ] Provision production MongoDB (Atlas recommended) and verify connectivity from app host.
- [ ] Ensure process manager is configured (PM2/systemd/container orchestrator).
- [ ] Configure reverse proxy/load balancer liveness check to `GET /api/health` and readiness check to `GET /api/ready`.

### Secrets & Configuration
- [ ] Create `.env` from `.env.production.example` (never from local dev `.env`).
- [ ] Set strong `JWT_SECRET` (64+ chars random value).
- [ ] Set valid `MONGODB_URI`, `FRONTEND_URL`, and `CORS_ORIGIN` for production domains.
- [ ] Rotate Supabase keys if previously exposed and keep only placeholders in templates.
- [ ] Set real `EMAIL_SERVICE`, `EMAIL_USER`, and `EMAIL_PASS` credentials.
- [ ] Set Razorpay live keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) if live checkout is enabled.

### Security & Compliance
- [ ] Confirm Helmet, rate limiting, and input validation are enabled in production build.
- [ ] Restrict MongoDB network access to trusted IP ranges only.
- [ ] Ensure logs do not expose secrets or sensitive PII.
- [ ] Document rotation policy for JWT and provider secrets.

### Operations & Verification
- [ ] Install production dependencies with `npm ci --omit=dev`.
- [ ] Run runtime smoke checks for auth, payments, uploads, and monitoring endpoints.
- [ ] Configure structured log shipping and alerting for `error` and `warn` events.
- [ ] Verify backup and restore procedure for database and uploaded media.
- [ ] Capture rollback plan before first production deployment.

---

## Environment Setup

### 1. Create `.env` File

Copy `.env.production.example` and configure for production:

```bash
# Copy template
cp .env.production.example .env

# Edit with production values
nano .env
```

### 2. Required Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production
DB_MODE=mongo
LOG_LEVEL=info
AUDIT_LOGGING_ENABLED=true

# App URLs
FRONTEND_URL=https://app.edunova.example
CORS_ORIGIN=https://app.edunova.example

# Database
# Current production contract: MongoDB required in DB_MODE=mongo
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/edunova?retryWrites=true&w=majority

# Optional in DB_MODE=mongo; required in DB_MODE=supabase/hybrid
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=replace-with-supabase-anon-key-from-api-settings
SUPABASE_SERVICE_KEY=replace-with-supabase-service-role-key-from-api-settings

# Auth
JWT_SECRET=generate-64-plus-char-random-value
JWT_EXPIRE=7d

# Email (required by validation)
EMAIL_SERVICE=gmail
EMAIL_USER=notifications@edunova.example
EMAIL_PASS=app-password-or-provider-secret

# Payments
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Upload path (local or mounted volume)
UPLOAD_PATH=./uploads

# Phase 3 ops settings
ENABLE_RESPONSE_CACHE=true
CACHE_TTL_SECONDS=120
PERF_SLOW_REQUEST_MS=1000
PERF_MAX_ROUTE_SAMPLES=200

# Optional
SENTRY_DSN=
```

### 3. Generate Strong JWT Secret

```bash
# Generate random string (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate random string (128 hex chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database Configuration

### Option 1: MongoDB Atlas (Cloud)

**Recommended for production.**

1. **Create Account & Cluster**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free tier cluster (or paid for production)
   - Create database user with strong password
   - Configure IP whitelist

2. **Get Connection String**
   - Click "Connect" on cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Add `/edunova` to database name

3. **Test Connection**
   ```bash
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✓ Connected')).catch(e => console.error('✗ Error:', e.message))"
   ```

### Option 2: Self-Hosted MongoDB

1. **Install MongoDB Community Server**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb-org

   # macOS
   brew tap mongodb/brew
   brew install mongodb-community

   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongod

   # macOS
   brew services start mongodb-community

   # Windows
   mongod
   ```

3. **Set Connection String**
   ```env
   MONGODB_URI=mongodb://localhost:27017/edunova
   ```

4. **Create Admin User** (Optional but recommended)
   ```bash
   mongosh
   > use admin
   > db.createUser({user: "admin", pwd: "strongpassword", roles: ["root"]})
   > use edunova
   > db.createUser({user: "edunova", pwd: "dbpassword", roles: ["readWrite"]})
   ```

---

## Docker Deployment

### 1. Use Included Container Files

The repository already includes production container assets:

- `backend/Dockerfile`
- `backend/.dockerignore`
- `backend/docker-compose.production.yml`

### 2. Create .dockerignore

```
node_modules
.env
.git
.gitignore
README.md
.vscode
```

### 3. Build and Run Docker Image

```bash
# Build image
docker build -t edunova-backend:3.6 .

# Run container
docker run -d \
  --name edunova-backend \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/edunova" \
  -e JWT_SECRET="your-secret-key" \
  -e NODE_ENV="production" \
  edunova-backend:3.6

# View logs
docker logs -f edunova-backend
```

### 4. Docker Compose Setup

```bash
# Start production composition from included file
docker compose -f docker-compose.production.yml up -d --build

# Check services
docker compose -f docker-compose.production.yml ps

# Stream backend logs
docker compose -f docker-compose.production.yml logs -f backend
```

**Note:** `docker-compose.production.yml` mounts `./uploads` for media persistence and runs MongoDB + backend together for self-hosted deployments.

---

## CI/CD Baseline

The repository includes a backend CI workflow at `.github/workflows/backend-ci.yml`.

- Trigger: push/pull request affecting `backend/**`
- Runtime: Node 20
- Checks: install dependencies and run `npm run test:ci`
- Smoke check script: `backend/scripts/ciSmoke.js`

`ciSmoke.js` validates:

- JavaScript syntax for backend source files
- Required environment keys in both `.env.example` and `.env.production.example`
- DB mode contract (`DB_MODE=mongo|supabase|hybrid`) and corresponding DB key presence
- Required deployment artifacts (Dockerfile, .dockerignore, server entry)

Critical API contract checks are executed via `npm run test:integration:critical` for:

- Auth route (`/api/auth/login`)
- Course list and enroll route mounting (`/api/courses`, `/api/courses/:id/enroll`)
- Payment verification auth guard (`/api/payments/verify`)
- Upload auth guard (`/api/uploads/image`)
- Health and readiness endpoints (`/api/health`, `/api/ready`)

---

## Production Rehearsal Workflow (Phase 8.1)

Run one production-like rehearsal before every release cut:

```bash
npm run rehearse:production
```

This executes:

1. Compose build/start of production stack.
2. Health and readiness contract checks.
3. Mongo backup rehearsal (`mongodump --archive`).
4. Mongo restore rehearsal (`mongorestore --archive --drop`).
5. Backend container force-recreate (rollback rehearsal path).

If Docker is unavailable in the runner environment, run the rehearsal on the deployment host or CI runner with Docker Engine installed.

---

## Traditional Server Deployment

### 1. Install Node.js and npm

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v && npm -v
```

### 2. Clone Repository

```bash
cd /var/www
git clone https://github.com/your-org/edunova-backend.git
cd edunova-backend
```

### 3. Install Dependencies

```bash
npm ci --production
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with production values
```

### 5. Setup PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "edunova-api" --env production

# Save configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### 6. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/edunova-api

upstream edunova_api {
    server localhost:5000;
}

server {
    listen 80;
    server_name api.edunova.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.edunova.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.edunova.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.edunova.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json;
    
    # Proxy settings
    location /api {
        proxy_pass http://edunova_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable Nginx site:**
```bash
sudo ln -s /etc/nginx/sites-available/edunova-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d api.edunova.com

# Auto-renewal (Certbot automatically adds this)
sudo systemctl enable certbot.timer
```

---

## Cloud Deployment

### AWS Elastic Beanstalk

1. **Install AWS CLI & EB CLI**
   ```bash
   npm install -g aws-cli @aws-amplify/cli
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   eb init -p "Node.js 18 running on 64bit Amazon Linux 2" edunova-api
   eb create edunova-prod
   ```

3. **Deploy**
   ```bash
   eb deploy
   ```

### Azure App Service

1. **Create Resource Group**
   ```bash
   az group create --name edunova-rg --location eastus
   ```

2. **Create App Service Plan**
   ```bash
   az appservice plan create --name edunova-plan \
     --resource-group edunova-rg --sku B1 --is-linux
   ```

3. **Create Web App**
   ```bash
   az webapp create --resource-group edunova-rg \
     --plan edunova-plan --name edunova-api \
     --runtime "NODE|18-lts"
   ```

4. **Configure Environment Variables**
   ```bash
   az webapp config appsettings set --resource-group edunova-rg \
     --name edunova-api \
     --settings MONGODB_URI="..." JWT_SECRET="..." NODE_ENV="production"
   ```

5. **Deploy Code**
   ```bash
   az webapp up --resource-group edunova-rg --name edunova-api
   ```

### Google Cloud Run

```bash
# Create dockerfile if not exists
# Deploy to Cloud Run
gcloud run deploy edunova-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URI=...,JWT_SECRET=...,NODE_ENV=production"
```

---

## Monitoring & Logging

### 1. PM2 Monitoring

```bash
# Start PM2 monitoring
pm2 monit

# Generate PM2 report
pm2 report

# View logs
pm2 logs edunova-api
```

### 2. Application Error Tracking (Sentry)

```bash
# Install Sentry SDK
npm install @sentry/node

# Initialize in server.js
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Structured Logging

```bash
# Install Winston logger
npm install winston

# Configure logging (update server.js)
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

---

## Security Hardening

### 1. Update Dependencies

```bash
npm audit
npm audit fix
npm update
```

### 2. Rate Limiting

```bash
# Install express-rate-limit
npm install express-rate-limit

# Use in server.js
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### 3. Input Validation

```bash
# Install express-validator (already in dependencies)
npm install express-validator
```

### 4. HELMET Security Headers

```bash
npm install helmet

# Use in server.js
const helmet = require('helmet');
app.use(helmet());
```

### 5. MongoDB Connection Security

- Enable authentication in MongoDB
- Use IP whitelist in MongoDB Atlas
- Restrict database user permissions
- Use TLS/SSL for connections
- Enable database encryption at rest

---

## Scaling Strategy

### Horizontal Scaling (Load Balancing)

```nginx
# Multiple instances behind load balancer
upstream edunova_cluster {
    server api1.edunova.com:5000;
    server api2.edunova.com:5000;
    server api3.edunova.com:5000;
}
```

### Vertical Scaling

- Increase server RAM and CPU
- Optimize database queries (indexing)
- Implement caching (Redis)
- Compress responses (gzip)

### Database Optimization

```javascript
// Add indexes to frequently queried fields
db.users.createIndex({ email: 1 });
db.courses.createIndex({ categoryId: 1 });
db.enrollments.createIndex({ userId: 1, courseId: 1 });
```

### Caching Layer (Redis)

```bash
npm install redis

# Use in routes
const redis = require('redis');
const client = redis.createClient();
```

---

## Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
1. Check connection string is correct
2. Verify IP is whitelisted in MongoDB Atlas
3. Ensure database user password doesn't contain special characters that need escaping
4. Test with: `mongosh "mongodb+srv://..."`

### Issue: JWT Token Not Working

**Solution:**
1. Verify JWT_SECRET is set in .env
2. Ensure token is being sent in `Authorization: Bearer {token}` format
3. Check token hasn't expired (7 days)
4. Refresh token if needed

### Issue: CORS Errors

**Solution:**
1. Verify frontend domain matches CORS_ORIGIN
2. Check if protocol is correct (http vs https)
3. Verify port is correct if running on non-standard port
4. Clear browser cache and cookies

### Issue: Server Crashes on Startup

**Solution:**
1. Check all environment variables are set: `env | grep -i edunova`
2. Verify MongoDB connection: `curl http://localhost:5000/api/health`
3. Check logs: `pm2 logs edunova-api`
4. Review .env file format (no quotes, proper syntax)

### Issue: High Memory Usage

**Solution:**
1. Check for memory leaks: `pm2 monitoring`
2. Limit log file size
3. Implement pagination for large queries
4. Use database connection pooling
5. Clear old logs regularly

---

## Backup Strategy

### Daily Database Backups

```bash
# MongoDB Atlas: Automated backups (included)

# Self-hosted backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/edunova" \
  --out "/backups/edunova_$TIMESTAMP"
tar -czf "/backups/edunova_$TIMESTAMP.tar.gz" "/backups/edunova_$TIMESTAMP"
rm -rf "/backups/edunova_$TIMESTAMP"
```

### Add Cron Job
```bash
# Daily backup at 2 AM
0 2 * * * /home/edunova/backup.sh
```

---

## Version History

- **v3.6**: Complete deployment guide with Docker, traditional server, and cloud options
- **v3.5**: Initial production guidelines
