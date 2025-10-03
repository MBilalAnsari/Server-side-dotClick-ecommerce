import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import router from "./routes/index.js";
// import authRoutes from "./routes/authRoutes.js";
// import productRoutes from "./routes/productRoutes.js";
// import cartRoutes from "./routes/cartRoutes.js";
// import checkoutRoutes from "./routes/checkoutRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for FormData support
// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from your frontend domain and localhost for development
    const allowedOrigins = [
      'https://forntend-ecommerce-dot-click.vercel.app', // Your frontend domain
      'http://localhost:3000', // Vite dev server
      'http://localhost:5173', // Alternative dev port
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan("dev"));


app.use("/" , router);

app.get("/", (req, res) => {
  res.send("!...Ecommerce API is running");
});

export default app;
