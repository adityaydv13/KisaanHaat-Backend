const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' }); 
const connectDB = async () => {
  try {
    // mongodb+srv://adityaydv:workease@cluster.jpzwk.mongodb.net/kisaanhaat?retryWrites=true&w=majority
       await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);  
  }
};

module.exports = connectDB;
