# 📌 **CI/CD Pipeline with Jenkins, Docker, and Kubernetes (Minikube)**

This project demonstrates a complete CI/CD pipeline that automatically builds, pushes, and deploys a Node.js application using:

* **GitHub** → Source Code
* **Jenkins** → CI/CD Automation
* **Docker** → Build & Push Image
* **DockerHub** → Image Registry
* **Kubernetes (Minikube)** → Deployment
* **kubectl** → Apply manifests & rollout updates

---

# 📁 Project Structure

```
K8s_ci-cd_pipeline/
│
├── app.js
├── package.json
├── Dockerfile
├── Jenkinsfile
│
└── k8s/
    └── app-deployment.yaml
```
🖼 Pipeline Flow Diagram
![Jenkins Pipeline Flow](./images/pipeline-flow.png)


---

# 🚀 **1. Application Overview**

A simple Node.js Express app:

`app.js`

```js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('CI/CD App v1');
});

app.listen(PORT, () => console.log("App running"));
```

---

# 🐳 **2. Dockerfile**

Used by Jenkins to build the image.

```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

# ☸ **3. Kubernetes Deployment (k8s/app-deployment.yaml)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cicd-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cicd-app
  template:
    metadata:
      labels:
        app: cicd-app
    spec:
      containers:
      - name: app
        image: charanb123/cicd-demo-app:1
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: cicd-service
spec:
  type: NodePort
  selector:
    app: cicd-app
  ports:
  - port: 3000
    nodePort: 30001
```

---

# 🔧 **4. Jenkinsfile (Full CI/CD Pipeline)**

```groovy
pipeline {
    agent any

    environment {
        DOCKER_USER = "charanb123"
        DOCKER_IMAGE = "cicd-demo-app"
        KUBE_CRED = "kubeconfig-cred"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'git-cred', url: 'https://github.com/Charan290403/K8s_ci-cd_pipeline.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_USER}/${DOCKER_IMAGE}:${BUILD_NUMBER} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([string(credentialsId: 'docker-pass', variable: 'DOCKER_PASS')]) {
                    sh """
                        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                        docker push ${DOCKER_USER}/${DOCKER_IMAGE}:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: "${KUBE_CRED}"]) {
                    sh """
                        kubectl apply -f k8s/app-deployment.yaml
                        kubectl set image deployment/cicd-app app=${DOCKER_USER}/${DOCKER_IMAGE}:${BUILD_NUMBER}
                        kubectl rollout status deployment/cicd-app
                    """
                }
            }
        }
    }
}
```

---

# 🧰 **5. Jenkins Setup**

### ✔ Install Required Plugins

* Kubernetes CLI
* Docker Pipeline
* Git Plugin
* Credentials Binding

### ✔ Add Credentials

| Type                | ID              | Description        |
| ------------------- | --------------- | ------------------ |
| Username + Password | docker-pass     | DockerHub password |
| Secret Text         | git-cred        | GitHub token       |
| Secret File         | kubeconfig-cred | Kubeconfig file    |

---

# ☸ **6. Kubernetes Setup (Minikube)**

Start cluster:

```sh
minikube start
```

Get Minikube IP:

```sh
minikube ip
```

Apply deployment:

```sh
kubectl apply -f k8s/app-deployment.yaml
```

Check pods:

```sh
kubectl get pods
```

---

# 🔄 **7. How the Pipeline Works**

### 🔹 Step 1 — Developer commits code to GitHub

GitHub → triggers Jenkins (Webhook recommended)

### 🔹 Step 2 — Jenkins builds Docker image

```
docker build -t charanb123/cicd-demo-app:BUILD_NUMBER .
```

### 🔹 Step 3 — Jenkins pushes image to DockerHub

```
docker push charanb123/cicd-demo-app:BUILD_NUMBER
```

### 🔹 Step 4 — Jenkins updates Kubernetes deployment

```
kubectl set image deployment/cicd-app app=charanb123/cicd-demo-app:BUILD_NUMBER
```

### 🔹 Step 5 — Kubernetes rolls out update

```
kubectl rollout status deployment/cicd-app
```

---

# 🌐 **8. Access the Application**

Use Minikube IP and NodePort:

```
http://<minikube-ip>:30001
```

Example:

```
http://192.168.49.2:30001
```

---

# 🧪 **9. Test Pod Internally**

```sh
kubectl exec -it deployment/cicd-app -- curl localhost:3000
```

Output:

```
CI/CD App v1
```

---

# 🛠 **10. Logs & Debugging**

### Check pod logs:

```sh
kubectl logs -f deployment/cicd-app
```

### Restart rollout:

```sh
kubectl rollout restart deployment/cicd-app
```

### Describe service:

```sh
kubectl describe svc cicd-service
```

---

# 🎉 **11. Good Practices**

* Always update Kubernetes YAML image tag only via Jenkins
* Never hardcode version in YAML (initial deployment only)
* Use `BUILD_NUMBER` to version Docker images
* Keep kubeconfig in Jenkins credentials

---

# ✔ **12. Final Notes**

This repository contains everything needed to run a full CI/CD pipeline:

✔ GitHub → Jenkins Webhook
✔ Jenkins → Docker Build + Push
✔ Kubernetes → Automatic deployment
✔ Minikube → Local testing
✔ NodePort → External access

---
