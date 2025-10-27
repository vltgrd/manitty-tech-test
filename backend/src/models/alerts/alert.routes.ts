import { Router } from 'express'
import { AlertService } from './alert.service.js'
import { filterAlertsSchema } from './alert.model.js'
import { ValidationError } from '../../shared/utils/errors.js'

const alertService = new AlertService()
export const alertRouter = Router()

// GET / - Retrieve alerts, optionally filtered by query parameters
alertRouter.get('/', (req, res, next) => {
  const parseResult = filterAlertsSchema.safeParse(req.query)
  if (!parseResult.success) {
    return next(new ValidationError('Invalid query parameters'))
  }
  const filters = parseResult.data
  const alerts = alertService.getAlerts(filters)
  res.json(alerts)
})

// GET /subjects - Retrieve all available alert subjects
alertRouter.get('/subjects', (req, res) => {
  const subjects = alertService.getAllSubjects()
  res.json(subjects)
})

// GET /numbers-by-months/:months - Retrieve the number of alerts for the last N months
alertRouter.get('/numbers-by-months/:months', (req, res) => {
  const months = parseInt(req.params.months, 10)
  const data = alertService.getNumberOfAlertsByLastMonths(months)
  res.json(data)
})
