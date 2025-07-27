# Ansible Configuration Management

This directory contains Ansible playbooks and configurations for automated setup and deployment of the multi-tier web application infrastructure. The playbooks handle VM configuration, Docker installation, application deployment, and security hardening across all infrastructure components.

## 🎯 Overview

Ansible is used to transform the bare Ubuntu VMs provisioned by Terraform into fully configured application servers. Each component (NVA, Frontend, Backend) has its own specialized playbook that handles specific configuration requirements.

## 📁 Directory Structure

```
ansible/
├── docker.yml                      # Shared Docker installation playbook
├── nva/
│   └── main_playbook.yml          # Network Virtual Appliance configuration
├── backend/
│   ├── main_playbook.yml          # Backend service configuration
│   ├── docker-compose.template.yml # Backend Docker Compose template
│   └── template.env               # Backend environment template
└── frontend/
    ├── main_playbook.yml          # Frontend service configuration
    ├── docker-compose.template.yml # Frontend Docker Compose template
    └── template.env               # Frontend environment template
```

## 🚀 Execution Flow

### Automated Execution via Terraform
All playbooks are executed automatically during VM provisioning through Terraform's `cloud-init` scripts:

1. **VM Creation**: Terraform provisions Ubuntu VMs
2. **Bootstrap Script**: Each VM runs an initialization script (`init-*.sh`)
3. **Ansible Pull**: VMs pull and execute their respective playbooks from GitHub
4. **Service Deployment**: Applications are deployed and started automatically

### Manual Execution (Optional)
```bash
# Execute specific playbook manually
ansible-playbook -i localhost, ansible/nva/main_playbook.yml \
  --extra-vars "tunnel_token=<token> backend_subnet=10.0.3.0/24 frontend_subnet=10.0.1.0/24 backend_port=3000"

ansible-playbook -i localhost, ansible/backend/main_playbook.yml \
  --extra-vars "db_host=<host> db_user=<user> db_password=<pass> db_name=<name> backend_port=3000"

ansible-playbook -i localhost, ansible/frontend/main_playbook.yml \
  --extra-vars "backend_url=http://10.0.3.100:9000"
```

## 🔧 Component Configurations

### Network Virtual Appliance (NVA) - `nva/main_playbook.yml`

**Purpose**: Configures the NVA VM as a secure router and firewall appliance.

#### Key Tasks:
1. **IP Forwarding Configuration**
   - Enables kernel IP forwarding (`net.ipv4.ip_forward = 1`)
   - Allows packet routing between subnets

2. **Cloudflare Zero Trust Tunnel**
   - Downloads and installs Cloudflared from official repository
   - Configures tunnel service with provided token
   - Sets up systemd service for automatic startup

3. **UFW Firewall Configuration**
   - Enables UFW with default deny policy
   - Allows SSH access for management
   - Creates rules for frontend-to-backend communication
   - Configures routed traffic policy

4. **NAT Configuration**
   - Sets up iptables MASQUERADE rules
   - Enables internet access for backend subnet
   - Configures POSTROUTING chain for NAT

#### Required Variables:
- `tunnel_token`: Cloudflare tunnel authentication token
- `backend_subnet`: Backend subnet CIDR (e.g., "10.0.3.0/24")
- `frontend_subnet`: Frontend subnet CIDR (e.g., "10.0.1.0/24")
- `backend_port`: Backend service port (e.g., 3000)

### Backend Services - `backend/main_playbook.yml`

**Purpose**: Deploys FastAPI backend services with database connectivity.

#### Key Tasks:
1. **Docker Installation**
   - Includes shared Docker installation playbook
   - Sets up Docker Engine and Docker Compose

2. **Configuration Management**
   - Creates `/opt/config` directory for application files
   - Generates environment file from template with database credentials
   - Copies Docker Compose configuration

3. **Service Deployment**
   - Pulls backend container image (`ghcr.io/crazyscreamx/task-manager-backend:latest`)
   - Starts backend service with proper environment variables
   - Configures health checks and restart policies

#### Container Configuration:
- **Image**: `ghcr.io/crazyscreamx/task-manager-backend:latest`
- **Port Mapping**: `${BACKEND_PORT}:8000` (typically `3000:8000`)
- **Health Check**: HTTP check on `/health` endpoint
- **Restart Policy**: `unless-stopped`

#### Required Variables:
- `db_host`: MySQL server hostname/IP
- `db_user`: Database username
- `db_password`: Database password
- `db_name`: Database name
- `backend_port`: External port for backend service

### Frontend Services - `frontend/main_playbook.yml`

**Purpose**: Deploys React frontend application with backend connectivity.

#### Key Tasks:
1. **Docker Installation**
   - Includes shared Docker installation playbook
   - Sets up containerization environment

