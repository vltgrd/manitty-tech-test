# Manitty Tech Test

## 🛠️ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/vltgrd/manitty-tech-test
cd manitty-tech-test
```

### 2. Set up environment variables

Copy your `.env` files into both the `backend` and `frontend` folders, replacing the existing `.env.example` files.

### 3. Start the application

Use Docker Compose to build and run the project:

```bash
docker-compose up --build
```

Once running, access the app at: [http://localhost:3000](http://localhost:3000)

---

## Using existing Docker images

If you already have the pre-built Docker images, follow these steps:

### 1. Load Docker images

```bash
docker load -i manitty-tech-test-frontend.tar.gz
docker load -i manitty-tech-test-backend.tar.gz
```

### 2. Create a Docker network

```bash
docker network create manitty-network
```

### 3. Start the containers

**Start the backend first:**

```bash
docker run -d -p 5555:5555 --name backend --network manitty-network manitty-tech-test-backend
```

**Then the frontend:**

```bash
docker run -d -p 3000:3000 --name frontend --network manitty-network manitty-tech-test-frontend
```

Access the app at: [http://localhost:3000](http://localhost:3000)

---

### 💡 All-in-one command

```bash
docker load -i manitty-tech-test-frontend.tar.gz && 
docker load -i manitty-tech-test-backend.tar.gz && 
docker network create manitty-network && 
docker run -d -p 5555:5555 --name backend --network manitty-network manitty-tech-test-backend && 
docker run -d -p 3000:3000 --name frontend --network manitty-network manitty-tech-test-frontend
```

### 💡 Remove all containers, network and images

```bash
docker rm -f frontend backend &&
docker network rm manitty-network &&
docker rmi manitty-tech-test-frontend manitty-tech-test-backend
```