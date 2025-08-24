 
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Database connection function
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes'); // Post routes
const rentalRoutes = require('./rentalbackend/routes/rentalRoutes'); // Rental routes
const machineryRoutes = require('./rentalbackend/routes/machineryRoutes'); // Machinery routes
const User = require('./models/User'); // User model

const hire = require('./rentalbackend/routes/HireRoutes'); // Ensure the HireRoutes is correctly imported

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// core for render 

app.use(cors({
  // origin:  '*', // Your deployed React frontend
  origin: ['https://kisaanhaat-backend.onrender.com'],
  credentials: true
}));
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] - ${req.method} ${req.url}`);
    next();
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/hire', hire);

// ✅ OTP Handling (Merged from `server.js`)
app.post('/api/auth/send-otp', async (req, res) => {
    console.log("Received request at /api/auth/send-otp");

    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

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

// ✅ OTP Verification
app.post("/api/auth/verify-otp", async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const user = await User.findOne({ phone });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Clear OTP after verification
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully", success: true });

    } catch (error) {
        res.status(500).json({ message: "OTP verification failed", error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
