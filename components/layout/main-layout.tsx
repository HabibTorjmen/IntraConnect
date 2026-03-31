'use client'

import { useContext, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import { AppContext } from '@/context/app-context'
import Header from './header'
import Sidebar from './sidebar'
import Dashboard from '@/components/modules/dashboard'
import EmployeeList from '@/components/modules/employee-list'
import EmployeeForm from '@/components/modules/employee-form'
import LeaveRequests from '@/components/modules/leave-requests'
import MyLeaves from '@/components/modules/my-leaves'
import ProfilePage from '@/components/modules/profile-page'

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext)
  const [activeModule, setActiveModule] = useState('dashboard')
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)

  if (!user) return null

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />
      case 'employees':
        return editingEmployeeId ? (
          <EmployeeForm
            employeeId={editingEmployeeId}
            onClose={() => setEditingEmployeeId(null)}
          />
        ) : (
          <EmployeeList onEditEmployee={setEditingEmployeeId} />
        )
      case 'employee-new':
        return (
          <EmployeeForm
            onClose={() => setActiveModule('employees')}
          />
        )
      case 'leaves':
        return user.role === 'manager' ? (
          <LeaveRequests />
        ) : (
          <MyLeaves onSwitchToRequest={() => setActiveModule('leave-request')} />
        )
      case 'leave-request':
        return <LeaveRequests isRequestForm={true} />
      case 'profile':
        return <ProfilePage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} userRole={user.role} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 overflow-auto p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}
