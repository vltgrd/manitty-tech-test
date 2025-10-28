import { NextFunction, Request, Response } from 'express'
import { AppError, AuthenticationError } from '../utils/errors.js'
import { UnauthorizedError } from 'express-oauth2-jwt-bearer'

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message
    })
  } else if (err instanceof UnauthorizedError) {
    const authError = new AuthenticationError('Authentication failed')
    res.status(authError.statusCode).json({
      status: 'error',
      code: authError.code,
      message: authError.message
    })
  } else
    // Manage unexpected errors
    res.status(500).json({
      status: 'error',
      message:
        'An unexpected error occurred, please try again later or contact your system administrator'
    })

  next()
}
