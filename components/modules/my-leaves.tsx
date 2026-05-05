'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, X } from 'lucide-react'

interface MyLeavesProps {
  onSwitchToRequest: () => void
}

export default function MyLeaves({ onSwitchToRequest }: MyLeavesProps) {
  const { user } = useContext(AuthContext)
  const { getEmployeeLeaves, getLeaveBalance, cancelLeaveRequest } = useContext(AppContext)

  if (!user) return null

  const empId = user.employeeId || user.id
  const myLeaves = getEmployeeLeaves(empId)
  const approved = myLeaves.filter(l => l.status === 'approved')
  const pending = myLeaves.filter(l => l.status === 'pending')
  const balances = getLeaveBalance(empId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Leave Requests</h1>
          <p className="text-slate-600 mt-1">charge.docx §4.3 — balances refresh on approval.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={onSwitchToRequest}>
          <Plus size={20} />
          Submit Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white">
          <p className="text-sm text-slate-600">Total Requests</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{myLeaves.length}</p>
        </Card>
        <Card className="p-6 bg-white">
          <p className="text-sm text-slate-600">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{approved.length}</p>
        </Card>
        <Card className="p-6 bg-white">
          <p className="text-sm text-slate-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pending.length}</p>
        </Card>
      </div>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-slate-900 mb-4">My Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {balances.map(b => (
            <div key={b.leaveType.id} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 uppercase tracking-wide">{b.leaveType.code}</p>
              <p className="text-lg font-semibold text-slate-900">{b.leaveType.name}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-slate-400">Entitlement</p>
                  <p className="font-semibold">{b.entitlement}</p>
                </div>
                <div>
                  <p className="text-slate-400">Used</p>
                  <p className="font-semibold">{b.used}</p>
                </div>
                <div>
                  <p className="text-slate-400">Available</p>
                  <p className="font-semibold text-emerald-600">{b.available}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Leave Calendar</h2>
        {myLeaves.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
            <p>No leave requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myLeaves.map(leave => (
              <div key={leave.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 capitalize">Type: {leave.type}</p>
                    {leave.reason && <p className="text-sm text-slate-600">Reason: {leave.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                    {leave.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50 gap-1"
                        onClick={() => cancelLeaveRequest(leave.id)}
                      >
                        <X size={14} /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
