# AWS Security Configuration for GameSchakra

## EC2 Security Group Configuration

### Web Server Security Group (gameschakra-web)
```json
{
  "GroupName": "gameschakra-web",
  "Description": "Security group for GameSchakra web servers",
  "Rules": [
    {
      "Type": "Inbound",
      "Protocol": "TCP",
      "Port": "22",
      "Source": "YOUR_IP_ADDRESS/32",
      "Description": "SSH access from admin IP only"
    },
    {
      "Type": "Inbound", 
      "Protocol": "TCP",
      "Port": "80",
      "Source": "0.0.0.0/0",
      "Description": "HTTP (redirects to HTTPS)"
    },
    {
      "Type": "Inbound",
      "Protocol": "TCP", 
      "Port": "443",
      "Source": "0.0.0.0/0",
      "Description": "HTTPS"
    },
    {
      "Type": "Outbound",
      "Protocol": "All",
      "Port": "All",
      "Destination": "0.0.0.0/0",
      "Description": "All outbound traffic"
    }
  ]
}
```

### RDS Security Group (gameschakra-rds)
```json
{
  "GroupName": "gameschakra-rds", 
  "Description": "Security group for GameSchakra RDS instance",
  "Rules": [
    {
      "Type": "Inbound",
      "Protocol": "TCP",
      "Port": "5432",
      "Source": "sg-xxx (gameschakra-web)",
      "Description": "PostgreSQL access from web servers only"
    }
  ]
}
```

## RDS Configuration

### SSL Configuration
- **SSL Mode**: `require` (enforced in connection string)
- **Certificate**: `rds-ca-rsa2048-g1` (AWS managed)
- **Encryption at Rest**: Enabled
- **Backup Encryption**: Enabled

### Connection String Example
```bash
DATABASE_URL="postgresql://postgres:PASSWORD@beta-rds.ct0qaymyqs9f.ap-south-1.rds.amazonaws.com:5432/gameschakra?sslmode=require"
```

## EC2 Instance Configuration

### Recommended Instance Type
- **Type**: `t3.medium` or higher for production
- **vCPUs**: 2
- **Memory**: 4 GiB
- **Storage**: 30GB gp3 SSD minimum

### User Data Script (for initial setup)
```bash
#!/bin/bash
yum update -y
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs nginx git

# Install PM2 globally
npm install -g pm2

# Install Certbot for SSL
yum install -y certbot python3-certbot-nginx

# Create application directory
mkdir -p /var/www/gameschakra
chown ec2-user:ec2-user /var/www/gameschakra

# Create log directory
mkdir -p /var/log/gameschakra
chown ec2-user:ec2-user /var/log/gameschakra

# Start and enable services
systemctl start nginx
systemctl enable nginx
```

## Network Configuration

### VPC Setup
- **VPC**: Use existing or create dedicated VPC
- **Subnets**: 
  - Public subnet for EC2 (with internet gateway)
  - Private subnets for RDS (multi-AZ)
- **Route Tables**: Properly configured for public/private access

### DNS Configuration (Hostinger)
```
Type: A
Name: @
Value: YOUR_EC2_ELASTIC_IP
TTL: 300

Type: A  
Name: www
Value: YOUR_EC2_ELASTIC_IP
TTL: 300

Type: CNAME
Name: api
Value: gameschakra.com
TTL: 300
```

## Security Checklist

### ✅ EC2 Security
- [ ] SSH key-based authentication only
- [ ] SSH port 22 restricted to admin IP
- [ ] No root login allowed
- [ ] Fail2ban installed and configured
- [ ] Regular security updates enabled
- [ ] CloudWatch monitoring enabled

### ✅ RDS Security  
- [ ] SSL connections enforced
- [ ] Database user with minimal privileges
- [ ] No public accessibility
- [ ] Automated backups enabled
- [ ] Point-in-time recovery enabled
- [ ] Parameter group configured securely

### ✅ Application Security
- [ ] Strong session secret
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] File upload restrictions
- [ ] Input validation and sanitization

### ✅ Monitoring & Logging
- [ ] CloudWatch logs configured
- [ ] Application logs centralized
- [ ] Health check monitoring
- [ ] Disk space monitoring
- [ ] Performance monitoring

## Commands for Manual Setup

### 1. Create EC2 Security Group
```bash
aws ec2 create-security-group \
  --group-name gameschakra-web \
  --description "GameSchakra web server security group"

# Add SSH rule (replace with your IP)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Add HTTP rule
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Add HTTPS rule  
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### 2. Update RDS Security Group
```bash
# Allow PostgreSQL access from web servers only
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-xxxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-web-xxxxxxxxx
```

### 3. Allocate Elastic IP
```bash
aws ec2 allocate-address --domain vpc
aws ec2 associate-address \
  --instance-id i-xxxxxxxxx \
  --allocation-id eipalloc-xxxxxxxxx
```

## Troubleshooting

### Common Issues
1. **Connection Refused**: Check security groups and NACLs
2. **SSL Handshake Failed**: Verify RDS SSL configuration
3. **504 Gateway Timeout**: Check application health and PM2 status
4. **403 Forbidden**: Verify Nginx permissions and file ownership

### Log Locations
- **Application**: `/var/log/gameschakra/`
- **Nginx**: `/var/log/nginx/`
- **System**: `/var/log/messages`
- **PM2**: `~/.pm2/logs/`