import { Redis } from "ioredis";
import "dotenv/config";

// Connect using your new Cloud URL
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => console.log("Cloud Redis Connected!"));
redis.on("error", (err) => console.error("Redis Error:", err));

// Generates a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//Saves the OTP to Redis with a 10-minute expiration
export const saveOTP = async (email, otp) => {
  // 'EX', 600 means expire in 600 seconds (10 minutes)
  await redis.set(`otp:${email}`, otp, "EX", 600);
};

//Verifies if the provided OTP matches the one in Redis
export const verifyOTP = async (email, userOtp) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    return { valid: false, message: "OTP has expired or does not exist." };
  }

  if (storedOtp !== userOtp) {
    return { valid: false, message: "Invalid OTP." };
  }

  //If valid, delete the OTP so it can't be used again
  await redis.del(`otp:${email}`);
  return { valid: true, message: "OTP verified successfully." };
};
