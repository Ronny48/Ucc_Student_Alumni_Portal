const ALLOWED_DOMAINS = ["stu.ucc.edu.gh", "ucc.edu.gh"];

export const validateUCCEmail = (req, res, next) => {
  const { emall } = req.body;

  if (!emall) {
    return res.status(400).json({ error: "Email (emall) is required" });
  }

  // Extract the domain part after the '@'
  const domain = emall.split("@")[1];

  if (!ALLOWED_DOMAINS.includes(domain)) {
    return res.status(403).json({
      error: "Access Denied. Please use your official UCC institutional email.",
    });
  }

  next();
};
