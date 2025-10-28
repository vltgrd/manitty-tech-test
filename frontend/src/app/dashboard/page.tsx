'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export type Alert = {
  id: string
  subject: string
  timestamp: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  metadata: Record<string, any>
}

interface MonthData {
  month: string
  count: number
}

export default function Dashboard() {
  const [monthData, setMonthData] = useState<MonthData[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [monthAlerts, setMonthAlerts] = useState<Alert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch months data
        const monthsRes = await fetch('/api/alerts/numbers-by-months/12')
        if (!monthsRes.ok) throw new Error('Failed to fetch months data')
        const monthsData = await monthsRes.json()
        setMonthData(monthsData)

        // Fetch subjects
        const subjectsRes = await fetch('/api/alerts/subjects')
        if (!subjectsRes.ok) throw new Error('Failed to fetch subjects')
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch alerts for selected month
  useEffect(() => {
    if (!selectedMonth) return

    const fetchMonthAlerts = async () => {
      try {
        const params = new URLSearchParams()
        params.append('month', selectedMonth)
        if (selectedSubject) {
          params.append('subject', selectedSubject)
        }

        const res = await fetch(`/api/alerts?${params}`)
        console.log(
          'Alerts fetched for month:',
          selectedMonth,
          'subject:',
          selectedSubject,
          res
        )
        if (!res.ok) throw new Error('Failed to fetch alerts')
        const data: Alert[] = await res.json()
        setMonthAlerts(data)
        setSelectedAlert(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
      }
    }

    fetchMonthAlerts()
  }, [selectedMonth, selectedSubject])

  const handleBarClick = (data: MonthData) => {
    setSelectedMonth(data.month)
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          Erreur: {error}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8">Alerts Dashboard</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Alerts by Month</h2>

        {/* Filter by subject */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Subject:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les sujets</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Bar Chart */}
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                onClick={(data) => handleBarClick(data.payload as MonthData)}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedMonth && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alerts List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Alertes - {selectedMonth}
            </h2>

            {monthAlerts.length === 0 ? (
              <p className="text-gray-500">No alerts for this month</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {monthAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedAlert?.id === alert.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <p className="font-medium text-sm">{alert.subject}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(alert.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Detail */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Alert Detail</h2>

            {selectedAlert ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Subject:</p>
                  <p className="text-lg">{selectedAlert.subject}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Title:</p>
                  <p className="text-lg">{selectedAlert.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Message:</p>
                  <p className="text-base bg-gray-50 p-3 rounded">
                    {selectedAlert.message}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Severity:</p>
                  <p className="text-base">{selectedAlert.severity}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Date:</p>
                  <p className="text-base">
                    {new Date(selectedAlert.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">ID:</p>
                  <p className="text-xs font-mono text-gray-600">
                    {selectedAlert.id}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Select an alert to see its details
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
