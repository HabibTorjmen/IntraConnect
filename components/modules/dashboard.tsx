'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const { employees, leaveRequests } = useContext(AppContext)

  const chartData = [
    { name: 'Active', value: employees.filter(e => e.status === 'active').length },
    { name: 'Inactive', value: employees.filter(e => e.status === 'inactive').length },
  ]

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length
  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white">
          <p className="text-sm font-medium text-slate-600">Total Employees</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{employees.length}</p>
        </Card>
        <Card className="p-6 bg-white">
          <p className="text-sm font-medium text-slate-600">Active Employees</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {employees.filter(e => e.status === 'active').length}
          </p>
        </Card>
        <Card className="p-6 bg-white">
          <p className="text-sm font-medium text-slate-600">Pending Leaves</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingLeaves}</p>
        </Card>
        <Card className="p-6 bg-white">
          <p className="text-sm font-medium text-slate-600">Approved Leaves</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{approvedLeaves}</p>
        </Card>
      </div>

      <Card className="p-6 bg-white">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Employee Status Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
