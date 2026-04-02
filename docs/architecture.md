sudo mkdir -p /var/lib/cloud-ide/projects
sudo mkdir -p /var/cache/cloud-ide/pnpm-store
sudo mkdir -p /var/log/cloud-ide
sudo mkdir -p /var/tmp/cloud-ide
sudo chown -R $USER:$USER /var/lib/cloud-ide
sudo chown -R $USER:$USER /var/cache/cloud-ide
sudo chown -R $USER:$USER /var/log/cloud-ide
sudo chown -R $USER:$USER /var/tmp/cloud-ide
