locals {
  azure_frontend_subnet = cidrsubnet(var.azure_vnet, 8, 1)
  azure_nva_subnet      = cidrsubnet(var.azure_vnet, 8, 2)
  azure_backend_subnet  = cidrsubnet(var.azure_vnet, 8, 3)
  azure_mysql_subnet    = cidrsubnet(var.azure_vnet, 8, 4)
}
