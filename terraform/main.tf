### Firewall Subnet - NVA Configuration ###
resource "azurerm_resource_group" "main" {
  name     = "rg-${var.environment_name}-${var.application_name}"
  location = var.azure_location
}

resource "azurerm_virtual_network" "main" {
  name                = "vnet-${var.environment_name}-${var.application_name}-nva"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  address_space       = [var.azure_vnet]
}

resource "azurerm_subnet" "nva-subnet" {
  name                 = "subnet-${var.environment_name}-${var.application_name}-nva"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [local.azure_nva_subnet]
}

module "nva-nic" {
  source                     = "./modules/network_interface"
  name                       = "nic-${var.environment_name}-${var.application_name}-nva"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  ip_configuration_subnet_id = azurerm_subnet.nva-subnet.id
}

module "nva-vm" {
  source                   = "./modules/linux_vm"
  name                     = "vm-${var.environment_name}-${var.application_name}-nva"
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  network_interface_ids    = [module.nva-nic.id]
  boot_diagnostics_enabled = true

  custom_data = base64encode(templatefile("initScripts/init-nva.sh", {
    tunnel_token    = data.cloudflare_zero_trust_tunnel_cloudflared_token.main.token
    backend_subnet  = local.azure_backend_subnet
    frontend_subnet = local.azure_frontend_subnet
    backend_port    = var.load_balancer_backend_port
  }))
}

resource "local_sensitive_file" "nva-ssh-key" {
  content  = module.nva-vm.tls_private_key.private_key_pem
  filename = "${path.module}/keys/${module.nva-vm.vm.name}-key.pem"
}
### Firewall Subnet - NVA Configuration ###

### Frontend Subnet - Frontend Configuration ###
resource "azurerm_subnet" "frontend-subnet" {
  name                 = "subnet-${var.environment_name}-${var.application_name}-frontend"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [local.azure_frontend_subnet]
}

resource "azurerm_public_ip" "frontend-pip" {
  name                = "pip-${var.environment_name}-${var.application_name}-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
}

module "frontend-nic" {
  source                                = "./modules/network_interface"
  name                                  = "nic-${var.environment_name}-${var.application_name}-frontend-pip"
  location                              = azurerm_resource_group.main.location
  resource_group_name                   = azurerm_resource_group.main.name
  ip_configuration_subnet_id            = azurerm_subnet.frontend-subnet.id
  ip_configuration_public_ip_address_id = azurerm_public_ip.frontend-pip.id
}

resource "azurerm_network_security_group" "frontend-nsg" {
  name                = "nsg-${var.environment_name}-${var.application_name}-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_network_security_rule" "allow-http-frontend" {
  name                        = "allow-http-frontend"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "80"
  network_security_group_name = azurerm_network_security_group.frontend-nsg.name
  resource_group_name         = azurerm_resource_group.main.name
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
}

resource "azurerm_network_interface_security_group_association" "frontend-nic-nsg" {
  network_interface_id      = module.frontend-nic.id
  network_security_group_id = azurerm_network_security_group.frontend-nsg.id
}

module "frontend-vm" {
  source                   = "./modules/linux_vm"
  name                     = "vm-${var.environment_name}-${var.application_name}-frontend"
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  network_interface_ids    = [module.frontend-nic.id]
  boot_diagnostics_enabled = true

  custom_data = base64encode(templatefile("initScripts/init-frontend.sh", {
    backend_url = "http://${azurerm_lb.backend-lb.frontend_ip_configuration[0].private_ip_address}:${var.load_balancer_frontend_port}"
  }))
}

resource "local_sensitive_file" "frontend_ssh_key" {
  content  = module.frontend-vm.tls_private_key.private_key_pem
  filename = "${path.module}/keys/${module.frontend-vm.vm.name}-key.pem"
}
### Frontend Subnet - Frontend Configuration ###

### Backend Subnet - Backend Configuration ###
resource "azurerm_subnet" "backend-subnet" {
  name                 = "subnet-${var.environment_name}-${var.application_name}-backend"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [local.azure_backend_subnet]
}

module "backend-nic" {
  count                      = var.backend_count
  source                     = "./modules/network_interface"
  name                       = "nic-${var.environment_name}-${var.application_name}-backend-${count.index}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  ip_configuration_subnet_id = azurerm_subnet.backend-subnet.id

}

resource "azurerm_lb" "backend-lb" {
  name                = "lb-${var.environment_name}-${var.application_name}-backend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  frontend_ip_configuration {
    name                          = "internal"
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.backend-subnet.id
    private_ip_address_version    = "IPv4"
  }
}

resource "azurerm_lb_backend_address_pool" "backend-pool" {
  name            = "pool-${var.environment_name}-${var.application_name}-backend"
  loadbalancer_id = azurerm_lb.backend-lb.id
}

