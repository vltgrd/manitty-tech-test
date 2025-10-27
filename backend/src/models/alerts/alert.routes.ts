import { Router } from 'express'
import { AlertService } from './alert.service.js'

const alertService = new AlertService()
export const alertRouter = Router()

alertRouter.get('/subjects', (req, res) => {
    const subjects = alertService.getAllSubjects()
    res.json(subjects)
})