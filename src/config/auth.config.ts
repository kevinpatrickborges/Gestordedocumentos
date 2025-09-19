// src/config/auth.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret:
      process.env.NODE_ENV === 'production'
        ? (process.env.JWT_SECRET as string)
        : process.env.JWT_SECRET || 'sgc-itep-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '50m',
    refreshSecret:
      process.env.NODE_ENV === 'production'
        ? (process.env.JWT_REFRESH_SECRET as string)
        : process.env.JWT_REFRESH_SECRET || 'sgc-itep-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  session: {
    secret:
      process.env.NODE_ENV === 'production'
        ? (process.env.SESSION_SECRET as string)
        : process.env.SESSION_SECRET ||
          'sgc-itep-session-secret-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },
  lockout: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
  },
}));
