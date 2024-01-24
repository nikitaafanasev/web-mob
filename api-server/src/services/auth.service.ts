import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = 'mysecret';

class AuthService {
  authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    if (res.locals.userClaimSet) {
      next();
    } else {
      try {
        const token = req.headers.authorization?.split(' ')[1] || '';
        const userClaimSet = jwt.verify(token, SECRET) as Record<string, unknown>;
        res.locals.userClaimSet = userClaimSet;
        next();
      } catch {
        res.status(401).json({ message: 'Sign in, please!' });
      }
    }
  }

  extractUserClaimSet(req: Request) {
    const token = req.cookies['jwt-token'] || req.headers.authorization?.split(' ')[1] || '';
    return jwt.verify(token, SECRET) as Record<string, unknown>;
  }

  createBearerToken(userClaimSet: Record<string, unknown>, res: Response) {
    return 'Bearer ' + jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '1d' });
  }

  createAndSetToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '1d' });
    res.cookie('jwt-token', token, { sameSite: 'lax' });
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }

  verifyToken(token: string) {
    return jwt.verify(token, SECRET);
  }
}

export const authService = new AuthService();
authService.authenticationMiddleware = authService.authenticationMiddleware.bind(authService);
