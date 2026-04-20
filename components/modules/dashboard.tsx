'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Users, FileText, CheckCircle, Clock, Building2, ShieldAlert, Network, UserPlus } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const { employees, leaveRequests } = useContext(AppContext)

  const chartData = [
    { name: 'Active', value: employees.filter(e => e.status === 'active').length },
    { name: 'Inactive', value: employees.filter(e => e.status === 'inactive').length },
  ]

  const deptDataRaw = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const deptData = Object.entries(deptDataRaw).map(([name, value]) => ({ name, value }))

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length
  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved').length
  const rejectedLeaves = leaveRequests.filter(l => l.status === 'rejected').length

  const leaveData = [
    { name: 'Approved', value: approvedLeaves },
    { name: 'Pending', value: pendingLeaves },
    { name: 'Rejected', value: rejectedLeaves },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Employees</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{employees.length}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Employees</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {employees.filter(e => e.status === 'active').length}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Leaves</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pendingLeaves}</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Approved Leaves</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{approvedLeaves}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Employees by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Leave Request Distribution</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Approved' ? '#10b981' : entry.name === 'Pending' ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Facility Summary Widget */}
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="text-amber-500" size={20} />
            <h3 className="font-bold">Facility Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Active Incidents</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Next Maint.</span>
              <span className="font-semibold text-blue-600">Apr 25</span>
            </div>
          </div>
        </Card>

        {/* Audit Log Quick View (Admin Only) */}
        {user?.role === 'admin' && (
          <Card className="p-5 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-indigo-500" size={20} />
              <h3 className="font-bold">Security & Audit</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">System Logs (24h)</span>
                <span className="font-semibold">142</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Critical Alerts</span>
                <span className="font-semibold text-emerald-600">0</span>
              </div>
            </div>
          </Card>
        )}

        {/* Job Titles / Hierarchy Widget */}
        <Card className="p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <Network className="text-blue-500" size={20} />
            <h3 className="font-bold">Org Structure</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Mapped Roles</span>
              <span className="font-semibold">14</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Open Positions</span>
              <span className="font-semibold text-blue-600">2</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
