'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Alert {
  id: string
  subject: string
  title: string
  message: string
  timestamp: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  metadata: Record<string, any>
}

interface GroupedAlerts {
  month: string
  alerts: Alert[]
  loading: boolean
  hasMore: boolean
  page: number
}

const ITEMS_PER_MONTH = 50

const severityColors: Record<
  string,
  { bg: string; text: string; badge: string }
> = {
  LOW: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800'
  },
  MEDIUM: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  HIGH: {
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800'
  },
  CRITICAL: {
    bg: 'bg-red-50',
    text: 'text-red-900',
    badge: 'bg-red-100 text-red-800'
  }
}

export default function AlertsPage() {
  const [groupedAlerts, setGroupedAlerts] = useState<
    Map<string, GroupedAlerts>
  >(new Map())
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [totalAlerts, setTotalAlerts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [allMonths, setAllMonths] = useState<string[]>([])
  const observerTarget = useRef<HTMLDivElement>(null)

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/alerts/subjects')
        if (!res.ok) throw new Error('Failed to fetch subjects')
        const data = await res.json()
        setSubjects(data)
      } catch (err) {
        console.error('Error fetching subjects:', err)
      }
    }

    fetchSubjects()
  }, [])

  // Initialize all months on mount
  useEffect(() => {
    const fetchMonths = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (selectedSubject) {
          params.append('subject', selectedSubject)
        }

        // Fetch 24 months data to get all available months
        const res = await fetch(`/api/alerts/numbers-by-months/24?${params}`)
        if (!res.ok) throw new Error('Failed to fetch months')
        const monthsData = await res.json()

        // Extract month keys and sort them newest first
        const months = monthsData.map((m: any) => m.month)
        setAllMonths(months)
        setTotalAlerts(
          monthsData.reduce((sum: number, m: any) => sum + m.count, 0)
        )

        // Initialize map with empty groups
        const newGroups = new Map<string, GroupedAlerts>()
        months.forEach((month: string) => {
          newGroups.set(month, {
            month,
            alerts: [],
            loading: false,
            hasMore: true,
            page: 0
          })
        })
        setGroupedAlerts(newGroups)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch months')
      } finally {
        setLoading(false)
      }
    }

    fetchMonths()
  }, [selectedSubject])

  // Fetch alerts for a specific month
  const fetchAlertsForMonth = useCallback(
    async (month: string, page: number = 0) => {
      const groupData = groupedAlerts.get(month)
      if (!groupData) return

      try {
        const newGroups = new Map(groupedAlerts)
        const updatingGroup = newGroups.get(month)!
        updatingGroup.loading = true
        setGroupedAlerts(newGroups)

        const params = new URLSearchParams()
        params.append('month', month)
        if (selectedSubject) {
          params.append('subject', selectedSubject)
        }
        params.append('limit', ITEMS_PER_MONTH.toString())
        params.append('offset', (page * ITEMS_PER_MONTH).toString())

        const res = await fetch(`/api/alerts?${params}`)
        if (!res.ok) throw new Error('Failed to fetch alerts')
        const data: Alert[] = await res.json()

        const updatedGroups = new Map(groupedAlerts)
        const group = updatedGroups.get(month)!
        group.alerts = page === 0 ? data : [...group.alerts, ...data]
        group.loading = false
        group.hasMore = data.length === ITEMS_PER_MONTH
        group.page = page
        updatedGroups.set(month, group)
        setGroupedAlerts(updatedGroups)
      } catch (err) {
        console.error(`Failed to fetch alerts for ${month}:`, err)
        const newGroups = new Map(groupedAlerts)
        const group = newGroups.get(month)!
        group.loading = false
        newGroups.set(month, group)
        setGroupedAlerts(newGroups)
      }
    },
    [groupedAlerts, selectedSubject]
  )

  // Load more alerts for expanded month
  const loadMoreForMonth = (month: string) => {
    const group = groupedAlerts.get(month)
    if (group && group.hasMore && !group.loading) {
      fetchAlertsForMonth(month, group.page + 1)
    }
  }

  // Auto-expand first month and load its alerts
  useEffect(() => {
    if (allMonths.length > 0 && expandedMonths.size === 0) {
      const firstMonth = allMonths[0]
      const newExpanded = new Set([firstMonth])
      setExpandedMonths(newExpanded)
      fetchAlertsForMonth(firstMonth, 0)
    }
  }, [allMonths, expandedMonths, fetchAlertsForMonth])

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
      // Fetch alerts when expanding if not already loaded
      const group = groupedAlerts.get(month)
      if (group && group.alerts.length === 0) {
        fetchAlertsForMonth(month, 0)
      }
    }
    setExpandedMonths(newExpanded)
  }

  if (loading) {
    return <div className="p-8">Loading months...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setExpandedMonths(new Set())
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Total: <span className="font-semibold">{totalAlerts}</span> alerts |
          <span className="ml-2">{allMonths.length} months</span>
        </p>
      </div>

      {/* Alerts List grouped by Month */}
      <div className="space-y-4">
        {allMonths.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No alerts found
          </div>
        ) : (
          allMonths.map((month) => {
            const group = groupedAlerts.get(month)
            if (!group) return null

            const isExpanded = expandedMonths.has(month)

            return (
              <div
                key={month}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-blue-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                    <h2 className="text-lg font-semibold text-gray-800 capitalize">
                      {month}
                    </h2>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {group.alerts.length}
                    {group.hasMore ? '+' : ''}
                  </span>
                </button>

                {/* Alerts List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 divide-y divide-gray-200">
                    {group.alerts.length > 0 ? (
                      <>
                        {group.alerts.map((alert) => {
                          const colors = severityColors[alert.severity]
                          return (
                            <div
                              key={alert.id}
                              onClick={() => setSelectedAlert(alert)}
                              className={`px-6 py-4 cursor-pointer transition-colors ${
                                selectedAlert?.id === alert.id
                                  ? `${colors.bg} border-l-4 border-current`
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-gray-900">
                                      {alert.title}
                                    </p>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${colors.badge}`}
                                    >
                                      {alert.severity}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {alert.subject}
                                  </p>
                                  <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                                    {alert.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(alert.timestamp).toLocaleString(
                                      'en-US'
                                    )}
                                  </p>
                                </div>
                                <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">
                                  {alert.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Load More Button */}
                        {group.hasMore && (
                          <div className="px-6 py-4 text-center border-t border-gray-200">
                            <button
                              onClick={() => loadMoreForMonth(month)}
                              disabled={group.loading}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                              {group.loading ? 'Loading...' : 'Load more'}
                            </button>
                          </div>
                        )}
                      </>
                    ) : group.loading ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        Loading alerts...
                      </div>
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No alerts in this month
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div ref={observerTarget} className="mt-8" />

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{selectedAlert.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${severityColors[selectedAlert.severity].badge}`}
                >
                  {selectedAlert.severity}
                </span>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Subject:</p>
                <p className="text-base mt-1">{selectedAlert.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">Message:</p>
                <p className="text-base mt-1 bg-gray-50 p-4 rounded whitespace-pre-wrap">
                  {selectedAlert.message}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">Date:</p>
                <p className="text-base mt-1">
                  {new Date(selectedAlert.timestamp).toLocaleString('en-US')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">ID:</p>
                <p className="text-xs font-mono text-gray-600 mt-1">
                  {selectedAlert.id}
                </p>
              </div>

              {Object.keys(selectedAlert.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Metadata:</p>
                  <div className="text-base mt-1 bg-gray-50 p-4 rounded">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
