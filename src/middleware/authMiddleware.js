import jwt from "jsonwebtoken";

export const protectRoute = (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the header (Format: "Bearer eyJhbGci...")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using the secret in your .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user payload (which contains the user ID) to the request object
      req.user = decoded;

      // Move on to the actual route controller
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res
        .status(401)
        .json({ error: "Not authorized, token failed or expired." });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ error: "Not authorized, no token provided." });
  }
};
