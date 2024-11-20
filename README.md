# Auth Service Prototype

## Prerequisites
- **Docker** and **Docker Compose** should be installed on your machine.

## Getting Started

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd auth-service
```

### Step 2: Set Up Environment Variables
Create a `.env` file in the `auth-service` directory with the following content:
```env
POSTGRES_HOST=192.168.0.4 (or your container ip with postgress)
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

JWT_SECRET=secret123

REDIS_URL=redis://192.168.0.4:6380
```

### Step 3: Build and Start the Project Using Docker
Navigate to the project root and run the following command:
```bash
docker-compose up --build
```

This command will:
- Build and start the backend API (NestJS) at `http://localhost:5001`
- Launch the PostgreSQL database on port `5432`

## Swagger Documentation
### The API is documented using Swagger, and the documentation can be accessed at:
-  `http://localhost:5001/api`
<img width="1673" alt="image" src="https://github.com/user-attachments/assets/eb37f84d-c878-4537-b87c-9c5bfbe59429">

