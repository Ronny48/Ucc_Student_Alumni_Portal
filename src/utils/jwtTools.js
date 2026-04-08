import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (userId) => {
  //Creates a token containing the user's ID, valid for 7 days
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
