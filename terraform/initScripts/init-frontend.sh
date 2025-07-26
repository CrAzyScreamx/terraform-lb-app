#! /bin/bash

apt update -y
apt install -y software-properties-common git
apt-add-repository --yes --update ppa:ansible/ansible || true
apt install -y ansible

mkdir -p /opt/bootstrap
cd /opt/bootstrap
ssh-keyscan github.com >> ~/.ssh/known_hosts

ansible-pull -U https://github.com/CrAzyScreamx/terraform-lb-app.git ansible/frontend/main_playbook.yml --directory=/opt/bootstrap/ansible --checkout=master -i localhost \
--extra-vars "backend_url=${backend_url}"