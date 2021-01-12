/**
 * Custom Error interface for project
 *
 * An object of this type is meant to be returned for functions that have a possibility
 *   to make unexpected behaviors, but handle it without actually throwing an error
 * The `message` field is the primary indication for whether an error exists or not.
 * For example, if an instance of this type is returned but the message field is undefined, then
 *   it is assumed that no errors have occurred in that function
 */
export interface CustomError {
    message?: string;
    status?: number;
}

export class ApiError extends Error {
    public status: number;

    constructor(status?: number, message?: string) {
        super(message);
        this.status = status || 500;
    }
}
