#!/bin/bash
set -e

echo "🚀 Starting Minikube..."
minikube start --driver=docker

echo "🔌 Enabling Ingress..."
minikube addons enable ingress

echo "🔧 Patching ingress-nginx service to LoadBalancer..."
kubectl patch svc ingress-nginx-controller \
  -n ingress-nginx \
  -p '{"spec": {"type": "LoadBalancer"}}'

echo "⏱ Waiting for ingress-nginx-controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

echo "▶️ Running Skaffold..."
skaffold run

HOSTNAME=$(hostname -f)

echo "🌐 Patching Ingress host to $HOSTNAME..."
kubectl patch ingress campus-connect-ingress \
  --type merge -n default \
  -p "{\"spec\":{\"rules\":[{\"host\":\"$HOSTNAME\"}]}}"

echo "⚙️ Patching ConfigMap DOMAIN + SITE_DOMAIN to $HOSTNAME..."
kubectl patch configmap campus-connect-config \
  -n default \
  --type merge \
  -p "{\"data\": {\"DOMAIN\": \"$HOSTNAME\", \"SITE_DOMAIN\": \"http://$HOSTNAME\"}}"

echo "🧰 Installing socat if needed..."
sudo apt-get install -y socat

echo "🌉 Starting Minikube tunnel (this will block the terminal)..."
nohup sudo socat TCP-LISTEN:80,fork TCP:192.168.49.2:80 > socat.log 2>&1 &

echo ""
echo "✅ All done! App should be accessible at: http://$HOSTNAME"
echo ""
