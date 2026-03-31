'use client'

import { Home, Users, Calendar, LogOut, FileText, Settings } from 'lucide-react'
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
    { id: 'leaves', label: 'Leaves', icon: Calendar, roles: ['employee', 'manager', 'admin'] },
    { id: 'profile', label: 'My Profile', icon: FileText, roles: ['employee', 'manager', 'admin'] },
  ]

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold">HR System</h2>
        <p className="text-xs text-slate-400 mt-1">ADMIN</p>
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
            <Users size={20} />
            Add Employee
          </Button>
        )}
      </nav>
    </aside>
  )
}
