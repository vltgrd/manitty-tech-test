export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code

    Error.captureStackTrace(this, this.constructor)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST')
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT')
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR')
  }
}