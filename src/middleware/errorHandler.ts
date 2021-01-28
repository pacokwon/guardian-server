import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { ApiError, summaryStatuscodeMap, Summary } from '../common/error';

// reference: handling errors in express
// https://expressjs.com/en/guide/error-handling.html
export const errorHandler: ErrorRequestHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof ValidateError) {
        if (
            process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'production'
        )
            console.warn(
                `Caught Validation Error for ${req.path}:`,
                error.fields
            );

        return res.status(400).json({
            message: error.message || 'Validation Failed!',
            details: error?.fields
        });
    }

    if (error instanceof ApiError) {
        const status =
            summaryStatuscodeMap[error?.summary || Summary.InternalServerError];
        const message = error?.message || 'Internal Server Error';
        return res.status(status).json({ message });
    }

    next();
};
