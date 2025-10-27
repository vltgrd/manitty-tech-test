import Express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { alertRouter } from './models/alerts/alert.routes.js'
import { errorHandlerMiddleware } from './shared/middleware/error.middleware.js'

export const app: Application = Express()

app.use(Express.json()) // Parse JSON
app.use(cors()) // Enable CORS
app.use(helmet()) // Set security headers

app.use('/alerts', alertRouter) // Alert routes

// error handling middleware
app.use(errorHandlerMiddleware)
