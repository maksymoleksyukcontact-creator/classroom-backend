import type { NextFunction } from "express";

export const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (process.env.NODE_ENV === "test") {
            return next();
        }

        const role: RateLimitRole = req.user?.role ?? "guest";

        let limit: number;
        let message: string;

        switch (role) {
            case "admin":
                limit = 20;
                message = "Admin request limit exceeded...";
                break;
            case "teacher":
            case "student":
                limit = 10;
                message = "User request limit exceeded...";
                break;
            default:
                limit = 5;
                message = "Guest request limit exceeded...";
                break;
        }

        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: {
                remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0",
            },
        };

        const decision = await client.protect(arcjetRequest, { requested: limit });

        if (decision.isDenied()) {

            if (decision.reason.isShield()) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: "Suspicious activity detected.",
                });
            }


            if (decision.reason.isRateLimit()) {
                return res.status(429).json({
                    error: "Too Many Requests",
                    message: message,
                });
            }

            if (decision.reason.isBot()) {
                return res.status(403).json({
                    error: "Forbidden",
                    message: "Automated requests are not allowed.",
                });
            }

            return res.status(403).json({
                error: "Forbidden",
                message: "Access denied.",
            });
        }

        return next();
    } catch (error) {
        console.error("Security Middleware Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}