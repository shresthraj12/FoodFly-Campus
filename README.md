# FoodFly

A modern full-stack food delivery web application built to demonstrate a complete DevOps workflow.

## Features

- **Frontend**: React + Vite + Tailwind CSS (v4)
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT Based Roles (Customer, Seller, Admin)
- **DevOps Stack**: Docker, Jenkins, Nginx, Prometheus, Grafana

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Jenkins (For CI/CD Pipeline)

## Getting Started Locally (Without Docker)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Running with Docker Compose (Recommended)

To start the entire stack (Frontend, Backend, MongoDB, Nginx, Prometheus, Grafana):

```bash
docker-compose up -d --build
```

### Accessing Services

- **Web App (Nginx)**: http://localhost:8080
- **Frontend Dev (Direct)**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Grafana Dashboard**: http://localhost:3001 (User: admin / Pass: admin)
- **Prometheus Metrics**: http://localhost:9090

## DevOps Pipeline (Jenkins)

1. Setup Jenkins on your machine/server.
2. Create a new Pipeline job.
3. Point it to this repository or copy the contents of the `Jenkinsfile`.
4. Run the pipeline. It will clone the code, install dependencies, run tests, build docker images, and start the containers.

## Monitoring setup

1. Go to Grafana at `http://localhost:3001`
2. Add a new Data Source -> Prometheus. Set URL to `http://prometheus:9090`.
3. Create a Dashboard and import a Node.js Express dashboard template (e.g., ID 11159) to visualize the `prom-client` metrics from the backend.
