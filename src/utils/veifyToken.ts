import jwt, { JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';

export const verifyToken = (token: string,key:any): JwtPayload => {
    try {
        return jwt.verify(token, key) as JwtPayload;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw createHttpError(400, 'Token is expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw createHttpError(400, 'Invalid token');
        } else {
            throw createHttpError(400, 'Token verification failed');
        }
    }
};
