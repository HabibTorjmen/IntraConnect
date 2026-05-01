'use client'

import { Home, Users, Calendar, FileText, Ticket, Folder, UserPlus, FileSpreadsheet, BookOpen, MessageSquare, Building2, Network, Shield, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
  userRole: string
}

export default function Sidebar({ activeModule, setActiveModule, userRole }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['employee', 'manager', 'admin'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['manager', 'admin'] },
    { id: 'directory', label: 'Directory', icon: Network, roles: ['employee', 'manager', 'admin'] },
    { id: 'leaves', label: 'Leaves', icon: Calendar, roles: ['employee', 'manager', 'admin'] },
    { id: 'tickets', label: 'Help Desk', icon: Ticket, roles: ['employee', 'manager', 'admin'] },
    { id: 'documents', label: 'Documents', icon: Folder, roles: ['employee', 'manager', 'admin'] },
    { id: 'facility', label: 'Facility MGMT', icon: Building2, roles: ['employee', 'manager', 'admin'] },
    { id: 'job-titles', label: 'Job Titles', icon: Network, roles: ['employee', 'manager', 'admin'] },
    { id: 'tools', label: 'Tools Directory', icon: Wrench, roles: ['employee', 'manager', 'admin'] },
    { id: 'payroll', label: 'Payroll', icon: FileSpreadsheet, roles: ['employee', 'manager', 'admin', 'hr'] },
    { id: 'training', label: 'Training', icon: BookOpen, roles: ['employee', 'manager', 'admin'] },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, roles: ['employee', 'manager', 'admin'] },
    { id: 'profile', label: 'My Profile', icon: FileText, roles: ['employee', 'manager', 'admin'] },
    { id: 'role-management', label: 'Role Management', icon: Shield, roles: ['admin'] },
  ]

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold">IntraConnect</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase">{userRole}</p>
      </div>

      <nav className="flex-1 space-y-2">
        {visibleItems.map(item => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeModule === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                activeModule === item.id
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveModule(item.id)}
            >
              <Icon size={20} />
              {item.label}
            </Button>
          )
        })}

        {userRole === 'manager' && (
          <Button
            variant={activeModule === 'team-leaves' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 ${
              activeModule === 'team-leaves'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            onClick={() => setActiveModule('team-leaves')}
          >
            <Calendar size={20} />
            Team Leaves
          </Button>
        )}

        {(userRole === 'admin' || userRole === 'manager') && (
          <Button
            variant={activeModule === 'employee-new' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 ${
              activeModule === 'employee-new'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            onClick={() => setActiveModule('employee-new')}
          >
            <UserPlus size={20} />
            Add Employee
          </Button>
        )}

        {userRole === 'admin' && (
          <>
            <div className="mt-8 mb-4 border-t border-slate-700 pt-4"></div>
            <Button
              variant={activeModule === 'onboarding' ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                activeModule === 'onboarding'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveModule('onboarding')}
            >
              <UserPlus size={20} />
              Onboarding
            </Button>

            <Button
              variant={activeModule === 'admin-settings' ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 ${
                activeModule === 'admin-settings'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setActiveModule('admin-settings')}
            >
              <Shield size={20} />
              Admin Console
            </Button>
          </>
        )}
      </nav>
    </aside>
  )
}
