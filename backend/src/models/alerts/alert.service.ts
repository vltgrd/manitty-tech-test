import { alerts } from '../../index.js'
import { Alert, FilterAlerts } from './alert.model.js'

export class AlertService {
  /**
   * Retrieves a list of unique alert subjects.
   *
   * Iterates through all alerts, extracts their `subject` property,
   * and returns an array containing only unique subject values.
   *
   * @returns {string[]} An array of unique alert subjects.
   */
  public getAllSubjects(): string[] {
    const subjects = alerts.map((alert) => alert.subject)
    return Array.from(new Set(subjects))
  }

  /**
   * Retrieves a single alert by its unique identifier.
   *
   * Searches through all alerts and returns the alert object that matches the provided `id`.
   * If no alert with the specified `id` is found, returns `undefined`.
   *
   * @param id - The unique identifier of the alert.
   * @returns {Alert | undefined} The alert with the given id, or undefined if not found.
   */
  public getAlertById(id: string): Alert | undefined {
    return alerts.find((alert) => alert.id === id)
  }
  /**
   * Returns the number of alerts for each of the last specified number of months, including the current month.
   *
   * Optionally filters alerts by subject
   *
   * @param months - The number of past months (including the current month) to include in the result.
   * @param subjects - Optional array of subjects to filter alerts.
   * @returns An array of objects, each containing:
   *   - `month`: The month in `YYYY-MM` format.
   *   - `count`: The number of alerts for that month.
   */
  public getNumberOfAlertsByLastMonths(
    months: number,
    subjects?: string[]
  ): { month: string; count: number }[] {
    const result: { month: string; count: number }[] = []
    const now = new Date()

    for (let i = 0; i < months; i++) {
      const year = now.getUTCFullYear()
      let month = now.getUTCMonth() - i
      let adjustedYear = year

      // Adjust year and month if month is negative
      if (month < 0) {
        adjustedYear += Math.floor(month / 12)
        month = ((month % 12) + 12) % 12
      }

      // Format YYYY-MM
      const monthString = `${adjustedYear}-${String(month + 1).padStart(2, '0')}`

      // Count alerts for the specific month and year, with optional subject filter
      const count = alerts.filter((alert) => {
        const alertDate = new Date(alert.timestamp)
        const matchesMonth =
          alertDate.getUTCFullYear() === adjustedYear &&
          alertDate.getUTCMonth() === month
        const matchesSubject =
          !subjects || subjects.length === 0 || subjects.includes(alert.subject)
        return matchesMonth && matchesSubject
      }).length

      result.push({ month: monthString, count })
    }

    return result
  }

  /**
   * Retrieves alerts filtered by month, severity, and subject.
   *
   * - If `filter.month` is not provided, defaults to the current month.
   * - If `filter.severity` is provided, only alerts with matching severity are returned.
   * - If `filter.subject` is provided, only alerts with matching subject are returned.
   *
   * @param filter - The filter criteria for alerts.
   * @returns {Alert[]} An array of alerts matching the filter.
   */
  public getAlerts(filter: FilterAlerts): Alert[] {
    let month: string
    if (!filter.month) {
      const now = new Date()
      month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
        2,
        '0'
      )}`
    } else {
      month = filter.month
    }

    return alerts.filter((alert) => {
      const alertDate = new Date(alert.timestamp)
      const alertMonth = `${alertDate.getUTCFullYear()}-${String(
        alertDate.getUTCMonth() + 1
      ).padStart(2, '0')}`

      const matchesMonth = alertMonth === month
      const matchesSeverity =
        !filter.severity || alert.severity === filter.severity
      const matchesSubject = !filter.subject || alert.subject === filter.subject

      return matchesMonth && matchesSeverity && matchesSubject
    })
  }
}
