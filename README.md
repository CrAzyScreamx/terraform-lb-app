# Terraform Load Balancer Application

A cloud-native, multi-tier web application deployed on Microsoft Azure using Infrastructure as Code (IaC) principles. This project demonstrates a modern DevOps approach combining Terraform for infrastructure provisioning, Ansible for configuration management, and Docker for containerized application deployment.

## 🏗️ Architecture Overview

This project deploys a secure, load-balanced web application with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │       NVA       │    │    Backend      │
│   Subnet        │───▶│    (Firewall)   │───▶│    Subnet       │
│  (React App)    │    │   + Cloudflare  │    │  (FastAPI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌─────────────────┐
                                               │   MySQL DB      │
                                               │    Subnet       │
                                               └─────────────────┘
```

## 🎯 Project Features

- **Multi-tier Architecture**: Separated frontend, backend, and database layers
- **Network Virtual Appliance (NVA)**: Custom firewall/routing solution
- **Load Balancing**: Azure Load Balancer for backend high availability
- **Zero Trust Network**: Cloudflare tunnel integration for secure access
- **Infrastructure as Code**: Complete automation using Terraform
- **Configuration Management**: Ansible playbooks for VM setup
- **Containerized Applications**: Docker-based deployment

## 📁 Project Structure

```
terraform-lb-app/
├── app/                          # Application source code
│   ├── backend/                  # FastAPI backend application
│   │   ├── main.py              # Main FastAPI application
│   │   ├── database.py          # Database connection logic
│   │   ├── models.py            # Database models
│   │   ├── routes/              # API route handlers
│   │   └── Dockerfile           # Backend container definition
│   ├── frontend/                # React frontend application
│   │   ├── package.json         # Node.js dependencies
│   │   ├── server.js            # Express server
│   │   └── Dockerfile           # Frontend container definition
│   └── dockerFiles/             # Docker Compose configurations
├── terraform/                   # Infrastructure definitions
│   ├── main.tf                  # Main infrastructure resources
│   ├── variables.tf             # Input variables
│   ├── locals.tf                # Local values and calculations
│   ├── cloudflare.tf            # Cloudflare tunnel configuration
│   ├── modules/                 # Reusable Terraform modules
│   │   ├── linux_vm/            # Linux VM module
│   │   └── network_interface/   # Network interface module
│   └── initScripts/             # VM initialization scripts
├── ansible/                     # Configuration management
│   ├── docker.yml              # Docker installation playbook
│   ├── backend/                # Backend service configuration
│   ├── frontend/               # Frontend service configuration
│   └── nva/                    # NVA/Firewall configuration
```

## ☁️ Azure Services Used

### Core Infrastructure
- **Resource Group**: Container for all resources
- **Virtual Network (VNet)**: Network isolation with multiple subnets
- **Subnets**: Segregated network segments for each tier
- **Route Tables**: Custom routing between subnets via NVA

### Compute Resources
- **Virtual Machines**: Ubuntu-based VMs for each application tier
- **Network Interfaces**: Custom NICs with static/dynamic IP allocation
- **SSH Key Pairs**: Secure access to virtual machines

### Load Balancing & Networking
- **Azure Load Balancer**: Internal load balancer for backend services
- **Public IP**: External access point for frontend services
- **Network Security Groups (NSG)**: Firewall rules for frontend subnet

### Database
- **Azure MySQL Flexible Server**: Managed MySQL database service
- **Private Endpoints**: Secure database connectivity within VNet

### Security
- **Network Virtual Appliance (NVA)**: Custom routing and firewall VM
- **UFW (Uncomplicated Firewall)**: Host-based firewall rules
- **Cloudflare Zero Trust**: Secure tunnel and device management

## 🔧 What Ansible Generates

The Ansible playbooks automate the complete configuration of each virtual machine:

### NVA Configuration (`ansible/nva/`)
- **IP Forwarding**: Enables packet forwarding between subnets
- **Cloudflare Tunnel**: Installs and configures secure tunnel service
- **UFW Firewall**: Sets up subnet-to-subnet access rules
- **NAT Rules**: Configures iptables for internet access routing

### Backend Configuration (`ansible/backend/`)
- **Docker Installation**: Sets up Docker and Docker Compose
- **Application Deployment**: Deploys FastAPI backend in containers
- **Database Connectivity**: Configures MySQL connection parameters
- **Health Checks**: Sets up application monitoring endpoints

### Frontend Configuration (`ansible/frontend/`)
- **Docker Installation**: Sets up containerization environment
- **React Application**: Deploys frontend React application
- **Proxy Configuration**: Sets up API proxy to backend services
- **Static Asset Serving**: Configures web server for frontend assets

### Common Tasks (`ansible/docker.yml`)
- **Docker Engine**: Installs Docker from official repositories
- **Docker Compose**: Sets up container orchestration
- **Security Updates**: Applies system security patches
- **Service Management**: Configures systemd services

## 🚀 Key Technologies

- **Infrastructure**: Terraform, Azure Cloud Platform
- **Configuration**: Ansible, Bash Scripts
- **Containers**: Docker, Docker Compose
- **Backend**: Python, FastAPI, MySQL
- **Frontend**: React, TypeScript, Node.js
- **Security**: Cloudflare Zero Trust, UFW, NSGs
- **Networking**: Azure Load Balancer, Custom Routing

## 🌐 Network Flow

1. **External Traffic** → Cloudflare Tunnel → Frontend VM
2. **Frontend** → NVA (Custom Routes) → Backend Load Balancer
3. **Backend Services** → NVA → MySQL Subnet
4. **Internet Access** → NVA (NAT) → External Services

## 🔒 Security Features

- **Network Segmentation**: Isolated subnets for each application tier
- **Zero Trust Access**: Cloudflare tunnel replaces traditional VPN
- **Firewall Rules**: Multi-layer security with NSGs and UFW
- **Private Database**: MySQL accessible only from backend subnet
- **Custom Routing**: All inter-subnet traffic flows through NVA

---

This project demonstrates enterprise-level cloud architecture patterns with a focus on security, scalability, and maintainability through Infrastructure as Code practices.