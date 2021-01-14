import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ApiError } from '@/common/error';

// reference: handling errors in express
// https://expressjs.com/en/guide/error-handling.html
export const errorHandler: ErrorRequestHandler = (
    error: ApiError,
    _request: Request,
    res: Response,
    _next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';

    res.status(status).json({ message });
};
