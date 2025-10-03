const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

 
exports.submitEnquiry = async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.USER ,  
      pass: process.env.PASS 
    },
    tls: {
      rejectUnauthorized: false, // allows self-signed certs (use only in development)
    }
  });

  const mailOptions = {
    from: `"${name}">`,
    to:process.env.USER,
    subject: `New Query from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Query sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send query' });
  }
}