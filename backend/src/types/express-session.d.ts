import 'express-session';

declare global {
    namespace Express {
        interface Session {
            userId?: string;
        }
    }
}