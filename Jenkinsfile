pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_CMD = 'docker-compose'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning GitHub repository...'
                // Checks out code from the SCM (Git) repository configured in the Jenkins job
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing node dependencies for frontend and backend...'
                dir('backend') {
                    sh 'npm install'
                }
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building frontend assets (compiling Vite project)...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo 'Validating backend JavaScript syntax...'
                dir('backend') {
                    // Verifies JS files syntax correctness on the agent
                    sh 'node --check src/index.js'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Node 20 Docker images via Docker Compose...'
                sh "${DOCKER_COMPOSE_CMD} build"
            }
        }

        stage('Run Docker Containers') {
            steps {
                echo 'Deploying containers with Docker Compose...'
                sh "${DOCKER_COMPOSE_CMD} up -d"
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }
        success {
            echo 'Deployment successful! FoodFly application is up and running.'
        }
        failure {
            echo 'Deployment failed. Please check the build console logs for details.'
        }
    }
}
