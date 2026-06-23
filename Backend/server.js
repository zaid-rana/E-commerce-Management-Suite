// Load environment variables FIRST before any other imports
import "./config/envConfig.js";

import express, { json, urlencoded } from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./config/passportConfig.js"


// Routes
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/authRoutes.js";
import bannerRoutes from './routes/bannerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/webhookController.js";

const app = express();
const process = globalThis.process;
const mongoURI = process.env.MONGO_URL;

// --- 1. STRIPE WEBHOOK (MUST BE FIRST) ---
app.post(
  '/api/webhook', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

// --- 2. GLOBAL MIDDLEWARE ---
const allowedOrigins = [
  "http://localhost:5173",        // Dev: Vite dev server
  "http://localhost:3000",        // Alternative dev port
  "http://localhost",             // Docker: Frontend container via Nginx
  "http://frontend",              // Docker: Frontend container hostname
  process.env.FRONTEND_URL,       // Environment-configured URL
].filter(Boolean);

console.log("🔐 Allowed CORS origins:", allowedOrigins);

const corsOption = {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));
app.use(cookieParser()); 

// REMOVED: app.use('/uploads'...) -> Not needed with Cloudinary

// These parsers MUST come AFTER the webhook route
app.use(json({limit: "100mb"}));
app.use(urlencoded({limit: "100mb", extended: true}));

app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
    },
}));

app.use(passport.initialize());
app.use(passport.session());

// --- 3. STANDARD API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/ecomm", productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);

app.get("/", (req,res)=>{
    res.send("Server is Running");
})

const PORT = process.env.PORT || 5000;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Container');
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });