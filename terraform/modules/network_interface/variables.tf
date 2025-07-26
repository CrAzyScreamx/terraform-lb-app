variable "name" {
  description = "The name of the network interface."
  type        = string
}

variable "location" {
  description = "The location where the network interface will be created."
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group where the network interface will be created."
  type        = string
}

variable "ip_configuration_name" {
  description = "The name of the IP configuration."
  type        = string
  default     = "internal"
}

variable "ip_configuration_subnet_id" {
  description = "The ID of the subnet for the IP configuration."
  type        = string
}

variable "ip_configuration_private_ip_address_allocation" {
  description = "The private IP address allocation method for the IP configuration."
  type        = string
  default     = "Dynamic"
}

variable "ip_configuration_public_ip_address_id" {
  description = "The ID of the public IP address for the IP configuration."
  type        = string
  default     = null
}
