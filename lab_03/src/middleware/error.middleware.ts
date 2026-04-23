import { Request, Response, NextFunction } from 'express';
import {ZodError} from "zod";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction ) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Помилка валідації даних',
            errors: err.issues
        });
    }
    console.log('Unhandled error');
    return res.status(500).json({
        status: 'error',
        message: 'Внутрішня помилка сервера'
    })
}