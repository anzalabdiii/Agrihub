# Deployment Guide - AgriLink Hub

## Prerequisites

- Ubuntu 22.04 LTS server
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt)
- PostgreSQL 14+
- Python 3.10+
- Node.js 18+
- Nginx
- Git

## Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Dependencies
```bash
# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Python and pip
sudo apt install python3.10 python3-pip python3.10-venv -y

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Nginx
sudo apt install nginx -y

# Other tools
sudo apt install git supervisor certbot python3-certbot-nginx -y
```

## Database Setup

### 1. Create PostgreSQL Database
```bash
sudo -u postgres psql

CREATE DATABASE agrilink_db;
CREATE USER agrilink_user WITH PASSWORD 'secure_password_here';
ALTER ROLE agrilink_user SET client_encoding TO 'utf8';
ALTER ROLE agrilink_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE agrilink_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE agrilink_db TO agrilink_user;
\q
```

### 2. Configure PostgreSQL for Remote Access (if needed)
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# Change: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host    all             all             0.0.0.0/0               md5

sudo systemctl restart postgresql
```

## Backend Deployment

### 1. Clone Repository
```bash
cd /var/www
sudo git clone <your-repo-url> agrilink
cd agrilink/backend
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
pip install gunicorn
```

### 4. Create Production Environment File
```bash
sudo nano .env
```

Add:
```env
FLASK_ENV=production
DATABASE_URL=postgresql://agrilink_user:secure_password_here@localhost/agrilink_db
SECRET_KEY=generate_strong_secret_key_here
JWT_SECRET_KEY=generate_strong_jwt_key_here
CORS_ORIGINS=https://yourdomain.com
```

Generate secret keys:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Initialize Database
```bash
source venv/bin/activate
export FLASK_APP=run.py
flask db upgrade
flask seed_admin
flask seed_categories
```

### 6. Create Gunicorn Service
```bash
sudo nano /etc/systemd/system/agrilink.service
```

Add:
```ini
[Unit]
Description=AgriLink Hub Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/agrilink/backend
Environment="PATH=/var/www/agrilink/backend/venv/bin"
EnvironmentFile=/var/www/agrilink/backend/.env
ExecStart=/var/www/agrilink/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 run:app

[Install]
WantedBy=multi-user.target
```

### 7. Start Backend Service
```bash
sudo systemctl daemon-reload
sudo systemctl start agrilink
sudo systemctl enable agrilink
sudo systemctl status agrilink
```

## Frontend Deployment

### 1. Build Frontend
```bash
cd /var/www/agrilink/frontend

# Create production .env
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/agrilink
```

Add:
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/agrilink/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File upload size limit
    client_max_body_size 16M;

    # Serve uploaded images
    location /api/upload/images/ {
        alias /var/www/agrilink/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/agrilink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate (HTTPS)

### Using Let's Encrypt
```bash
# Frontend
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Backend API
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo systemctl status certbot.timer
```

Nginx will be automatically updated with SSL configuration.

## File Upload Directory Permissions

```bash
sudo mkdir -p /var/www/agrilink/backend/uploads
sudo chown -R www-data:www-data /var/www/agrilink/backend/uploads
sudo chmod -R 755 /var/www/agrilink/backend/uploads
```

## Environment Variables for Production

### Backend (.env)
```env
FLASK_ENV=production
DATABASE_URL=postgresql://agrilink_user:password@localhost/agrilink_db
SECRET_KEY=<generated-secret-key>
JWT_SECRET_KEY=<generated-jwt-key>
CORS_ORIGINS=https://yourdomain.com
```

### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Monitoring & Logs

### View Backend Logs
```bash
sudo journalctl -u agrilink -f
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### View PostgreSQL Logs
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

## Backup Strategy

### Database Backup Script
```bash
sudo nano /usr/local/bin/backup-agrilink-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/agrilink"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U agrilink_user agrilink_db | gzip > $BACKUP_DIR/agrilink_db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-agrilink-db.sh
```

### Schedule Daily Backups
```bash
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-agrilink-db.sh
```

## Performance Optimization

### Gunicorn Workers
Calculate optimal workers:
```python
workers = (2 * CPU_cores) + 1
```

Update in `/etc/systemd/system/agrilink.service`:
```ini
ExecStart=/var/www/agrilink/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 --timeout 120 run:app
```

### PostgreSQL Tuning
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Recommended settings for 4GB RAM server:
```
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5MB
min_wal_size = 1GB
max_wal_size = 4GB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Security Hardening

### 1. Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Fail2Ban
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Disable Root SSH Login
```bash
sudo nano /etc/ssh/sshd_config
# Change: PermitRootLogin no
sudo systemctl restart sshd
```

### 4. Regular Updates
```bash
sudo apt update && sudo apt upgrade -y
```

## Scaling Options

### Using CDN
- Use CloudFlare for static assets
- Configure CDN for `/api/upload/images/`

### Database Scaling
- Read replicas for heavy queries
- Connection pooling with PgBouncer
- Database partitioning for large tables

### Application Scaling
- Multiple Gunicorn instances with load balancer
- Redis for caching (future enhancement)
- Message queue for async tasks (Celery)

## Troubleshooting

### Backend not starting
```bash
sudo systemctl status agrilink
sudo journalctl -u agrilink -n 50
```

### Database connection issues
```bash
sudo -u postgres psql agrilink_db
\conninfo
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Permission errors
```bash
sudo chown -R www-data:www-data /var/www/agrilink
```

## Health Check Endpoints

Add to backend (`run.py`):
```python
@app.route('/health')
def health_check():
    return {'status': 'healthy'}, 200
```

Monitor:
```bash
curl https://api.yourdomain.com/health
```

## Maintenance Mode

Create maintenance page in Nginx:
```bash
sudo nano /var/www/html/maintenance.html
```

Enable maintenance mode:
```nginx
# Add to server block
location / {
    return 503;
}

error_page 503 @maintenance;
location @maintenance {
    root /var/www/html;
    rewrite ^(.*)$ /maintenance.html break;
}
```

## Post-Deployment Checklist

- [ ] Database created and seeded
- [ ] Admin account accessible
- [ ] Backend service running
- [ ] Frontend builds successfully
- [ ] Nginx configured correctly
- [ ] SSL certificates installed
- [ ] File uploads working
- [ ] Email notifications configured (if applicable)
- [ ] Backup cron job scheduled
- [ ] Monitoring set up
- [ ] Firewall rules configured
- [ ] Domain DNS pointing correctly
- [ ] CORS configured properly
- [ ] Environment variables secured
- [ ] Default passwords changed

## Support & Maintenance

For production support:
- Monitor error logs daily
- Check disk space weekly
- Review database performance monthly
- Update dependencies quarterly
- Backup verification monthly
