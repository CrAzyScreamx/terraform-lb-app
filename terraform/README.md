# Terraform Infrastructure as Code

This directory contains the complete Infrastructure as Code (IaC) configuration for deploying a multi-tier web application on Microsoft Azure. The Terraform configuration provisions a secure, scalable architecture with custom networking, load balancing, and zero-trust security through Cloudflare.

## 🚀 Quick Start

### Prerequisites
- Terraform >= 1.0
- Azure CLI installed and configured
- Cloudflare account with API token
- Azure Service Principal with appropriate permissions

### Deployment
```bash
# Set up environment variables
cd terraform/
source ./scripts/.debug-dev.sh

# Deploy infrastructure
./scripts/.debug-dev.sh plan
./scripts/.debug-dev.sh apply
```

## 📋 Required Variables

### Core Infrastructure Variables
| Variable | Type | Description | Example | Required |
|----------|------|-------------|---------|----------|
| `environment_name` | string | Environment identifier | `"dev"`, `"prod"` | ✅ |
| `application_name` | string | Application identifier | `"terraform-lb-app"` | ✅ |
| `azure_location` | string | Azure region for deployment | `"israelcentral"`, `"westeurope"` | ✅ |

### Network Configuration
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| `azure_vnet` | string | Virtual network CIDR | `"10.0.0.0/16"` | ❌ |

### Application Configuration
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| `backend_count` | number | Number of backend VMs | `2` | ❌ |
| `load_balancer_frontend_port` | number | Load balancer frontend port | `8000` | ❌ |
| `load_balancer_backend_port` | number | Backend service port | `8000` | ❌ |

### Security Configuration
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| `db_password` | string | MySQL database password | `"Aa12345@!"` | ❌ |
| `cloudflare_account_id` | string | Cloudflare account ID |  | ✅ |

## 🔧 Debug Development Script (`.debug-dev.sh`)

The `.debug-dev.sh` script is the primary tool for managing this Terraform deployment. It automates environment setup, backend configuration, and Terraform operations.

### Features
- **Environment Variable Management**: Automatically sources and exports required variables
- **Azure Authentication**: Sets up Azure Resource Manager environment variables
- **Cloudflare Integration**: Configures Cloudflare API authentication
- **Remote State Management**: Initializes Terraform with Azure Storage backend
- **Command Passthrough**: Accepts any Terraform command as arguments

### Usage Examples
```bash
# Initialize and plan deployment
./scripts/.debug-dev.sh plan

# Apply infrastructure changes
./scripts/.debug-dev.sh apply

# Destroy infrastructure
./scripts/.debug-dev.sh destroy

# Validate configuration
./scripts/.debug-dev.sh validate

# Format code
./scripts/.debug-dev.sh fmt

# Show current state
./scripts/.debug-dev.sh show

# Import existing resources
./scripts/.debug-dev.sh import azurerm_resource_group.example /subscriptions/.../resourceGroups/example
```

### Environment Variables Setup
The script sources configuration from `scripts/.env` and exports:

#### Azure Authentication
- `ARM_SUBSCRIPTION_ID`: Azure subscription ID
- `ARM_CLIENT_ID`: Service principal client ID  
- `ARM_CLIENT_SECRET`: Service principal secret
- `ARM_TENANT_ID`: Azure Active Directory tenant ID

#### Cloudflare Authentication
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token for tunnel management

#### Terraform Variables
- `TF_VAR_application_name`: Application identifier
- `TF_VAR_environment_name`: Environment identifier
- `TF_VAR_cloudflare_account_id`: Cloudflare account ID

#### Backend Configuration
- `BACKEND_RESOURCE_GROUP_NAME`: Resource group for Terraform state
- `BACKEND_STORAGE_ACCOUNT_NAME`: Storage account for state files
- `BACKEND_CONTAINER_NAME`: Blob container for state storage
- `BACKEND_KEY`: State file name (auto-generated)

## 📁 Project Structure

