import nodemailer from "nodemailer";

// Configure the email transport using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail", // Standard Gmail configuration
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an App Password if using Gmail
  },
});

export const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"UCC Alumni Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Registration OTP",
    text: `Welcome! Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>UCC Alumni Portal</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` OTP email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP email");
  }
};
