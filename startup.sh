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
echo "🌐 Setting hostname to $HOSTNAME in Ingress and ConfigMap..."

# Apply full Ingress manifest with updated host
echo "📄 Applying Ingress definition..."
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: campus-connect-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: "nginx"
spec:
  ingressClassName: "nginx"
  rules:
  - host: $HOSTNAME
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: campus-connect-backend-service
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: campus-connect-frontend-service
            port:
              number: 80
EOF

# Apply full ConfigMap manifest with updated hostname
echo "📄 Applying ConfigMap definition..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: campus-connect-config
  namespace: default
data:
  HOST: "0.0.0.0"
  DOMAIN: "$HOSTNAME"
  BACKEND_PORT: "3000"
  FRONTEND_PORT: "8080"
  MONGO_HOST: "mongo"
  MONGO_PORT: "27017"
  MONGO_DB: "campusconnect_db"
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
  REDIS_PASSWORD: "super_secret_password"
  SESSION_SECRET: "super_secret_key"
  LOG_LEVEL: "info"
  NGINX_BACKEND_UPSTREAM: "campus-connect-backend-service:3000"
  NGINX_FRONTEND_UPSTREAM: "campus-connect-frontend-service:80"
  ENCRYPTION_KEY: "super_secret"
  NODE_ENV: "production"
  SITE_DOMAIN: "http://$HOSTNAME"
  API_PREFIX: "api"
  PORT: "3000"
  REST_API_BASE: "api"
  SESSION_LIFETIME: "86400000"
  COOKIE_SECURE: "false"
  COOKIE_SAME_SITE: "strict"
  CORS_ORIGIN: "*"
  NGINX_NODE_PORT: "80"
EOF

echo "🧰 Installing socat if needed..."
sudo apt-get install -y socat

echo "🌉 Starting Minikube tunnel..."
sudo nohup minikube tunnel > tunnel.log 2>&1 &

echo "🔁 Starting socat port forward from 80 -> 192.168.49.2:80..."
nohup sudo socat TCP-LISTEN:80,fork TCP:192.168.49.2:80 > socat.log 2>&1 &

echo ""
echo "✅ All done! App should be accessible at: http://$HOSTNAME"
echo ""
