'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Briefcase, Calendar, Building2 } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useContext(AuthContext)

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
      </div>

      <Card className="p-8 bg-white max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <Badge className="mt-2">{user.role.toUpperCase()}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Mail className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="text-slate-900 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-slate-600">Department</p>
                <p className="text-slate-900 font-medium">{user.department || 'N/A'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Briefcase className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-slate-600">Position</p>
                <p className="text-slate-900 font-medium">{user.position || 'N/A'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Calendar className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-slate-600">Role</p>
                <p className="text-slate-900 font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
