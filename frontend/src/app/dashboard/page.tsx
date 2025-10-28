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

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
}

export default function Dashboard() {
  const [monthData, setMonthData] = useState<MonthData[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [monthAlerts, setMonthAlerts] = useState<Alert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [isAlertsLoading, setIsAlertsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/alerts/subjects')
        if (!response.ok) throw new Error('Failed to fetch subjects')
        const data = await response.json()
        setSubjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchSubjects()
  }, [])

  // Fetch month data when subject changes
  useEffect(() => {
    const fetchMonthData = async () => {
      try {
        setIsChartLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (selectedSubject) {
          params.append('subject', selectedSubject)
        }

        const response = await fetch(
          `/api/alerts/numbers-by-months/12?${params}`
        )
        if (!response.ok) throw new Error('Failed to fetch month data')
        const data = await response.json()
        setMonthData(data)
        
        // Reset selected month and alerts when subject changes
        setSelectedMonth(null)
        setMonthAlerts([])
        setSelectedAlert(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsChartLoading(false)
      }
    }

    fetchMonthData()
  }, [selectedSubject])

  // Fetch alerts for selected month
  useEffect(() => {
    if (!selectedMonth) return

    const fetchMonthAlerts = async () => {
      try {
        setIsAlertsLoading(true)
        const params = new URLSearchParams()
        params.append('month', selectedMonth)
        
        // Include subject filter if selected
        if (selectedSubject) {
          params.append('subject', selectedSubject)
        }

        const response = await fetch(`/api/alerts?${params}`)
        if (!response.ok) throw new Error('Failed to fetch alerts')
        const data: Alert[] = await response.json()
        setMonthAlerts(data)
        setSelectedAlert(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
      } finally {
        setIsAlertsLoading(false)
      }
    }

    fetchMonthAlerts()
  }, [selectedMonth, selectedSubject])

  // Complete initial load
  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleBarClick = (data: MonthData) => {
    setSelectedMonth(data.month)
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          Error: {error}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8">Alerts Dashboard</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Alerts by Month</h2>
          {isChartLoading && (
            <span className="text-sm text-gray-500">Updating...</span>
          )}
        </div>

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
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Bar Chart */}
        {monthData.length > 0 ? (
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
                  onClick={(data) =>
                    handleBarClick(data.payload as MonthData)
                  }
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">No alerts found for this subject</p>
          </div>
        )}
      </div>

      {selectedMonth && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alerts List */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Alerts - {selectedMonth}
              </h2>
              {isAlertsLoading && (
                <span className="text-sm text-gray-500">Loading...</span>
              )}
            </div>

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
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[alert.severity]}`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{alert.subject}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(alert.timestamp).toLocaleString('en-US')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Detail */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Alert Details</h2>

            {selectedAlert ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Title:</p>
                  <p className="text-lg font-semibold">{selectedAlert.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Subject:</p>
                  <p className="text-base">{selectedAlert.subject}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Severity:
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${severityColors[selectedAlert.severity]}`}
                  >
                    {selectedAlert.severity}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Message:</p>
                  <p className="text-base bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {selectedAlert.message}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Date:</p>
                  <p className="text-base">
                    {new Date(selectedAlert.timestamp).toLocaleString('en-US')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">ID:</p>
                  <p className="text-xs font-mono text-gray-600">
                    {selectedAlert.id}
                  </p>
                </div>

                {Object.keys(selectedAlert.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Metadata:
                    </p>
                    <div className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-32">
                      <pre>{JSON.stringify(selectedAlert.metadata, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                Select an alert to view its details
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}