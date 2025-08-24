const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/../../../.env' });


exports.submitEnquiry = async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user:"adityaydv10@gmail.com",//process.env.EMAIL_USER,      // Gmail address
      pass: "eeok mloi aybc pbms"//process.env.EMAIL_PASS,      // Gmail App Password (NOT your real Gmail password)
    },
    tls: {
      rejectUnauthorized: false, // allows self-signed certs (use only in development)
    }
  });

  const mailOptions = {
    from: `"${name}">`,
    to:"adityaydv10@gmail.com",
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