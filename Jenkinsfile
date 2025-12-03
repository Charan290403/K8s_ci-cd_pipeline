pipeline {
    agent any

    environment {
        DOCKER_USER = "charanb123"
        DOCKER_IMAGE = "cicd-demo-app"
        DOCKER_CRED = "dockerhub"        // DockerHub credential ID in Jenkins
        KUBE_CRED = "kube-token"         // Kubernetes token credential ID
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Charan290403/K8s_ci-cd_pipeline.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                    docker build -t $DOCKER_USER/$DOCKER_IMAGE:$BUILD_NUMBER .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh """
                echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                docker push \$DOCKER_USER/$DOCKER_IMAGE:$BUILD_NUMBER
            """
        }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: KUBE_CRED]) {
                    sh """
                    kubectl set image deployment/cicd-app app=$DOCKER_USER/$DOCKER_IMAGE:$BUILD_NUMBER
                    kubectl rollout status deployment/cicd-app
                    """
                }
            }
        }
    }
}