resource "azurerm_lb_rule" "backend-lb-rule" {
  loadbalancer_id                = azurerm_lb.backend-lb.id
  name                           = "rule-${var.environment_name}-${var.application_name}-backend"
  protocol                       = "Tcp"
  frontend_port                  = var.load_balancer_frontend_port
  backend_port                   = var.load_balancer_backend_port
  frontend_ip_configuration_name = azurerm_lb.backend-lb.frontend_ip_configuration[0].name
  probe_id                       = azurerm_lb_probe.backend-lb-probe.id
  load_distribution              = "Default"
  backend_address_pool_ids = [
    azurerm_lb_backend_address_pool.backend-pool.id
  ]
}

resource "azurerm_lb_probe" "backend-lb-probe" {
  loadbalancer_id     = azurerm_lb.backend-lb.id
  name                = "probe-${var.environment_name}-${var.application_name}-backend"
  protocol            = "Http"
  port                = var.load_balancer_backend_port
  request_path        = "/health"
  interval_in_seconds = 5
  number_of_probes    = 2
}

resource "azurerm_network_interface_backend_address_pool_association" "backend-nic-pool" {
  count                   = var.backend_count
  network_interface_id    = module.backend-nic[count.index].id
  ip_configuration_name   = "internal"
  backend_address_pool_id = azurerm_lb_backend_address_pool.backend-pool.id
}

module "backend-vms" {
  count                    = var.backend_count
  source                   = "./modules/linux_vm"
  name                     = "vm-${var.environment_name}-${var.application_name}-backend-${count.index}"
  location                 = azurerm_resource_group.main.location
  resource_group_name      = azurerm_resource_group.main.name
  network_interface_ids    = [module.backend-nic[count.index].id]
  boot_diagnostics_enabled = true

  custom_data = base64encode(templatefile("initScripts/init-backend.sh", {
    db_host      = azurerm_mysql_flexible_server.main.fqdn,
    db_user      = azurerm_mysql_flexible_server.main.administrator_login,
    db_password  = var.db_password
    db_name      = azurerm_mysql_flexible_database.main.name
    backend_port = var.load_balancer_backend_port
  }))
}

resource "local_sensitive_file" "backend_ssh_key" {
  count    = var.backend_count
  content  = module.backend-vms[count.index].tls_private_key.private_key_pem
  filename = "${path.module}/keys/${module.backend-vms[count.index].vm.name}-key.pem"
}

resource "azurerm_subnet" "mysql-subnet" {
  name                 = "subnet-${var.environment_name}-${var.application_name}-mysql"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [local.azure_mysql_subnet]

  delegation {
    name = "mysql-delegation"
    service_delegation {
      name    = "Microsoft.DBforMySQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }

}

resource "azurerm_mysql_flexible_server" "main" {
  name                   = "mysql-${var.environment_name}-${var.application_name}"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  administrator_login    = "adminuser"
  administrator_password = var.db_password
  delegated_subnet_id    = azurerm_subnet.mysql-subnet.id
  sku_name               = "B_Standard_B1ms"
}

resource "azurerm_mysql_flexible_database" "main" {
  name                = "db-${var.environment_name}-${var.application_name}"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  charset             = "utf8"
  collation           = "utf8_general_ci"
}
### Backend Subnet - Backend Configuration ###

### Route Table Rules ###
resource "azurerm_route_table" "frontend-rules" {
  name                = "rt-${var.environment_name}-${var.application_name}-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  route {
    name                   = "frontend-to-backend-subnet"
    address_prefix         = local.azure_backend_subnet
    next_hop_type          = "VirtualAppliance"
    next_hop_in_ip_address = module.nva-nic.private_ip_address
  }
}

resource "azurerm_subnet_route_table_association" "frontend-subnet-association" {
  subnet_id      = azurerm_subnet.frontend-subnet.id
  route_table_id = azurerm_route_table.frontend-rules.id
}

resource "azurerm_route_table" "backend-rules" {
  name                = "rt-${var.environment_name}-${var.application_name}-backend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  route {
    name                   = "backend-to-frontend-vm"
    address_prefix         = "${module.frontend-nic.private_ip_address}/32"
    next_hop_type          = "VirtualAppliance"
    next_hop_in_ip_address = module.nva-nic.private_ip_address
  }

  route {
    name                   = "backend-to-internet"
    address_prefix         = "0.0.0.0/0"
    next_hop_type          = "VirtualAppliance"
    next_hop_in_ip_address = module.nva-nic.private_ip_address
  }
}

resource "azurerm_subnet_route_table_association" "backend-subnet-association" {
  subnet_id      = azurerm_subnet.backend-subnet.id
  route_table_id = azurerm_route_table.backend-rules.id
}
### Route Table Rules ###
