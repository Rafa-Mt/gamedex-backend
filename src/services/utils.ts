import { ErrorResponse } from "../types";

export class FormatError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        this.name = 'FormatError';
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export const getErrorMessage = (error: unknown): ErrorResponse => {
    if (error instanceof FormatError) return {error: JSON.parse(error.message)}
    if (error instanceof Error) return {error:error.message};
    return {error:String(error)};
}