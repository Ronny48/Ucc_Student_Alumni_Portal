import arcjet, { detectBot, slidingWindow } from "@arcjet/node";
import "dotenv/config"; // Load environment variables from .env file
export const aj = arcjet({
  key: process.env.ARCJET_KEY, // Make sure this is in your .env
  characteristics: ["ip.src"], // Apply rules based on the user's IP address
  rules: [
    // 1. Block automated clients and bots
    detectBot({
      mode: "LIVE",
      allow: [], // We are leaving this empty to block ALL bots on auth routes
    }),
    // 2. Rate Limiting: Max 5 requests per hour per IP
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 5,
    }),
  ],
});
