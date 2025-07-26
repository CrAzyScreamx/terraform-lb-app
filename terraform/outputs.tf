output "nva_private_ip" {
  value = azurerm_network_interface.nva-nic.private_ip_address
}

output "frontend_public_ip" {
  value = azurerm_public_ip.frontend-pip.ip_address
}

output "backend_private_ips" {
  value = azurerm_network_interface.backend-nic[*].private_ip_address
}

output "frontend_private_ip" {
  value = azurerm_network_interface.frontend-nic.private_ip_address
}
