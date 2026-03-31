'use client'

import { User } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Menu } from 'lucide-react'

interface HeaderProps {
  user: User
  onLogout: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900"> HR System</h1>
        <p className="text-sm text-slate-600">Welcome, {user.name}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100">
          <UserIcon size={18} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{user.role}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="gap-2"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </header>
  )
}
