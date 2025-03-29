#!/bin/bash
set -e

echo "📦 Installing Minikube..."
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64

echo "📦 Installing Skaffold..."
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
sudo install skaffold /usr/local/bin/ && rm skaffold

echo "📦 Installing Docker..."
sudo apt-get update
sudo apt-get install -y docker.io

echo "📦 Installing kubectl..."
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && rm kubectl

echo "👥 Adding $USER to docker group..."
sudo usermod -aG docker $USER

echo ""
echo "⚠️  You must now run: newgrp docker"
echo "   Then run: ./startup.sh"
echo ""
