import { createRemoteJWKSet, jwtVerify } from "jose-cjs";

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token is missing",
      });
    }

    const { payload } = await jwtVerify(token, JWKS);

    console.log("Token payload:", payload);

    req.user = payload;

    next();
  } catch (error) {
    console.error("Token validation failed:", error);

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};