# Vercel Backend Deployment Guide

## Environment Variables Setup

Vercel mein ye environment variables add karo:

### Required Variables:
```env
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://admin:admin@cluster0.srksly4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT (CHANGE THIS!)
JWT_SECRET=your_actual_secret_key_here_minimum_32_characters

# Cloudinary (Your real values)
CLOUDINARY_CLOUD_NAME=dpsxv4fmn
CLOUDINARY_API_KEY=674392325678217
CLOUDINARY_API_SECRET=6KhvEX2F0eULk-1VKcGB3eysv6c

# Frontend URL (VERCEL DEPLOYMENT URL)
FRONTEND_URL=https://your-frontend.vercel.app
```

### Stripe (Add when needed):
```env
STRIPE_SECRET_KEY=sk_test_your_real_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_real_publishable_key
```

---

## Vercel Configuration

### 1. Project Settings:
- **Framework Preset:** Other
- **Build Command:** `npm run build` (if you have build step) or leave empty
- **Output Directory:** Leave empty for API routes
- **Install Command:** `npm install`

### 2. Functions (API Routes):
- Vercel mein `src/` folder ko `api/` folder ki tarah treat karega
- `src/server.js` ko `api/index.js` ki tarah use karega

---

## Troubleshooting Vercel Issues:

### ❌ "Server Error" ya "Internal Server Error"
**Solution:**
1. Environment variables check karo - sabhi required variables add hain?
2. JWT_SECRET change karo - placeholder mat rakho
3. MongoDB connection check karo

### ❌ MongoDB Connection Timeout
**Solution:**
1. Vercel IP whitelisting: MongoDB Atlas mein `0.0.0.0/0` add karo
2. Connection string sahi hai?

### ❌ CORS Error
**Solution:**
```javascript
// app.js mein CORS allow karo
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
};
```

---

## Test Your Vercel Deployment:

1. **Health Check:**
```bash
curl https://your-backend.vercel.app/api/health
```

2. **Environment Variables Check:**
```bash
curl https://your-backend.vercel.app/api/health
# Should return: {"status":"OK","environment":"production"}
```

3. **Database Check:**
```bash
curl https://your-backend.vercel.app/api/products
```

---

## Next Steps:

1. ✅ Environment variables update karo Vercel mein
2. ✅ JWT_SECRET real value se replace karo
3. ✅ FRONTEND_URL apne frontend ke Vercel URL se update karo
4. ✅ Deploy karo aur test karo

**Ab Vercel pe properly chalega! 🚀**
