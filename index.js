 
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Database connection function
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes'); // Post routes
const rentalRoutes = require('./rentalbackend/routes/rentalRoutes'); // Rental routes
const machineryRoutes = require('./rentalbackend/routes/machineryRoutes'); // Machinery routes
const User = require('./models/User'); // User model
const hire = require('./rentalbackend/routes/HireRoutes'); // Hire routes
 

// paymentSystem 

const { createPayment, getPaymentStatus, phonePeCallback }=require("./controllers/paymentController");

// razorpay 

const {createOrder ,verifyPayment} =require("./controllers/RozorController")

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();


// payemt 

app.use(express.json({ limit: "2mb" }));

// ✅ CORS setup
const allowedOrigins = [
  "https://kisanhaat.vercel.app", // deployed frontend
  "http://localhost:5173",         // local dev
  "http://localhost:5174"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or server-to-server
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS policy: Access denied"), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

// Handle preflight requests for all routes
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] - ${req.method} ${req.url}`);
  next();
});

// ✅ Routes
app.use("/api/users", authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/hire', hire);
app.use('/api' ,require('./rentalbackend/routes/contactRoutes'));
app.use('/api/hires' ,require('./rentalbackend/routes/getHiredRoutes'));
app.use('/api/deletehire',require('./rentalbackend/routes/getHiredRoutes')); 


// payment related routes 

app.get("/", (_req, res) => res.send("KisanHaat Payments API OK"));

// Payment routes
app.post("/api/pay/create", createPayment);
app.get("/api/pay/status", getPaymentStatus);
app.post("/api/pay/callback", phonePeCallback);


// Razorpay routes
app.post("/api/pay/razorpay/create", createOrder);
app.post("/api/pay/razorpay/verify", verifyPayment);



// Bids Routes 
// app.use('/api/crops',require('./routes/cropRoutes'));
// app.use('/api/crops/bids', require('./routes/cropRoutes'));
app.use('/api/crops/bids', require('./routes/cropRoutes'));


// ✅ OTP Handling
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }
    await user.save();
    console.log(`OTP for ${phone}: ${otp}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    res.status(200).json({ message: "OTP verified successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
