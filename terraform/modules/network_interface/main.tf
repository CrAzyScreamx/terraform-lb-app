resource "azurerm_network_interface" "main" {
  name                  = var.name
  location              = var.location
  resource_group_name   = var.resource_group_name
  ip_forwarding_enabled = var.ip_forwarding_enabled

  ip_configuration {
    name                          = var.ip_configuration_name
    subnet_id                     = var.ip_configuration_subnet_id
    private_ip_address_allocation = var.ip_configuration_private_ip_address_allocation
    public_ip_address_id          = var.ip_configuration_public_ip_address_id
  }
}
