'use client'

import { CalendarDays, ListChecks } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TeamCalendar from './team-calendar'
import LeaveRequests from './leave-requests'

export default function AdminLeaves() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
        <p className="text-slate-600 mt-1">Team calendar and all leave requests</p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="bg-slate-100 h-10 p-1">
          <TabsTrigger value="calendar" className="gap-2 px-4">
            <CalendarDays size={16} />
            Team Calendar
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2 px-4">
            <ListChecks size={16} />
            All Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <TeamCalendar />
        </TabsContent>

        <TabsContent value="requests">
          <LeaveRequests />
        </TabsContent>
      </Tabs>
    </div>
  )
}
