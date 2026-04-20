'use client'

import { useContext } from 'react'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShieldAlert, Activity, User, Globe, Clock } from 'lucide-react'

export default function AuditLogList() {
  const { auditLogs, isLoading } = useContext(AppContext)

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-rose-600 font-bold'
    if (action.includes('UPDATE')) return 'text-amber-600 font-bold'
    if (action.includes('CREATE')) return 'text-emerald-600 font-bold'
    return 'text-blue-600 font-bold'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
             <ShieldAlert size={32} className="text-rose-600" />
             System Audit Logs
          </h1>
          <p className="text-slate-600 mt-1">Track all administrative actions and system security events</p>
        </div>
      </div>

      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-slate-300 flex items-center justify-between text-xs font-mono">
            <div className="flex gap-4">
               <span className="flex items-center gap-1"><Activity size={14} /> ACTIVE LOGGING</span>
               <span className="flex items-center gap-1 uppercase tracking-tighter">RETENTION: 90 DAYS</span>
            </div>
            <span>INTRA-CONNECT SECURE ENGINE v1.0</span>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>User / Principal</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Accessing audit trails...</TableCell>
              </TableRow>
            ) : auditLogs.length > 0 ? (
              auditLogs.map(log => (
                <TableRow key={log.id} className="hover:bg-slate-50 transition-colors font-mono text-[13px]">
                  <TableCell className="text-slate-500 flex items-center gap-2">
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      {log.user?.name || 'SYSTEM'}
                    </div>
                  </TableCell>
                  <TableCell className={getActionColor(log.action)}>{log.action}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{log.resource}</TableCell>
                  <TableCell className="text-slate-500 truncate max-w-[200px]">{log.details}</TableCell>
                  <TableCell className="text-slate-400 flex items-center gap-2">
                     <Globe size={12} />
                     {log.ipAddress || '127.0.0.1'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500 italic">
                   No security event logged yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
