'use client'

import { useContext, useState } from 'react'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Settings } from 'lucide-react'

export default function LeaveConfig() {
  const { leaveTypes, holidays, upsertLeaveType, upsertHoliday } = useContext(AppContext)
  const [newType, setNewType] = useState({ code: '', name: '', annualEntitlementDays: 0 })
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={28} /> Leave Configuration
        </h1>
        <p className="text-slate-600 mt-1">charge.docx §4.3 — leave types, entitlements, holidays.</p>
      </div>

      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Leave Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leaveTypes.map(t => (
            <div key={t.id} className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.code} — {t.annualEntitlementDays} days/yr</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => upsertLeaveType({ id: t.id, isActive: !t.isActive })}
              >
                {t.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Code (e.g. SABBATICAL)"
            value={newType.code}
            onChange={e => setNewType({ ...newType, code: e.target.value })}
          />
          <Input
            placeholder="Name"
            value={newType.name}
            onChange={e => setNewType({ ...newType, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Annual days"
            value={newType.annualEntitlementDays}
            onChange={e => setNewType({ ...newType, annualEntitlementDays: Number(e.target.value) })}
          />
          <Button
            onClick={() => {
              if (!newType.code || !newType.name) return
              upsertLeaveType(newType)
              setNewType({ code: '', name: '', annualEntitlementDays: 0 })
            }}
            className="gap-2"
          >
            <Plus size={16} /> Add Type
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Public Holidays</h2>
        <ul className="space-y-2 text-sm">
          {holidays.map(h => (
            <li key={h.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div>
                <span className="font-mono text-slate-700">{h.date}</span>
                <span className="ml-3 text-slate-900">{h.name}</span>
                {h.recurring && <span className="ml-2 text-xs text-blue-600">recurring</span>}
              </div>
              <Button size="sm" variant="ghost" className="text-rose-600">
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input type="date" value={newHoliday.date} onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })} />
          <Input
            placeholder="Holiday name"
            value={newHoliday.name}
            onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
          />
          <Button
            onClick={() => {
              if (!newHoliday.date || !newHoliday.name) return
              upsertHoliday(newHoliday)
              setNewHoliday({ date: '', name: '' })
            }}
            className="gap-2"
          >
            <Plus size={16} /> Add Holiday
          </Button>
        </div>
      </Card>
    </div>
  )
}
