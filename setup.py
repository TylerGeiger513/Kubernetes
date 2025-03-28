#!/usr/bin/env python3
import argparse
import subprocess
import sys
import logging
import os
import time
import json

# Configure logging to output to stdout
logging.basicConfig(level=logging.DEBUG, format='[%(levelname)s] %(message)s', stream=sys.stdout)

# Define services
BUILDABLE_SERVICES = ['backend', 'frontend']
ALL_SERVICES = ['backend', 'frontend']
OTHER_SERVICES = ['mongo', 'redis', 'mongo-pvc', 'ingress']

# Folder where Kubernetes manifests are stored
K8S_FOLDER = "kubernetes"

# Global variable to hold the tunnel process
tunnel_process = None

def run_command(command, cwd=None, check=True):
    """Run a shell command and stream its output live."""
    logging.debug(f"Running command: {command}")
    process = subprocess.Popen(command, shell=True, cwd=cwd, stdout=sys.stdout, stderr=sys.stderr)
    return_code = process.wait()
    if check and return_code != 0:
        logging.error(f"Command failed (return code {return_code}): {command}")
        sys.exit(return_code)

def start_minikube():
    """Start Minikube if it is not already running."""
    try:
        result = run_command("minikube status --format '{{.Host}}'", check=False)
        status = result.stdout.strip().lower()
        if status != "running":
            logging.info("Minikube is not running. Starting Minikube...")
            run_command("minikube start --driver=docker")
        else:
            logging.info("Minikube is already running.")
    except Exception as e:
        logging.error("Error starting Minikube", exc_info=True)
        sys.exit(1)

