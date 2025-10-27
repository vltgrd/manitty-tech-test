import { alerts } from '../../index.js'

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
   * Returns the number of alerts for each of the last specified number of months, including the current month.
   *
   * Iterates backwards from the current month, counting the number of alerts that occurred
   * in each month, and returns an array of objects containing the month (in `YYYY-MM` format)
   * and the corresponding alert count.
   *
   * @param months - The number of past months (including the current month) to include in the result.
   * @returns An array of objects, each containing:
   *   - `month`: The month in `YYYY-MM` format.
   *   - `count`: The number of alerts for that month.
   */
  public getNumberOfAlertsByLastMonths(
    months: number
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

      // Count alerts for the specific month and year
      const count = alerts.filter((alert) => {
        const alertDate = new Date(alert.timestamp)
        return (
          alertDate.getUTCFullYear() === adjustedYear &&
          alertDate.getUTCMonth() === month
        )
      }).length

      result.push({ month: monthString, count })
    }

    return result
  }
}
