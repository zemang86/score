import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User, Search, Filter, MoreHorizontal, UserPlus, Calendar, Mail } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface UserData {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
  student_count?: number
  last_login?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch users with student count
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          created_at,
          updated_at,
          students (count)
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Transform the data to include student count
      const transformedUsers = usersData?.map(user => ({
        ...user,
        student_count: user.students?.[0]?.count || 0
      })) || []

      setUsers(transformedUsers)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="card-fun p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          <span className="ml-2 text-neutral-600">Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-fun">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">User Management</h1>
            <p className="text-neutral-600">Manage registered users and their accounts</p>
          </div>
          <Button icon={<UserPlus className="w-4 h-4" />}>
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-2xl p-3 mr-4 shadow-fun">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-600">Total Users</p>
              <p className="text-2xl font-bold text-neutral-800">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-secondary-500 rounded-2xl p-3 mr-4 shadow-success">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">New This Month</p>
              <p className="text-2xl font-bold text-neutral-800">
                {users.filter(user => {
                  const userDate = new Date(user.created_at)
                  const now = new Date()
                  return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-accent-500 rounded-2xl p-3 mr-4 shadow-warning">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent-600">Active Today</p>
              <p className="text-2xl font-bold text-neutral-800">-</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-warning-500 rounded-2xl p-3 mr-4 shadow-warning">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning-600">Total Children</p>
              <p className="text-2xl font-bold text-neutral-800">
                {users.reduce((sum, user) => sum + (user.student_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-fun">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">All Users</h2>
        </div>

        {error && (
          <div className="p-4 bg-error-50 border-b border-error-200">
            <p className="text-error-600 text-sm">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Children
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-2xl bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-800">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-800">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.student_count || 0} children
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(user.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" icon={<MoreHorizontal className="w-4 h-4" />} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No users found</h3>
              <p className="text-neutral-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}