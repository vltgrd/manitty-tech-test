import Express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'

export const app: Application = Express()

app.use(Express.json()) // Parse JSON
app.use(cors()) // Enable CORS
app.use(helmet()) // Set security headers
