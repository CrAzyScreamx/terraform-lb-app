# Environment Variables
variable "environment_name" {
  type        = string
  description = "The value of the environment name"
}

variable "application_name" {
  type        = string
  description = "The value of the application name"
}

variable "azure_location" {
  type        = string
  description = "The value of the Azure location"
}

variable "azure_vnet" {
  type        = string
  description = "The value of the Azure virtual network"
  default     = "10.0.0.0/16"
}

variable "backend_count" {
  type        = number
  description = "The number of backend VMs to create"
  default     = 2
}

variable "db_password" {
  type        = string
  description = "The password for the MySQL database"
  sensitive   = true
  default     = "Aa12345@!"
}

variable "load_balancer_frontend_port" {
  type        = number
  description = "The port on which the frontend service listens"
  default     = 8000
}

variable "load_balancer_backend_port" {
  type        = number
  description = "The port on which the backend service listens"
  default     = 8000
}

# Cloudflare Variables
variable "cloudflare_account_id" {
  type        = string
  description = "The Cloudflare account ID"
  sensitive   = true
}
