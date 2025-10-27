import { alerts } from '../../index.js'

export class AlertService {
    public getAllSubjects(): string[] {
        const subjects = alerts.map((alert) => alert.subject)
        return Array.from(new Set(subjects))
    }
}