import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { 
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
    PrismaClientInitializationError,
    PrismaClientRustPanicError,
    PrismaClientValidationError
 } from "@prisma/client/runtime/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import config from "../config";

export const globalErrorHandle: ErrorRequestHandler = (
    err,
    req,
    res,
    next
) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let errorDetails: unknown = null;

    // 1. Zod Validation Error
    if (err instanceof ZodError) {
        statusCode = 400;
        message: "Validation Error";

        errorDetails = err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    }

    // 2. Custom Application Error
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errorDetails = err.errorDetails ?? null;
    }

    // 3. Prisma Known Request Error
    else if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                statusCode = 409;
                message = "Duplicate value";
                errorDetails = {
                    code: err.code,
                    target:err.meta?.target,
                };
                break;

            case "P2025":
                statusCode = 404;
                message = "Record not found in database";
                errorDetails = {
                    code: err.code,
                };
                break;
            
            case "P2003":
                statusCode = 400;
                message = "Foreign key constraint failed";
                errorDetails = {
                    code: err.code,
                };
                break;

            case "P2014":
                statusCode = 400;
                message = "Invalid relation between records";
                errorDetails = {
                    code: err.code,
                };
                break;

            default:
                statusCode = 400;
                message = "Database Error";
                errorDetails = {
                    code: err.code,
                };
        }
    }

    // 4. Prisma Validation Error
    else if ( err instanceof PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid databse querry";
    }

    // 5. Prisma Unknown Request Error
    else if (err instanceof PrismaClientUnknownRequestError) {
        statusCode = 500;
        message = "Unknown database error";
    }

    // 6. Prisma Initialization Error
    else if (err instanceof PrismaClientInitializationError) {
        statusCode = 503;
        message = "Database connection failed";
    }

    // 7. Prisma Rust Panic Error
    else if (err instanceof PrismaClientRustPanicError) {
        statusCode = 500;
        message = "Database service crashed";
    }

    // 8. JWT Token Expired Error
    else if (err instanceof TokenExpiredError) {
        statusCode = 401;
        message = "Token has expired";
    }

    // 9. Invalid JWT Error
    else if (err instanceof JsonWebTokenError) {
        statusCode = 401;
        message = "Invalid authentication token";
    }

    // Production error response
    if (statusCode === 500 && config.NODE_ENV === "production") {
        errorDetails = null;
    }

    // Development error response 
    else if (
        config.NODE_ENV !== "production" &&
        err instanceof Error &&
        errorDetails === null
    ) {
        errorDetails = {
            stack: err.stack,
        };
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorDetails,
    });

};