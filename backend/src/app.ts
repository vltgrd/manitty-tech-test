import dotenv from 'dotenv'
dotenv.config()
import Express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { alertRouter } from './models/alerts/alert.routes.js'
import { errorHandlerMiddleware } from './shared/middleware/error.middleware.js'
import { auth } from 'express-oauth2-jwt-bearer'

export const app: Application = Express()

app.use(Express.json()) // Parse JSON
app.use(cors()) // Enable CORS
app.use(helmet()) // Set security headers

app.use(auth()); // Authentication middleware

app.use('/alerts', alertRouter) // Alert routes

// error handling middleware
app.use(errorHandlerMiddleware)
