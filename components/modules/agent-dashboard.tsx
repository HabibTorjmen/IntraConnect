'use client'

import { useContext } from 'react'
import { AppContext } from '@/context/app-context'
import { AuthContext } from '@/context/auth-context'
import { Card } from '@/components/ui/card'
import { 
  BarChart3, Clock, AlertCircle, 
  CheckCircle2, Inbox, Timer, 
  ArrowUpRight, Users
} from 'lucide-react'
import { 
  Bar, BarChart, ResponsiveContainer, 
  XAxis, YAxis, Tooltip, Cell 
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AgentDashboard() {
  const { user } = useContext(AuthContext)
  const { tickets, employees } = useContext(AppContext)

  // Filter tickets for the stats
  const myTickets = tickets.filter(t => t.assignedToId === user?.employeeId)
  const unassignedTickets = tickets.filter(t => !t.assignedToId && t.status !== 'closed' && t.status !== 'resolved')
  const breachedTickets = tickets.filter(t => t.slaStatus === 'BREACHED')
  const nearBreachTickets = tickets.filter(t => t.slaStatus === 'NEAR_BREACH')

  const stats = [
    { 
      label: 'My Open Tickets', 
      value: myTickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length, 
      icon: <Inbox className="text-blue-600" />,
      color: 'bg-blue-50'
    },
    { 
      label: 'Unassigned', 
      value: unassignedTickets.length, 
      icon: <Users className="text-amber-600" />,
      color: 'bg-amber-50'
    },
    { 
      label: 'SLA Breached', 
      value: breachedTickets.length, 
      icon: <Timer className="text-red-600" />,
      color: 'bg-red-50'
    },
    { 
      label: 'Near Breach', 
      value: nearBreachTickets.length, 
      icon: <AlertCircle className="text-orange-600" />,
      color: 'bg-orange-50'
    }
  ]

  const chartData = [
    { name: 'Low', count: tickets.filter(t => t.priority === 'low').length, color: '#94a3b8' },
    { name: 'Medium', count: tickets.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'High', count: tickets.filter(t => t.priority === 'high').length, color: '#f43f5e' },
    { name: 'Urgent', count: tickets.filter(t => t.priority === 'urgent').length, color: '#7c3aed' },
  ]

  const facilityTickets = tickets.filter(t => 
    t.categoryName?.toLowerCase().includes('facility') || 
    ['Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Janitorial'].includes(t.categoryName || '')
  )

  const facilityStats = {
    active: facilityTickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length,
    urgent: facilityTickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Agent Performance & Queue</h3>
        <span className="text-xs text-slate-400">Last updated: Just now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800">Tickets by Priority</h4>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-xs text-slate-500">Urgent action required</span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6">Active SLAs</h4>
          <div className="space-y-5">
            {breachedTickets.length > 0 ? (
              breachedTickets.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{t.title}</p>
                    <p className="text-xs text-red-600 font-medium">SLA Breached</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-30">
                <CheckCircle2 className="mx-auto mb-2" size={32} />
                <p className="text-sm">No breaches detected</p>
              </div>
            )}
          </div>
          {breachedTickets.length > 4 && (
            <Button variant="link" className="w-full text-xs text-blue-600 mt-4">View All Breaches</Button>
          )}
        </Card>

        <Card className="p-6 border-slate-100 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="text-orange-600" size={18} />
              Recent Facility Incidents
            </h4>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                {facilityStats.active} Active
              </Badge>
              <Badge variant="secondary" className="bg-red-50 text-red-700">
                {facilityStats.urgent} Urgent
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilityTickets.length > 0 ? (
              facilityTickets.slice(0, 3).map(ticket => (
                <div key={ticket.id} className="p-4 border border-slate-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-200">
                      {ticket.categoryName}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">#{ticket.id.slice(0, 6)}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{ticket.title}</p>
                  <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                    <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.priority === 'urgent' ? 'bg-red-100 text-red-600' : 
                      ticket.priority === 'high' ? 'bg-orange-100 text-orange-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 px-2">Details</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400 opacity-60">
                No recent facility incidents reported.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
