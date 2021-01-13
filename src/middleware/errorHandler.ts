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
    res.status(error.status).json({
        message: error.message
    });
};
