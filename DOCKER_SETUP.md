# Docker Setup Guide for I-Dashboard

## Overview
This project uses Docker to containerize the entire full-stack application:
- **Frontend**: React + Vite served via Nginx
- **Backend**: Node.js Express server
- **Database**: MongoDB (local container)
- **Orchestration**: Docker Compose manages all three services

## Prerequisites
- Docker (version 20.10+)
- Docker Compose (version 1.29+)
- At least 2GB RAM available for containers

## Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│         Docker Network: i-dashboard-network          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────┐ │
│  │   Frontend   │   │   Backend    │  │ MongoDB  │ │
│  │ (Nginx:80)   │──▶│(Express:5000)│◀─┤(Port:27)│ │
│  │              │   │              │  │  017)    │ │
│  └──────────────┘   └──────────────┘  └──────────┘ │
│                                                      │
│  All services communicate via container hostname    │
│  - frontend ↔ backend (nginx proxy)                 │
│  - backend ↔ mongodb (connection string)            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Clone and Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```env
# Optional: Change MongoDB credentials
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=admin123
MONGO_DB_NAME=i_dashboard

# Required: Add your service keys
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
STRIPE_SECRET_KEY=sk_test_xxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Build and Run with Docker Compose

#### Start all services (first time - includes build):
```bash
docker-compose up --build
```

#### Run in background:
```bash
docker-compose up -d --build
```

#### Subsequent starts (no rebuild):
```bash
docker-compose up -d
```

#### View real-time logs:
```bash
docker-compose logs -f

# Specific service logs:
docker-compose logs -f mongodb
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Access the Application
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000
- **MongoDB Admin**: mongodb://localhost:27017 (requires client like MongoDB Compass)

## MongoDB Local Setup

### Connection Details
```
Host: mongodb (inside Docker network) or localhost (from host machine)
Port: 27017
Root User: admin (from MONGO_ROOT_USER env var)
Root Password: admin123 (from MONGO_ROOT_PASSWORD env var)
Database: i_dashboard (from MONGO_DB_NAME env var)

Connection String (from backend):
mongodb://admin:admin123@mongodb:27017/i_dashboard?authSource=admin
```

### First-Time Setup
On first run, MongoDB automatically:
1. Creates the root user
2. Creates collections: users, products, orders, banners, payments
3. Creates indexes for better performance

See `init-mongo.js` for initialization details.

### Connect with MongoDB Compass (GUI Tool)
```
mongodb://admin:admin123@localhost:27017/?authSource=admin
```

### Connect with mongosh (CLI)
```bash
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Inside mongosh:
> use i_dashboard
> db.users.find()
> db.collections()
```

### Backup MongoDB Data
```bash
# Create backup
docker-compose exec mongodb mongodump -u admin -p admin123 --authenticationDatabase admin --out /tmp/backup

# Copy backup to host machine
docker cp i-dashboard-mongodb:/tmp/backup ./mongodb-backup
```

### Restore MongoDB Data
```bash
# Copy backup to container
docker cp ./mongodb-backup i-dashboard-mongodb:/tmp/restore

# Restore in container
docker-compose exec mongodb mongorestore -u admin -p admin123 --authenticationDatabase admin /tmp/restore
```

## Common Commands

### Stop all services:
```bash
docker-compose down
```

### Remove all data (careful!):
```bash
docker-compose down -v
```

### Rebuild services without cache:
```bash
docker-compose build --no-cache
```

### Rebuild specific service:
```bash
docker-compose build --no-cache backend
docker-compose build --no-cache mongodb
```

### View service status:
```bash
docker-compose ps
```

### Execute commands in containers:
```bash
# Backend npm commands
docker-compose exec backend npm install package-name

# MongoDB commands
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Frontend shell
docker-compose exec frontend sh
```

### View resource usage:
```bash
docker stats
```

## Troubleshooting

### MongoDB Connection Refused
```bash
# Check if MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Ensure backend waits for MongoDB
docker-compose up --build
```

### Port Already in Use
Modify `docker-compose.yml`:
```yaml
mongodb:
  ports:
    - "27018:27017"  # Change from 27017 to 27018

frontend:
  ports:
    - "8080:80"      # Change from 80 to 8080
```

### Cannot Connect from Host
```bash
# MongoDB should be accessible at localhost:27017
# But inside containers, use: mongodb:27017

# Test from host:
mongosh "mongodb://admin:admin123@localhost:27017/?authSource=admin"
```

### Backend Cannot Reach MongoDB
1. Check MongoDB is running: `docker-compose ps`
2. Check MongoDB health: `docker-compose logs mongodb`
3. Verify MONGO_URL in backend env vars matches docker-compose

### Rebuild Cache Issues
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Data Persistence

MongoDB data is automatically persisted in Docker volumes:
- `mongodb_data`: Contains database files
- `mongodb_config`: Contains MongoDB configuration

Even if containers stop, data remains. To clear all data:
```bash
docker-compose down -v
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| MONGO_ROOT_USER | admin | MongoDB root username |
| MONGO_ROOT_PASSWORD | admin123 | MongoDB root password |
| MONGO_DB_NAME | i_dashboard | Application database name |
| PORT | 5000 | Backend server port |
| JWT_SECRET | - | Required: JWT signing secret |
| SESSION_SECRET | - | Required: Session secret |
| STRIPE_SECRET_KEY | - | Required: Stripe secret key |
| CLOUDINARY_CLOUD_NAME | - | Required: Cloudinary cloud name |
| EMAIL_USER | - | Optional: Email sender |
| EMAIL_PASS | - | Optional: Email password |
| FRONTEND_URL | http://localhost | CORS origin |

## Production Deployment Tips

For production use, consider:

1. **Change MongoDB Password**
   ```env
   MONGO_ROOT_PASSWORD=very_strong_secure_password_here
   ```

2. **Limit Resource Usage**
   ```yaml
   services:
     mongodb:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 1G
     backend:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

3. **Use External Secrets Management**
   - Don't commit `.env` files to git
   - Use Docker Secrets or AWS Secrets Manager
   - Rotate credentials regularly

4. **Enable MongoDB Authentication**
   - Current setup has root auth enabled
   - Consider creating separate application user

5. **Add HTTPS/SSL**
   - Configure SSL certificates in Nginx
   - Update CORS `FRONTEND_URL` to use https://

6. **Regular Backups**
   ```bash
   # Add to cron job
   docker-compose exec mongodb mongodump -u admin -p $MONGO_PASSWORD --out /backups/$(date +%Y%m%d)
   ```

7. **Monitor Logs**
   ```bash
   docker-compose logs --tail=100 --follow
   ```

8. **Update Images Regularly**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Network Communication

Inside the Docker network, services communicate using container names:
- Backend accesses MongoDB at: `mongodb://admin:password@mongodb:27017/i_dashboard`
- Frontend accesses Backend through Nginx proxy at: `http://backend:5000`
- From host machine, use: `localhost:PORT`



