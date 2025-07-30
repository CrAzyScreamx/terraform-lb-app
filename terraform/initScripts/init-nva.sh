#! /bin/bash


apt update -y
apt install -y software-properties-common git
apt-add-repository --yes --update ppa:ansible/ansible || true
apt install -y ansible ufw

mkdir -p /opt/bootstrap
cd /opt/bootstrap
ssh-keyscan github.com >> ~/.ssh/known_hosts
ansible-galaxy collection install community.general
ansible-galaxy collection install ansible.posix

ansible-pull -U https://github.com/CrAzyScreamx/terraform-lb-app.git ansible/nva/main_playbook.yml --directory=/opt/bootstrap/ansible --checkout=master -i localhost \
--extra-vars "tunnel_token=${tunnel_token} backend_subnet=${backend_subnet} frontend_subnet=${frontend_subnet} backend_port=${backend_port} lb_ip=${lb_ip}"