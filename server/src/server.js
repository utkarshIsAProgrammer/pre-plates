import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectDB } from "./db/db.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import { authRoutes } from "./routes/auth.routes.js";
import { canteenRoutes } from "./routes/canteen.routes.js";
import { menuRoutes } from "./routes/menu.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";
import { pushRoutes } from "./routes/push.routes.js";
import { uploadRoutes } from "./routes/upload.routes.js";

const app = express();
const port = process.env.PORT || 5000;

app.set("trust proxy", 1); // correct client IPs behind reverse proxies (needed for rate limiting later)

const clientUrlEnv = process.env.CLIENT_URL;
let corsOrigin = true;
if (clientUrlEnv && clientUrlEnv.trim() !== "*") {
    const origins = clientUrlEnv
        .split(",")
        .map((s) => s.trim().replace(/\/+$/, ""))
        .filter(Boolean);
    corsOrigin = origins.length === 1 ? origins[0] : origins;
}

app.use(
    cors({
        origin: corsOrigin,
        credentials: true,
    }),
);
app.use(express.json({ limit: "7mb" })); // base64 uploads ride as data URLs — headroom for 5MB client cap + base64 overhead (~33%)
app.use(express.urlencoded({ limit: "7mb", extended: true }));
app.use(clerkMiddleware());

// global ceiling — per-user buckets, IP fallback (campus NAT safe)
app.use("/api", globalLimiter);

// liveness probe for uptime monitors / Render health checks
app.get("/api/health", (req, res) => {
    const dbState = mongoose.connection.readyState; // 1 = connected
    res.status(dbState === 1 ? 200 : 503).json({
        success: dbState === 1,
        db: dbState === 1 ? "connected" : "disconnected",
        uptime: process.uptime(),
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/canteens", canteenRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/uploads", uploadRoutes);

// Locate frontend dist directory across environments (Docker, root npm start, or server/ start)
const clientDistCandidates = [
    path.join(__dirname, "../../client/dist"),
    path.join(__dirname, "../client/dist"),
    path.resolve(process.cwd(), "client/dist"),
    path.resolve(process.cwd(), "../client/dist"),
];
const clientDistPath = clientDistCandidates.find((p) => fs.existsSync(p));

if (clientDistPath) {
    console.log(`[PrePlates] Serving static frontend from: ${clientDistPath}`);

    // Serve built frontend assets in production with aggressive caching for hashed assets
    app.use(
        express.static(clientDistPath, {
            maxAge: "1y",
            immutable: true,
            setHeaders: (res, filePath) => {
                // index.html, service worker, and webmanifest must never be stale-cached
                if (
                    filePath.endsWith("index.html") ||
                    filePath.endsWith("sw.js") ||
                    filePath.endsWith("manifest.webmanifest")
                ) {
                    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                } else if (filePath.includes("/assets/")) {
                    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
                }
            },
        }),
    );

    // SPA fallback — send index.html for all non-API GET requests
    app.use((req, res, next) => {
        if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/health")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            return res.sendFile(path.join(clientDistPath, "index.html"));
        }
        next();
    });
}

// 404 for unknown API routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// central error handler — bad JSON bodies and unexpected errors become clean responses
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed" || err.status === 400) {
        return res.status(400).json({
            success: false,
            message: "Invalid request body!",
        });
    }

    console.error("Unhandled error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error!",
    });
});

const server = app.listen(port, () => {
    console.log(`[PrePlates] Server running on PORT: ${port}`);
});

// graceful shutdown — stop accepting new requests, finish in-flight ones, close DB
const shutdown = async (signal) => {
    console.log(`${signal} received — shutting down gracefully…`);

    server.close(async () => {
        try {
            await mongoose.connection.close();
            console.log("Server and DB connection closed.");
            process.exit(0);
        } catch (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
        }
    });

    // force-exit if connections hang around
    setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

connectDB();