2. **Configuration Management**
   - Creates application configuration directory
   - Generates environment file with backend URL
   - Copies Docker Compose template

3. **Service Deployment**
   - Pulls frontend container image (`ghcr.io/crazyscreamx/task-manager-frontend:latest`)
   - Starts frontend service on port 80
   - Configures backend API connectivity

#### Container Configuration:
- **Image**: `ghcr.io/crazyscreamx/task-manager-frontend:latest`
- **Port Mapping**: `80:3000` (public web access)
- **Environment**: Backend URL for API calls
- **Features**: Hot reload support, TTY enabled

#### Required Variables:
- `backend_url`: Full URL to backend load balancer (e.g., "http://10.0.3.100:9000")

## 🐳 Docker Installation - `docker.yml`

**Shared Playbook**: Used by both frontend and backend configurations.

### Installation Process:
1. **Prerequisites**: Installs `ca-certificates` and `curl`
2. **Repository Setup**: Adds Docker's official GPG key and APT repository
3. **Package Installation**: Installs Docker Engine, CLI, containerd, and plugins
4. **Service Configuration**: Starts and enables Docker daemon

### Installed Components:
- `docker-ce`: Docker Community Edition engine
- `docker-ce-cli`: Docker command-line interface
- `containerd.io`: Container runtime
- `docker-buildx-plugin`: Extended build capabilities
- `docker-compose-plugin`: Multi-container orchestration

## 📋 Environment Templates

### Backend Environment (`backend/template.env`)
```bash
DB_HOST=${DB_HOST}          # MySQL server hostname
DB_USER=${DB_USER}          # Database username
DB_PASSWORD=${DB_PASSWORD}  # Database password
DB_NAME=${DB_NAME}          # Database name
BACKEND_PORT=${BACKEND_PORT} # Service port
```

### Frontend Environment (`frontend/template.env`)
```bash
BACKEND_URL=${BACKEND_URL}  # Backend API endpoint URL
```

## 🔄 Variable Substitution Process

1. **Terraform Execution**: Passes variables to VM initialization scripts
2. **Shell Substitution**: `envsubst` command replaces template variables
3. **File Generation**: Creates actual `.env` files for Docker Compose
4. **Container Startup**: Docker Compose uses generated environment files

## 🛡️ Security Features

### NVA Security:
- **Firewall Rules**: UFW-based traffic filtering
- **Network Segmentation**: Controlled inter-subnet communication
- **NAT Security**: Masqueraded outbound traffic
- **Zero Trust Access**: Cloudflare tunnel integration

### Application Security:
- **Container Isolation**: Dockerized application deployment
- **Network Policies**: Restricted inter-service communication
- **Health Monitoring**: Automated health checks
- **Restart Policies**: Automatic service recovery

## 🔍 Monitoring & Health Checks

### Backend Health Check:
- **Endpoint**: `http://localhost:8000/health`
- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 40 seconds

### Service Management:
- **Auto-restart**: `unless-stopped` policy
- **Log Management**: Docker log drivers
- **Resource Limits**: Configurable container limits

## 🐛 Troubleshooting

### Common Issues:

1. **Playbook Execution Failures**
   ```bash
   # Check Ansible logs
   journalctl -u cloud-final -f
   
   # Verify playbook syntax
   ansible-playbook --syntax-check playbook.yml
   ```

2. **Docker Service Issues**
   ```bash
   # Check Docker status
   systemctl status docker
   
   # View container logs
   docker logs tasks-api
   docker logs tasks-frontend
   ```

3. **Network Connectivity**
   ```bash
   # Test UFW rules
   ufw status verbose
   
   # Check iptables NAT rules
   iptables -t nat -L -n -v
   ```

4. **Environment Variable Issues**
   ```bash
   # Verify environment file
   cat /opt/config/.env
   
   # Check variable substitution
   envsubst < template.env
   ```

## 📝 Best Practices

1. **Idempotency**: All playbooks are designed to be re-runnable
2. **Error Handling**: Proper task failure handling and rollback
3. **Logging**: Comprehensive logging for troubleshooting
4. **Security**: Minimal privilege principle and secure defaults
5. **Modularity**: Reusable components and shared playbooks
6. **Validation**: Pre-deployment checks and health verification

## 🔧 Customization

### Adding New Services:
1. Create new directory under `ansible/`
2. Develop `main_playbook.yml` with service-specific tasks
3. Add Docker Compose and environment templates
4. Update Terraform initialization scripts
5. Include any required variable passing

### Modifying Configurations:
1. Update template files for configuration changes
2. Modify playbook tasks for new requirements
3. Test changes in development environment
4. Update documentation and variable requirements

---

This Ansible configuration provides automated, consistent, and secure deployment of all application components with comprehensive monitoring and troubleshooting capabilities.
