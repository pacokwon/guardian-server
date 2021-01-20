export enum Summary {
    BadRequest = 'Bad Request',
    NotFound = 'Not Found',
    InternalServerError = 'Internal Server Error'
}

const summaryStatuscodeMap: Record<Summary, number> = {
    [Summary.BadRequest]: 400,
    [Summary.NotFound]: 404,
    [Summary.InternalServerError]: 500
};

/**
 * Error Response
 * If this response is sent back, an error has occurred.
 */
export interface ErrorResponse {
    /**
     * Error message containing details of the error.
     */
    message: string;
}

export class ApiError extends Error {
    public status: number;

    constructor(summary: Summary, message?: string) {
        super(message);
        this.status = summaryStatuscodeMap[summary] || 500;
    }
}
