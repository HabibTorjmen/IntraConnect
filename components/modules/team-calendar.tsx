'use client'

import { useContext, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWeekend,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, Users } from 'lucide-react'
import { AppContext, LeaveRequest } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type LeaveType = LeaveRequest['type']
type LeaveStatus = LeaveRequest['status']

const TYPE_STYLES: Record<LeaveType, { bg: string; text: string; border: string; dot: string }> = {
  annual:   { bg: 'bg-blue-100',  text: 'text-blue-800',  border: 'border-blue-300',  dot: 'bg-blue-500' },
  sick:     { bg: 'bg-rose-100',  text: 'text-rose-800',  border: 'border-rose-300',  dot: 'bg-rose-500' },
  personal: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
}

const STATUS_LABEL: Record<LeaveStatus, string> = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function leaveCoversDay(leave: LeaveRequest, day: Date) {
  const start = parseISO(leave.startDate)
  const end = parseISO(leave.endDate)
  return day >= new Date(start.getFullYear(), start.getMonth(), start.getDate())
      && day <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
}

export default function TeamCalendar() {
  const { leaveRequests, employees } = useContext(AppContext)
  const [cursor, setCursor] = useState<Date>(() => new Date())
  const [typeFilter, setTypeFilter] = useState<'all' | LeaveType>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [includePending, setIncludePending] = useState(false)
  const [openDay, setOpenDay] = useState<Date | null>(null)

  const employeeById = useMemo(() => {
    const m = new Map<string, typeof employees[number]>()
    employees.forEach(e => m.set(e.id, e))
    return m
  }, [employees])

  const departmentOptions = useMemo(
    () => Array.from(new Set(employees.map(e => e.department))).filter(Boolean),
    [employees],
  )

  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter(l => {
      if (l.status === 'rejected') return false
      if (!includePending && l.status === 'pending') return false
      if (typeFilter !== 'all' && l.type !== typeFilter) return false
      if (deptFilter !== 'all') {
        const emp = employeeById.get(l.employeeId)
        if (!emp || emp.department !== deptFilter) return false
      }
      return true
    })
  }, [leaveRequests, includePending, typeFilter, deptFilter, employeeById])

  const monthStart = startOfMonth(cursor)
  const monthEnd = endOfMonth(cursor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const leavesPerDay = useMemo(() => {
    const map = new Map<string, LeaveRequest[]>()
    days.forEach(d => {
      const key = format(d, 'yyyy-MM-dd')
      map.set(key, filteredLeaves.filter(l => leaveCoversDay(l, d)))
    })
    return map
  }, [days, filteredLeaves])

  const dialogLeaves = openDay ? leavesPerDay.get(format(openDay, 'yyyy-MM-dd')) ?? [] : []
  const today = new Date()
  const totalInMonth = filteredLeaves.filter(l =>
    parseISO(l.endDate) >= monthStart && parseISO(l.startDate) <= monthEnd,
  ).length

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Previous month">
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month">
              <ChevronRight size={16} />
            </Button>
            <div className="ml-2 flex items-center gap-2 text-slate-900">
              <CalendarDays size={20} className="text-blue-600" />
              <h2 className="text-xl font-semibold">{format(cursor, 'MMMM yyyy')}</h2>
            </div>
            <span className="ml-2 text-sm text-slate-500">
              {totalInMonth} {totalInMonth === 1 ? 'leave' : 'leaves'} this month
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-9 w-[170px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant={includePending ? 'default' : 'outline'}
              className={includePending ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={() => setIncludePending(v => !v)}
            >
              {includePending ? 'Approved + Pending' : 'Approved only'}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500" /> Annual</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /> Sick</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Personal</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-dashed border-slate-400" /> Pending</span>
        </div>
      </Card>

      <Card className="overflow-hidden bg-white border-slate-200">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {WEEKDAYS.map(d => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-slate-600 text-center uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayLeaves = leavesPerDay.get(key) ?? []
            const inMonth = isSameMonth(day, cursor)
            const isToday = isSameDay(day, today)
            const weekend = isWeekend(day)
            const visible = dayLeaves.slice(0, 3)
            const hidden = dayLeaves.length - visible.length

            return (
              <button
                key={key + idx}
                type="button"
                onClick={() => setOpenDay(day)}
                className={[
                  'min-h-[120px] border-b border-r border-slate-200 p-2 text-left transition-colors',
                  inMonth ? 'bg-white' : 'bg-slate-50/60',
                  weekend && inMonth ? 'bg-slate-50/40' : '',
                  'hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-inset',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={[
                    'text-sm font-medium',
                    !inMonth ? 'text-slate-300' : isToday ? 'text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center' : 'text-slate-700',
                  ].join(' ')}>
                    {format(day, 'd')}
                  </span>
                  {dayLeaves.length > 0 && (
                    <span className="text-[10px] text-slate-500">{dayLeaves.length}</span>
                  )}
                </div>

                <div className="space-y-1">
                  {visible.map(l => {
                    const s = TYPE_STYLES[l.type]
                    const isPending = l.status === 'pending'
                    return (
                      <div
                        key={l.id}
                        className={[
                          'truncate rounded px-1.5 py-0.5 text-[11px] font-medium border',
                          s.bg, s.text,
                          isPending ? 'border-dashed opacity-70' : s.border,
                        ].join(' ')}
                        title={`${l.employeeName} — ${l.type}${isPending ? ' (pending)' : ''}`}
                      >
                        {l.employeeName}
                      </div>
                    )
                  })}
                  {hidden > 0 && (
                    <div className="text-[11px] font-medium text-slate-500 px-1.5">
                      +{hidden} more
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Dialog open={openDay !== null} onOpenChange={(open) => !open && setOpenDay(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" />
              {openDay ? format(openDay, 'EEEE, MMMM d, yyyy') : ''}
            </DialogTitle>
          </DialogHeader>
          {dialogLeaves.length === 0 ? (
            <div className="py-6 text-center text-slate-500">
              <Users className="mx-auto mb-2 text-slate-300" size={32} />
              <p className="text-sm">No leaves on this day</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
              {dialogLeaves.map(l => {
                const s = TYPE_STYLES[l.type]
                const emp = employeeById.get(l.employeeId)
                return (
                  <li key={l.id} className={`p-3 rounded-lg border ${s.border} ${s.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`font-semibold truncate ${s.text}`}>{l.employeeName}</p>
                        <p className="text-xs text-slate-600">
                          {emp?.department || '—'}{emp?.position ? ` · ${emp.position}` : ''}
                        </p>
                        <p className="text-xs text-slate-700 mt-1">
                          {format(parseISO(l.startDate), 'MMM d')} – {format(parseISO(l.endDate), 'MMM d, yyyy')}
                        </p>
                        {l.reason && (
                          <p className="text-xs text-slate-600 mt-1 italic">"{l.reason}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${s.text}`}>
                          {l.type}
                        </span>
                        <span className={[
                          'text-[10px] px-2 py-0.5 rounded-full font-medium',
                          l.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                        ].join(' ')}>
                          {STATUS_LABEL[l.status]}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
