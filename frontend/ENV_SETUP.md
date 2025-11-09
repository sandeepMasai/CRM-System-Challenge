# Frontend Environment Variables Setup

This document explains how to configure environment variables for the frontend application.

## Environment Variables

The frontend uses Vite, which requires environment variables to be prefixed with `VITE_` to be exposed to the client-side code.

### Available Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` | No |
| `VITE_API_BASE_PATH` | API endpoint path | `/api` | No |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` | No |
| `VITE_FRONTEND_URL` | Frontend application URL | `http://localhost:3000` | No |
| `VITE_NODE_ENV` | Environment mode | `development` | No |

## Setup Instructions

### 1. Development Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your local configuration:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_API_BASE_PATH=/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_FRONTEND_URL=http://localhost:3000
   VITE_NODE_ENV=development
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### 2. Production Setup

For production builds, environment variables are injected at **build time** (not runtime)**.

#### Option A: Using .env file

1. Create a `.env.production` file:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   VITE_API_BASE_PATH=/api
   VITE_SOCKET_URL=https://api.yourdomain.com
   VITE_FRONTEND_URL=https://yourdomain.com
   VITE_NODE_ENV=production
   ```

2. Build the application:
   ```bash
   npm run build
   ```

#### Option B: Using Docker Build Args

When building with Docker, pass environment variables as build arguments:

```bash
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  --build-arg VITE_SOCKET_URL=https://api.yourdomain.com \
  --build-arg VITE_FRONTEND_URL=https://yourdomain.com \
  --build-arg VITE_NODE_ENV=production \
  -t crm-frontend .
```

#### Option C: Using docker-compose

Update `docker-compose.yml` or `docker-compose.prod.yml`:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      - VITE_API_URL=https://api.yourdomain.com
      - VITE_SOCKET_URL=https://api.yourdomain.com
      - VITE_FRONTEND_URL=https://yourdomain.com
      - VITE_NODE_ENV=production
```

Or use environment variables from `.env` file:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      - VITE_API_URL=${VITE_API_URL}
      - VITE_SOCKET_URL=${VITE_SOCKET_URL}
      - VITE_FRONTEND_URL=${VITE_FRONTEND_URL}
      - VITE_NODE_ENV=${VITE_NODE_ENV}
```

## How It Works

### Development Mode

- Vite proxy automatically forwards `/api` requests to the backend
- Socket.IO connects directly to the backend URL
- Environment variables are read from `.env` file

### Production Mode

- API requests use the full backend URL from `VITE_API_URL`
- Socket.IO connects to `VITE_SOCKET_URL`
- All environment variables are **baked into the build** at build time
- You cannot change these values after building without rebuilding

## Important Notes

⚠️ **Critical**: Environment variables in Vite are **static** and embedded at build time. They cannot be changed at runtime.

⚠️ **Security**: Never commit `.env` files with sensitive data. The `.env.example` file is safe to commit.

⚠️ **Docker**: When using Docker, environment variables must be passed as build arguments during the build stage, not as runtime environment variables.

## Troubleshooting

### Variables not working?

1. **Check the prefix**: All variables must start with `VITE_`
2. **Restart dev server**: After changing `.env`, restart the dev server
3. **Rebuild**: In production, you must rebuild after changing environment variables
4. **Check syntax**: Ensure no spaces around `=` in `.env` file

### Example .env file format:
```env
# ✅ Correct
VITE_API_URL=http://localhost:5000

# ❌ Wrong (spaces)
VITE_API_URL = http://localhost:5000
```

### Accessing variables in code:

```javascript
// ✅ Correct
const apiUrl = import.meta.env.VITE_API_URL

// ❌ Wrong (won't work)
const apiUrl = process.env.VITE_API_URL
```

## Production Deployment Examples

### Example 1: Same Domain
```env
VITE_API_URL=https://yourdomain.com
VITE_API_BASE_PATH=/api
VITE_SOCKET_URL=https://yourdomain.com
VITE_FRONTEND_URL=https://yourdomain.com
```

### Example 2: Separate API Domain
```env
VITE_API_URL=https://api.yourdomain.com
VITE_API_BASE_PATH=/api
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_FRONTEND_URL=https://yourdomain.com
```

### Example 3: Docker Internal Network
```env
VITE_API_URL=http://backend:5000
VITE_API_BASE_PATH=/api
VITE_SOCKET_URL=http://backend:5000
VITE_FRONTEND_URL=http://localhost:3000
```

