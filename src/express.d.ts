declare global {
    namespace Express {
        interface Request {
            user?: {
                role?: RateLimitRole;
            };
        }
    }
}

export {};