import jwt from "jsonwebtoken";
import { isBlacklisted } from "../utils/blacklist.js";  // <- .js extension required

export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  if (isBlacklisted(token)) {
    return res.status(401).json({ message: "Token invalidated (logged out)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
