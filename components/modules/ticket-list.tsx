'use client'

import { useContext, useState } from 'react'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Ticket as TicketIcon, Plus, Eye, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function TicketList() {
  const { tickets, isLoading } = useContext(AppContext)
  
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Open</span>
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">In Progress</span>
      case 'RESOLVED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Resolved</span>
      case 'CLOSED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Closed</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return (
          <div className="flex items-center gap-1 text-rose-600">
            <AlertCircle size={14} />
            <span className="text-xs font-bold uppercase">High</span>
          </div>
        )
      case 'MEDIUM':
        return (
          <div className="flex items-center gap-1 text-amber-600">
            <Clock size={14} />
            <span className="text-xs font-bold uppercase">Medium</span>
          </div>
        )
      case 'LOW':
        return (
          <div className="flex items-center gap-1 text-slate-500">
            <CheckCircle2 size={14} />
            <span className="text-xs font-bold uppercase">Low</span>
          </div>
        )
      default:
        return <span className="text-xs font-bold">{priority}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Help Desk & Support</h1>
          <p className="text-slate-600 mt-1">Submit and track your internal support requests</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:translate-y-[-1px]">
          <Plus size={18} />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-blue-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <TicketIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Tickets</p>
            <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border-amber-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">
              {tickets.filter(t => t.status === 'IN_PROGRESS').length}
            </p>
          </div>
        </Card>
        <Card className="p-4 bg-white border-emerald-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-slate-900">
              {tickets.filter(t => t.status === 'RESOLVED').length}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-0 bg-white shadow-sm border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading tickets...</TableCell>
              </TableRow>
            ) : tickets.length > 0 ? (
              tickets.map(ticket => (
                <TableRow key={ticket.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-400">
                    #{ticket.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{ticket.subject}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                      {ticket.category}
                    </span>
                  </TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <TicketIcon className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No tickets found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
