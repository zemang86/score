import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User, Search, Filter, MoreHorizontal, UserPlus, Calendar, Mail, Edit, Crown, Zap, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { EditUserModal } from './EditUserModal'
import { ManageStudentsModal } from './ManageStudentsModal'

interface UserData {
  id: string
  email: string
  full_name: string
  subscription_plan: 'free' | 'premium'
  max_students: number
  daily_exam_limit: number
  created_at: string
  updated_at: string
  student_count?: number
  last_login?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>('')
  const [selectedUserMaxStudents, setSelectedUserMaxStudents] = useState<number>(1)
  const [selectedUserIsPremium, setSelectedUserIsPremium] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false)
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
          *,
          students (count)
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Transform the data to include student count
      const transformedUsers = usersData?.map(user => ({
        ...user,
        student_count: user.students?.[0]?.count || 0
      })) || []
      console.log('Fetched users:', transformedUsers)

      setUsers(transformedUsers)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId)
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUserName(user.full_name)
      setSelectedUserMaxStudents(user.max_students)
      setSelectedUserIsPremium(user.subscription_plan === 'premium')
    }
    setShowEditModal(true)
  }

  const handleManageStudents = (userId: string) => {
    setSelectedUserId(userId)
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUserName(user.full_name)
      setSelectedUserMaxStudents(user.max_students)
      setSelectedUserIsPremium(user.subscription_plan === 'premium')
    }
    setShowManageStudentsModal(true)
  }

  const handleUserUpdated = () => {
    // Refresh the users list
    fetchUsers()
    // Close the modal after a short delay to show success state
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

  const getPlanBadge = (plan: string) => {
    if (plan === 'premium') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Crown className="w-3 h-3 mr-1" />Premium</span>
    } else {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><User className="w-3 h-3 mr-1" />Free</span>
    }
  }

  if (loading) {
    return (
      <div className="card-fun p-6 sm:p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary-200 border-t-primary-600"></div>
          <span className="ml-2 text-neutral-600 text-sm sm:text-base">Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="card-fun p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800">User Management</h1>
            <p className="text-neutral-600 text-sm sm:text-base">Manage registered users and their accounts</p>
          </div>
          <Button icon={<UserPlus className="w-4 h-4" />} className="w-full sm:w-auto mt-3 sm:mt-0 text-sm sm:text-base">
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button variant="outline" icon={<Filter className="w-4 h-4" />} className="text-sm sm:text-base">
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="bg-primary-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3 lg:mr-4 shadow-fun">
              <User className="w-5 h-5 sm:w-6 lg:w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-primary-600">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="bg-secondary-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3 lg:mr-4 shadow-success">
              <UserPlus className="w-5 h-5 sm:w-6 lg:w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-secondary-600">New This Month</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">
                {users.filter(user => {
                  const userDate = new Date(user.created_at)
                  const now = new Date()
                  return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="bg-accent-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3 lg:mr-4 shadow-warning">
              <Calendar className="w-5 h-5 sm:w-6 lg:w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-accent-600">Active Today</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">-</p>
            </div>
          </div>
        </div>

        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="bg-warning-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3 lg:mr-4 shadow-warning">
              <Mail className="w-5 h-5 sm:w-6 lg:w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-warning-600">Total Children</p>
              <p className="text-xl sm:text-2xl font-bold text-neutral-800">
                {users.reduce((sum, user) => sum + (user.student_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-fun">
        <div className="p-4 sm:p-6 border-b border-neutral-200">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800">All Users</h2>
        </div>

        {error && (
          <div className="p-3 sm:p-4 bg-error-50 border-b border-error-200">
            <p className="text-error-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}


      {/* Edit User Modal */}
      {selectedUserId && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userId={selectedUserId}
          onUserUpdated={handleUserUpdated}
        />
      )}
      
      {/* Manage Students Modal */}
      {selectedUserId && (
        <ManageStudentsModal
          isOpen={showManageStudentsModal}
          onClose={() => setShowManageStudentsModal(false)}
          userId={selectedUserId}
          userName={selectedUserName}
          maxStudents={selectedUserMaxStudents}
          isPremium={selectedUserIsPremium}
          onStudentsUpdated={handleUserUpdated}
        />
      )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Children
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-primary-100 flex items-center justify-center">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-neutral-800">
                          {user.full_name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="mt-1">
                      {getPlanBadge(user.subscription_plan)}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {user.subscription_plan === 'free' ? '1 kid max' : 'Unlimited kids'} • {user.daily_exam_limit === 999 ? '∞' : user.daily_exam_limit} exams/day
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-neutral-800">{user.email}</div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.student_count || 0} children
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-neutral-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-neutral-500">
                    {formatDate(user.updated_at)}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex space-x-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Edit className="w-3 h-3 sm:w-4 sm:h-4" />} 
                        onClick={() => handleEditUser(user.id)}
                        title="Edit user access"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Users className="w-3 h-3 sm:w-4 sm:h-4" />} 
                        onClick={() => handleManageStudents(user.id)}
                        title="Manage students"
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-primary-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-neutral-800 mb-1 sm:mb-2">No users found</h3>
              <p className="text-neutral-600 text-sm sm:text-base">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}