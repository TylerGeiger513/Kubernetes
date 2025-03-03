import session from 'express-session';

export interface CustomSession extends session.Session {
  userId?: string;
}