def enable_minikube_ingress():
    """Enable the Minikube ingress addon and start the tunnel in the background."""
    logging.info("Enabling Minikube ingress addon...")
    run_command("minikube addons enable ingress")
    global tunnel_process
    logging.info("Starting minikube tunnel in the background...")
    # Start the tunnel as a background process.
    tunnel_process = subprocess.Popen("minikube tunnel", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    # Wait a few seconds to allow the tunnel to initialize.
    time.sleep(5)

def wait_for_ingress_admission(timeout=120):
    """Wait until the ingress-nginx-controller pods are running and ready (i.e. the admission webhook is available)."""
    logging.info("Waiting for ingress admission webhook to become available...")
    start_time = time.time()
    while True:
        try:
            result = run_command("kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx-controller -o json", check=False)
            pods = json.loads(result.stdout).get("items", [])
            ready = any(
                any(cond.get("type") == "Ready" and cond.get("status") == "True" for cond in pod.get("status", {}).get("conditions", []))
                for pod in pods
            )
            if ready:
                logging.info("Ingress admission webhook is available.")
                break
        except Exception as e:
            logging.debug(f"Waiting for ingress admission: {e}")
        if time.time() - start_time > timeout:
            logging.error("Timed out waiting for ingress admission webhook.")
            sys.exit(1)
        time.sleep(5)

def shutdown_minikube_and_ingress():
    """Stop Minikube, terminate the tunnel process, and disable the ingress addon."""
    global tunnel_process
    if tunnel_process:
        logging.info("Terminating minikube tunnel...")
        tunnel_process.terminate()
        try:
            tunnel_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            logging.info("Minikube tunnel did not terminate, killing it...")
            tunnel_process.kill()
        tunnel_process = None
    logging.info("Stopping Minikube...")
    run_command("minikube stop")
    logging.info("Disabling Minikube ingress addon...")
    run_command("minikube addons disable ingress")

def build_service(service, nocache):
    """Build a Docker image for the given service if it is buildable."""
    if service not in BUILDABLE_SERVICES:
        logging.info(f"Service '{service}' is not buildable. Skipping image build.")
        return
    dockerfile = f"Dockerfile.{service}.prod"
    tag = f"campus-connect-{service}:latest"
    nocache_flag = "--no-cache" if nocache else ""
    command = f"docker build {nocache_flag} -f {dockerfile} -t {tag} ."
    logging.info(f"Building {service} image with command: {command}")
    run_command(command)
    logging.info(f"{service} image built successfully.")

def deploy_kubernetes(service=None):
    """Deploy Kubernetes manifests for either a single service or all services."""
    logging.info("Starting Kubernetes deployment...")
    start_minikube()
    enable_minikube_ingress()
    wait_for_ingress_admission(timeout=120)
    time.sleep(5)  # Allow extra time for stability

    manifests = [
        f"{K8S_FOLDER}/configmap.yaml",
        f"{K8S_FOLDER}/backend-deployment.yaml",
        f"{K8S_FOLDER}/backend-service.yaml",
        f"{K8S_FOLDER}/frontend-deployment.yaml",
        f"{K8S_FOLDER}/frontend-service.yaml",
        f"{K8S_FOLDER}/ingress.yaml",
        f"{K8S_FOLDER}/mongo-deployment.yaml",
        f"{K8S_FOLDER}/mongo-service.yaml",
        f"{K8S_FOLDER}/redis-deployment.yaml",
        f"{K8S_FOLDER}/redis-service.yaml",
        f"{K8S_FOLDER}/mongo-pvc.yaml"
    ]
    if service:
        if service == "backend":
            manifests = [f"{K8S_FOLDER}/backend-deployment.yaml", f"{K8S_FOLDER}/backend-service.yaml"]
        elif service == "frontend":
            manifests = [f"{K8S_FOLDER}/frontend-deployment.yaml", f"{K8S_FOLDER}/frontend-service.yaml"]
        elif service == "mongo":
            manifests = [f"{K8S_FOLDER}/mongo-deployment.yaml", f"{K8S_FOLDER}/mongo-service.yaml"]
        elif service == "redis":
            manifests = [f"{K8S_FOLDER}/redis-deployment.yaml", f"{K8S_FOLDER}/redis-service.yaml"]
    for manifest in manifests:
        command = f"kubectl apply -f {manifest}"
        logging.info(f"Applying manifest: {manifest}")
        run_command(command)
    logging.info("Kubernetes deployment complete.")

def shutdown_service(service, force, all_pods):
    """Shutdown the specified service or all services via kubectl delete."""
    force_flag = "--grace-period=0 --force" if force else ""
    logging.info("Starting shutdown process...")

    if all_pods:
        logging.info("Shutting down all Campus Connect services (all pods)...")
        run_command(f"kubectl delete deployment --all {force_flag}", check=False)
        run_command(f"kubectl delete pod --all {force_flag}", check=False)
        run_command(f"kubectl delete service --all {force_flag}", check=False)
        run_command(f"kubectl delete -f {K8S_FOLDER}/ingress.yaml {force_flag}", check=False)
        shutdown_minikube_and_ingress()
        return

    targets = ALL_SERVICES if service is None else [service]
    for svc in targets:
        deployment = f"campus-connect-{svc}"
        command = f"kubectl delete deployment {deployment} {force_flag}"
        logging.info(f"Shutting down deployment for {svc}: {command}")
        run_command(command, check=False)

    for stateful_svc in ["mongo", "redis"]:
        command = f"kubectl delete deployment {stateful_svc} {force_flag}"
        logging.info(f"Shutting down {stateful_svc} deployment: {command}")
        run_command(command, check=False)
        command = f"kubectl delete pod -l app={stateful_svc} {force_flag}"
        logging.info(f"Deleting remaining {stateful_svc} pods: {command}")
        run_command(command, check=False)

    for svc in OTHER_SERVICES + ALL_SERVICES:
        command = f"kubectl delete service {svc} {force_flag}"
        logging.info(f"Deleting service {svc}: {command}")
        run_command(command, check=False)
    
    command = f"kubectl delete -f {K8S_FOLDER}/ingress.yaml {force_flag}"
    logging.info(f"Deleting ingress manifest: {command}")
    run_command(command, check=False)
    
    logging.info("Shutdown process complete. Stopping Minikube and cleaning up tunnel...")
    shutdown_minikube_and_ingress()

def restart_service(service, nocache):
    """Restart the specified service (or all) by shutting down, then rebuilding and redeploying."""
    logging.info(f"Restarting service(s): {service if service else 'all'}")
    shutdown_service(service, force=True, all_pods=False)
    targets = ALL_SERVICES if service is None else [service]
    for svc in targets:
        build_service(svc, nocache)
    deploy_kubernetes(service)

def rebuild_service(service, nocache):
    """Rebuild Docker images for service(s) and trigger a Kubernetes rollout restart."""
    logging.info(f"Rebuilding service(s): {service if service else 'all buildable services'}")
    targets = BUILDABLE_SERVICES if service is None else [service]
    for svc in targets:
        build_service(svc, nocache)
        deployment = f"campus-connect-{svc}"
        command = f"kubectl rollout restart deployment/{deployment}"
        logging.info(f"Restarting deployment for {svc} with command: {command}")
        run_command(command)
        
def tail_logs(service):
    """Tail logs for the specified service's deployment."""
    deployment = f"campus-connect-{service}"
    command = f"kubectl logs deployment/{deployment} -f"
    logging.info(f"Tailing logs for {service}: {command}")
    run_command(command, check=False)

def clear_builds():
    """Remove locally built Docker images for buildable services."""
    images = [f"campus-connect-{svc}:latest" for svc in BUILDABLE_SERVICES]
    for image in images:
        command = f"docker rmi {image}"
        logging.info(f"Removing Docker image: {image}")
        run_command(command, check=False)

def parse_args():
    parser = argparse.ArgumentParser(description="Campus Connect Production Setup Script")
    subparsers = parser.add_subparsers(dest="command", required=True)

    build_parser = subparsers.add_parser("build", help="Build Docker images and deploy via Kubernetes")
    build_parser.add_argument("target", nargs="?", choices=BUILDABLE_SERVICES, help="Service to build (default: all buildable)")
    build_parser.add_argument("--nocache", action="store_true", help="Build images with --no-cache")

    shutdown_parser = subparsers.add_parser("shutdown", help="Shutdown Kubernetes deployments")
    shutdown_parser.add_argument("target", nargs="?", choices=ALL_SERVICES, help="Service to shutdown (default: all)")
    shutdown_parser.add_argument("--force", action="store_true", help="Force shutdown")
    shutdown_parser.add_argument("--all-pods", action="store_true", help="Shutdown all pods for the application")

    restart_parser = subparsers.add_parser("restart", help="Restart service(s): shutdown then rebuild and redeploy")
    restart_parser.add_argument("target", nargs="?", choices=ALL_SERVICES, help="Service to restart (default: all buildable; non-buildable services will be restarted via deletion)")
    restart_parser.add_argument("--nocache", action="store_true", help="Rebuild images with --no-cache (only applicable for buildable services)")

    rebuild_parser = subparsers.add_parser("rebuild", help="Rebuild Docker images for service(s) and trigger a Kubernetes rollout restart")
    rebuild_parser.add_argument("target", nargs="?", choices=BUILDABLE_SERVICES, help="Service to rebuild (default: all buildable)")
    rebuild_parser.add_argument("--nocache", action="store_true", help="Rebuild images with --no-cache")

    logs_parser = subparsers.add_parser("logs", help="Tail logs for a service")
    logs_parser.add_argument("target", choices=ALL_SERVICES, help="Service to view logs")

    clear_parser = subparsers.add_parser("clear-builds", help="Clear locally built Docker images for buildable services")
    
    return parser.parse_args()

def main():
    args = parse_args()
    logging.debug(f"Parsed arguments: {args}")

    if args.command == "build":
        target = args.target if args.target else None
        if target:
            build_service(target, args.nocache)
        else:
            for svc in BUILDABLE_SERVICES:
                build_service(svc, args.nocache)
        deploy_kubernetes(target)

    elif args.command == "shutdown":
        target = args.target if args.target else None
        shutdown_service(target, args.force, args.all_pods)

    elif args.command == "restart":
        target = args.target if args.target else None
        restart_service(target, args.nocache)

    elif args.command == "rebuild":
        target = args.target if args.target else None
        rebuild_service(target, args.nocache)

    elif args.command == "logs":
        tail_logs(args.target)

    elif args.command == "clear-builds":
        clear_builds()
    else:
        logging.error("Unknown command")
        sys.exit(1)

if __name__ == "__main__":
    main()
