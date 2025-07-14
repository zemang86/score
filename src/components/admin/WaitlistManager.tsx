import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { WaitlistService, WaitlistEntry } from '../../services/waitlistService'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { Mail, Clock, CheckCircle, XCircle, User, Calendar, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function WaitlistManager() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [notes, setNotes] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadWaitlistEntries()
  }, [])

  const loadWaitlistEntries = async () => {
    setLoading(true)
    const entries = await WaitlistService.getWaitlistEntries()
    setWaitlistEntries(entries)
    setLoading(false)
  }

  const handleApprove = async (entryId: string) => {
    if (!user) return
    
    setProcessingId(entryId)
    const result = await WaitlistService.approveWaitlistEntry(
      entryId, 
      user.id, 
      notes[entryId] || undefined
    )
    
    if (result.success) {
      await loadWaitlistEntries()
      setNotes(prev => ({ ...prev, [entryId]: '' }))
    }
    setProcessingId(null)
  }

  const handleReject = async (entryId: string) => {
    if (!user) return
    
    setProcessingId(entryId)
    const result = await WaitlistService.rejectWaitlistEntry(
      entryId, 
      user.id, 
      notes[entryId] || undefined
    )
    
    if (result.success) {
      await loadWaitlistEntries()
      setNotes(prev => ({ ...prev, [entryId]: '' }))
    }
    setProcessingId(null)
  }

  const filteredEntries = waitlistEntries.filter(entry => {
    if (filter === 'all') return true
    return entry.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-slate-600">Loading waitlist...</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Beta Waitlist Manager</h1>
          <p className="text-slate-600">Review and manage beta tester applications</p>
        </div>

        {/* Filter tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'all', label: 'All Applications' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`${
                  filter === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.label}
                <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.key === 'all' ? waitlistEntries.length : waitlistEntries.filter(e => e.status === tab.key).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Entries list */}
        <div className="divide-y divide-slate-200">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No applications found</p>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div key={entry.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{entry.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(entry.status)}
                          <span className="text-xs text-slate-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700 flex items-start">
                          <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-slate-400" />
                          {entry.notes}
                        </p>
                      </div>
                    )}

                    {entry.status === 'pending' && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Admin Notes (optional)
                          </label>
                          <textarea
                            value={notes[entry.id] || ''}
                            onChange={(e) => setNotes(prev => ({ ...prev, [entry.id]: e.target.value }))}
                            placeholder="Add notes about this application..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={2}
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleApprove(entry.id)}
                            loading={processingId === entry.id}
                            disabled={processingId !== null}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(entry.id)}
                            loading={processingId === entry.id}
                            disabled={processingId !== null}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}