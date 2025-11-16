import { generateStreamToken } from "../lib/stream.js";
export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user._id.toString());
    res.status(200).json({ token });
  } catch (err) {
    console.error("Error generating Stream token:", err);
    res.status(500).json({ message: "Server error" });
  }
}