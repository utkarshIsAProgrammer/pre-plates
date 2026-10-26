# Deployment & DevOps Guide — PrePlates

This document outlines the deployment strategy, free-tier optimization, and operational guidelines for **PrePlates**. PrePlates follows the **unified single-service deployment model** (identical to Knots), consolidating the React 19 Vite frontend and Express 5 backend into a single lightweight execution unit to maximize performance and minimize cloud resource consumption.

---

## 1. Architectural Strategy: The Single-Service Model

In typical microservice or decoupled frontend/backend deployments, two separate services are hosted (e.g. one static site and one API web service). On free cloud tiers, this presents major drawbacks:

| Metric | Decoupled (2 Services) | PrePlates Unified Model (1 Service) |
| :--- | :--- | :--- |
| **Free Tier Hours Consumption** | 2 × 750h = 1,500h/mo *(exceeds free tiers)* | **1 × 750h/mo** *(100% within free quota)* |
| **Cold Starts** | Double cold start; frontend renders broken state while API spins up | **Single cold start**; frontend and API warm up simultaneously |
| **CORS Latency** | Preflight `OPTIONS` request before every mutative API call | **Zero CORS latency**; same-origin `/api/*` execution |
| **Asset Delivery** | Dependent on external static CDN routing rules | Built-in Express caching (`immutable` 1-year cache headers) |
| **RAM Footprint** | ~250MB–350MB combined | **< 120MB total container footprint** |

---

## 2. Multi-Stage Docker Build (Production Container)

PrePlates includes a multi-stage `Dockerfile` based on `node:20-alpine`:

```dockerfile
# --- Stage 1: Build Frontend SPA ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Stage 2: Install Server Dependencies ---
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy server and built client
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY server/ ./server
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 5000

WORKDIR /app/server
CMD ["node", "src/server.js"]
```

### Building & Running with Docker Locally:
```bash
# 1. Build the image
docker build -t preplates .

# 2. Run the container on port 5000
docker run -d \
  -p 5000:5000 \
  --env-file server/.env \
  --name preplates-app \
  preplates
```

---

## 3. Deployment Targets

### Option A: Vercel (Frontend SPA) + Render (Backend API)

This is the decoupled deployment model where the React Vite SPA runs on Vercel's global CDN and the Express API runs on Render.

#### 1. Deploy the Backend to Render:
1. Push your repository to GitHub.
2. In the **Render Dashboard**, click **New + → Web Service**.
3. Select your repository:
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Set Environment Variables in Render:
   - `MONGO_URI`: MongoDB connection string
   - `NODE_ENV`: `production`
   - `CLERK_SECRET_KEY`: Clerk secret key
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
   - `CLIENT_URL`: `https://your-preplates.vercel.app` (your Vercel frontend URL)
   - *(Optional)*: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
5. Note your Render URL (e.g., `https://preplates-backend.onrender.com`).

#### 2. Deploy the Frontend to Vercel:
1. In the **Vercel Dashboard**, click **Add New → Project**.
2. Import your GitHub repository:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (or root `./` using the included `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables in Vercel:
   - `VITE_CLERK_PUBLISHABLE_KEY`: `pk_test_...`
   - `VITE_API_URL`: `https://preplates-backend.onrender.com` (your Render backend URL)
4. Click **Deploy**. Vercel will build and serve your SPA globally with full client-side routing support via `vercel.json`.

---

### Option B: Unified Single-Service on Render (1-Click Blueprint)

PrePlates includes a tailored `render.yaml` blueprint.

1. Connect your GitHub repository to Render.
2. In the Render Dashboard, click **New + → Blueprint** and select the repository.
3. Supply required environment variables:
   - `MONGO_URI`: MongoDB Atlas connection string.
   - `CLERK_SECRET_KEY`: Clerk backend secret key.
   - `VITE_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
   - `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY`: Web push encryption keys.
4. Render builds the client via `npm run install:all && npm run build` and boots the single web service with `npm start`.

### Option B: Koyeb / Fly.io / Railway / Docker-based Hosts

Because PrePlates has a self-contained multi-stage `Dockerfile`, it can be deployed directly to any container-based cloud platform with zero build configuration:
- Set port to `5000` (or leave host to set `PORT`).
- Pass environment secrets via the platform's dashboard.
- Set health check path to `/api/health`.

### Option C: Self-Hosted VPS (DigitalOcean / Hetzner / AWS / Oracle Free Tier)

Using Docker or PM2:

```bash
# Clone repository
git clone https://github.com/utkarshIsAProgrammer/pre-plates.git preplates
cd preplates

# Install dependencies and build frontend
npm run install:all
npm run build

# Run via PM2 with memory ceiling
pm2 start server/src/server.js --name "preplates" --max-memory-restart 200M
```

---

## 4. Free-Tier Service Matrix & Zero-Cost Stack

| Service | Free Tier Allocation | PrePlates Configuration |
| :--- | :--- | :--- |
| **Render Web Service** | 750 free instance hours/month | Unified single service prevents quota exhaustion |
| **MongoDB Atlas** | M0 Sandbox (512MB storage, shared RAM) | Indexed queries; TTL expiration on temp orders |
| **Upstash Redis** | Serverless REST API (10,000 commands/day) | Shared IP/user rate limiting and menu read cache |
| **Clerk** | 10,000 monthly active users (MAUs) | Handles auth, JWT validation, and user sessions |
| **Cloudinary** | 25 monthly credits (~25,000 transformations) | Stores and serves menu dish photography |
| **Web Push (VAPID)** | 100% Free / Uncapped | Native browser push notifications via W3C standard |

---

## 5. Free-Tier Performance Tuning

### 1. Eliminating Cold Starts
Render free services spin down after 15 minutes of inactivity. To keep the service warm and responsive for canteen hours without exceeding 750 hours:
- Use an external cron/ping monitor (e.g. UptimeRobot, Cron-Job.org, or BetterStack) pinging `/api/health` once every 14 minutes during campus lunch hours (e.g., 9:00 AM – 6:00 PM).
- Outside canteen operating hours, allow the service to idle and conserve free hours.

### 2. Static Asset Caching Strategy
In `server/src/server.js`:
- Assets in `/assets/*` are fingerprinted with content hashes by Vite. They are served with:
  `Cache-Control: public, max-age=31536000, immutable`
- Application root (`index.html`), service worker (`sw.js`), and Web App Manifest (`manifest.webmanifest`) are served with:
  `Cache-Control: no-cache, no-store, must-revalidate`
  This ensures mobile PWAs and browsers always get updates instantly while consuming zero extra server bandwidth for scripts and stylesheets.

---

## 6. Health Checks & Verification

After deployment, verify the service status:

```bash
# Check service health and database connection
curl -i https://your-preplates-url.onrender.com/api/health
```

Expected JSON response:
```json
{
  "success": true,
  "db": "connected",
  "uptime": 12.34
}
```
