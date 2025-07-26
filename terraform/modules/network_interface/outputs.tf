output "id" {
  description = "The ID of the Network Interface"
  value       = azurerm_network_interface.main.id
}

output "private_ip_address" {
  description = "The private IP address of the Network Interface"
  value       = azurerm_network_interface.main.private_ip_address
}