```
terraform/
├── main.tf                    # Main infrastructure resources
├── variables.tf               # Input variable definitions
├── locals.tf                  # Local value calculations
├── providers.tf               # Provider configurations
├── cloudflare.tf             # Cloudflare tunnel resources
├── outputs.tf                # Output value definitions
├── terraform.tfvars         # Variable value assignments
├── scripts/
│   ├── .debug-dev.sh        # Development deployment script
│   └── .env                 # Environment configuration
├── modules/
│   ├── linux_vm/           # Reusable VM module
│   └── network_interface/   # Reusable NIC module
├── initScripts/
│   ├── init-nva.sh         # NVA initialization script
│   ├── init-frontend.sh    # Frontend setup script
│   └── init-backend.sh     # Backend setup script
└── keys/                   # Generated SSH private keys
```

## 🏗️ Infrastructure Components

### Core Resources
- **Resource Group**: Container for all Azure resources
- **Virtual Network**: Isolated network with multiple subnets
- **Subnets**: Segmented networks (NVA, Frontend, Backend, MySQL)
- **Route Tables**: Custom routing through NVA appliance

### Compute Resources
- **Network Virtual Appliance (NVA)**: Custom firewall/router VM
- **Frontend VM**: React application server
- **Backend VMs**: FastAPI application servers (load balanced)
- **Network Interfaces**: Custom NICs with IP forwarding capability

### Load Balancing & Networking
- **Azure Load Balancer**: Internal load balancer for backend services
- **Public IP**: External access point for frontend
- **Network Security Groups**: Firewall rules for subnets

### Database
- **MySQL Flexible Server**: Managed database service
- **Database**: Application-specific database instance

### Security & Access
- **Cloudflare Tunnel**: Zero-trust network access
- **SSH Key Pairs**: Secure VM access (auto-generated)
- **UFW Firewall**: Host-based firewall rules (configured via Ansible)

## 🌐 Network Architecture

### Subnet Layout
| Subnet | CIDR | Purpose | Access |
|--------|------|---------|--------|
| NVA | `10.0.2.0/24` | Network Virtual Appliance | Internal routing |
| Frontend | `10.0.1.0/24` | React web application | Public + Internal |
| Backend | `10.0.3.0/24` | FastAPI services | Internal only |
| MySQL | `10.0.4.0/24` | Database services | Backend only |

### Traffic Flow
1. **External → Frontend**: Internet → Cloudflare Tunnel → Frontend VM
2. **Frontend → Backend**: Frontend → NVA → Load Balancer → Backend VMs
3. **Backend → Database**: Backend VMs → MySQL Subnet
4. **Backend → Internet**: Backend → NVA → Internet (NAT)

## 📤 Outputs

After successful deployment, Terraform provides these outputs:

| Output | Description | Usage |
|--------|-------------|-------|
| `frontend_public_ip` | Public IP of frontend VM | External access endpoint |
| `frontend_private_ip` | Private IP of frontend VM | Internal communication |
| `backend_private_ips` | Array of backend VM IPs | Load balancer targets |
| `nva_private_ip` | NVA private IP address | Routing next-hop |

## 🔒 Security Considerations

### Authentication
- Azure Service Principal for Terraform operations
- SSH key-based authentication for VMs
- Cloudflare API token for tunnel management

### Network Security
- Network segmentation with isolated subnets
- Custom routing through security appliance
- Network Security Groups for traffic filtering
- Zero-trust access via Cloudflare tunnel

### State Management
- Remote state storage in Azure Storage Account
- State file encryption at rest
- Access controlled via Azure RBAC

## 🐛 Troubleshooting

### Common Issues
1. **Authentication Failures**: Verify Azure Service Principal permissions
2. **State Lock**: Check for existing locks in Azure Storage
3. **Network Connectivity**: Verify NVA routing and firewall rules
4. **Resource Naming**: Ensure unique names across Azure regions

### Debug Commands
```bash
# Check current state
./scripts/.debug-dev.sh state list

# Validate configuration
./scripts/.debug-dev.sh validate

# Show detailed plan
./scripts/.debug-dev.sh plan -detailed-exitcode

# Refresh state
./scripts/.debug-dev.sh refresh
```

## 📝 Best Practices

1. **Always run `plan` before `apply`**
2. **Use the debug script for consistent environment setup**
3. **Keep `.env` file secure and never commit to version control**
4. **Review outputs after deployment for connectivity information**
5. **Use Terraform workspaces for multiple environments**
6. **Regularly backup state files**

---

This Terraform configuration provides a production-ready, secure, and scalable infrastructure foundation for modern web applications on Azure.
