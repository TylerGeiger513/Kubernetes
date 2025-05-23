#!/usr/bin/env python3
import argparse
import subprocess
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='[%(levelname)s] %(message)s')

# Define services
# Buildable services: you build images for these.
BUILDABLE_SERVICES = ['backend', 'frontend']
# All services: includes buildable and stateful (which you don't build, but can restart/shutdown).
ALL_SERVICES = ['backend', 'frontend', 'mongo', 'redis' 'mongo-pvc']

# Folder where Kubernetes manifests are stored
K8S_FOLDER = "kubernetes"

def run_command(command, cwd=None, check=True):
    """Run a shell command and log its output."""
    logging.debug(f"Running command: {command}")
    result = subprocess.run(command, shell=True, cwd=cwd)
    if check and result.returncode != 0:
        logging.error(f"Command failed: {command}")
        sys.exit(result.returncode)
    return result

def build_service(service, nocache):
    """Build a Docker image for the given service if it is buildable."""
    if service not in BUILDABLE_SERVICES:
        logging.info(f"Service '{service}' is not buildable. Skipping image build.")
        return
    dockerfile = f"Dockerfile.{service}"
    tag = f"campus-connect-{service}:latest"
    nocache_flag = "--no-cache" if nocache else ""
    command = f"docker build {nocache_flag} -f {dockerfile} -t {tag} ."
    logging.info(f"Building {service} image with command: {command}")
    run_command(command)
    logging.info(f"{service} image built successfully.")

def deploy_kubernetes(service=None):
    """Deploy Kubernetes manifests for either a single service or all services."""
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

def shutdown_service(service, force, all_pods):
    """Shutdown the specified service or all services via kubectl delete deployment."""
    force_flag = "--grace-period=0 --force" if force else ""
    if all_pods:
        targets = ALL_SERVICES
    else:
        targets = ALL_SERVICES if service is None else [service]
    for svc in targets:
        # For stateful services, assume deployment name equals "campus-connect-<service>"
        deployment = f"campus-connect-{svc}"
        command = f"kubectl delete deployment {deployment} {force_flag}"
        logging.info(f"Shutting down {svc} with command: {command}")
        run_command(command, check=False)

def restart_service(service, nocache):
    """Restart the specified service (or all) by shutting down, then rebuilding (if applicable) and redeploying."""
    logging.info(f"Restarting service(s): {service if service else 'all'}")
    # Shutdown specified service(s)
    shutdown_service(service, force=True, all_pods=False)
    # Build images if applicable
    targets = ALL_SERVICES if service is None else [service]
    for svc in targets:
        build_service(svc, nocache)
    # Deploy Kubernetes manifests for the specified service(s)
    deploy_kubernetes(service)

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

    # Build command
    build_parser = subparsers.add_parser("build", help="Build Docker images and deploy via Kubernetes")
    build_parser.add_argument("target", nargs="?", choices=BUILDABLE_SERVICES, help="Service to build (default: all buildable)")
    build_parser.add_argument("--nocache", action="store_true", help="Build images with --no-cache")

    # Shutdown command
    shutdown_parser = subparsers.add_parser("shutdown", help="Shutdown Kubernetes deployments")
    shutdown_parser.add_argument("target", nargs="?", choices=ALL_SERVICES, help="Service to shutdown (default: all)")
    shutdown_parser.add_argument("--force", action="store_true", help="Force shutdown")
    shutdown_parser.add_argument("--all-pods", action="store_true", help="Shutdown all pods for the application")

    # Restart command
    restart_parser = subparsers.add_parser("restart", help="Restart service(s): shutdown then rebuild and redeploy")
    restart_parser.add_argument("target", nargs="?", choices=ALL_SERVICES, help="Service to restart (default: all buildable; non-buildable services will be restarted via deletion)")
    restart_parser.add_argument("--nocache", action="store_true", help="Rebuild images with --no-cache (only applicable for buildable services)")

    # Logs command
    logs_parser = subparsers.add_parser("logs", help="Tail logs for a service")
    logs_parser.add_argument("target", choices=ALL_SERVICES, help="Service to view logs")

    # Clear builds command
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

    elif args.command == "logs":
        tail_logs(args.target)

    elif args.command == "clear-builds":
        clear_builds()
    else:
        logging.error("Unknown command")
        sys.exit(1)

if __name__ == "__main__":
    main()
