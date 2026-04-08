import arcjet, { detectBot, slidingWindow } from "@arcjet/node";
import "dotenv/config";
export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], //Apply rules based on the user's IP address
  rules: [
    //Block automated clients and bots
    detectBot({
      mode: "LIVE",
      allow: [], //We are leaving this empty to block ALL bots on auth routes
    }),
    //Rate Limiting: Max 5 requests per hour per IP
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 5,
    }),
  ],
});
