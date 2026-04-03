import { aj } from "../config/arcjet.js";

export const requireHuman = async (req, res, next) => {
  try {
    // Arcjet analyzes the incoming request
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res
          .status(429)
          .json({
            error: "Too many OTP requests. Please try again in an hour.",
          });
      }
      if (decision.reason.isBot()) {
        return res
          .status(403)
          .json({ error: "Automated bot activity detected and blocked." });
      }
      return res
        .status(403)
        .json({ error: "Access denied by security policies." });
    }

    // If Arcjet says it's safe, continue to the next step
    next();
  } catch (error) {
    console.error("Arcjet Security Error:", error);
    // Fail closed: if security check fails, don't let them through
    return res.status(500).json({ error: "Security validation failed." });
  }
};
