#### Cloudflare ####
resource "cloudflare_zero_trust_tunnel_cloudflared" "main" {
  account_id = var.cloudflare_account_id
  name       = "Tunnel Managed by Terraform (${var.environment_name}-${var.application_name})"
}

resource "cloudflare_zero_trust_tunnel_cloudflared_route" "main" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.main.id
  network    = var.azure_vnet
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "main" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.main.id
}

resource "cloudflare_zero_trust_device_custom_profile" "main" {
  account_id       = var.cloudflare_account_id
  name             = "Device Profile - Observability Lab"
  description      = "Managed by Terraform (${var.environment_name}-${var.application_name})"
  enabled          = true
  precedence       = 1
  allowed_to_leave = true
  switch_locked    = false

  match = "os.name in {\"windows\" \"mac\" \"linux\"}"

  include = [{
    address = var.azure_vnet
  }]
}
#### Cloudflare ####
