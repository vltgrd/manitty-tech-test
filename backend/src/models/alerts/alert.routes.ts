import { Router } from 'express'
import { AlertService } from './alert.service.js'

const alertService = new AlertService()
export const alertRouter = Router()

alertRouter.get('/subjects', (req, res) => {
  const subjects = alertService.getAllSubjects()
  res.json(subjects)
})

alertRouter.get('/numbers-by-months/:months', (req, res) => {
  const months = parseInt(req.params.months, 10)
  const data = alertService.getNumberOfAlertsByLastMonths(months)
  res.json(data)
})
