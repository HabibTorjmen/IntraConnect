'use client'

import { useContext, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import { AppContext } from '@/context/app-context'
import Header from './header'
import Sidebar from './sidebar'

// Existing Modules
import Dashboard from '@/components/modules/dashboard'
import EmployeeList from '@/components/modules/employee-list'
import EmployeeForm from '@/components/modules/employee-form'
import LeaveRequests from '@/components/modules/leave-requests'
import MyLeaves from '@/components/modules/my-leaves'
import ProfilePage from '@/components/modules/profile-page'
import Tickets from '@/components/modules/tickets'
import PayrollList from '@/components/modules/payroll-list'
import DocumentList from '@/components/modules/document-list'
import FacilityManagement from '@/components/modules/facility-management'
import JobTitles from '@/components/modules/job-titles'
import FeedbackModule from '@/components/modules/feedback'
import TrainingList from '@/components/modules/training-list'
import OnboardingList from '@/components/modules/onboarding-list'
import StaffDirectory from '@/components/modules/staff-directory'
import Tools from '@/components/modules/tools'
import AdminSettings from '@/components/modules/admin-settings'

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext)
  const [activeModule, setActiveModule] = useState('dashboard')
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const { isDemoMode } = useContext(AppContext)

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
      case 'directory':
        return <StaffDirectory />
      case 'leaves':
        return user.role === 'manager' ? (
          <LeaveRequests />
        ) : (
          <MyLeaves onSwitchToRequest={() => setActiveModule('leave-request')} />
        )
      case 'leave-request':
        return <LeaveRequests isRequestForm={true} />
      case 'team-leaves':
        return <LeaveRequests />
      case 'tickets':
        return <Tickets />
      case 'documents':
        return <DocumentList />
      case 'facility':
        return <FacilityManagement />
      case 'job-titles':
        return <JobTitles />
      case 'payroll':
        return <PayrollList />
      case 'tools':
        return <Tools />
      case 'onboarding':
        return <OnboardingList />
      case 'training':
        return <TrainingList />
      case 'feedback':
        return <FeedbackModule />
      case 'admin-settings':
        return <AdminSettings />
      case 'profile':
        return <ProfilePage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {isDemoMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold shadow-sm border border-amber-200 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          Demo Mode (Backend Offline)
        </div>
      )}
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} userRole={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 overflow-auto p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}
