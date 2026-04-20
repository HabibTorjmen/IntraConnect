'use client'

import { useState, useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import { AppContext } from '@/context/app-context'
import { Download, FileText, UploadCloud, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Payroll() {
  const { user } = useContext(AuthContext)
  const { payrolls, isLoading } = useContext(AppContext)
  const isHR = user?.role === 'admin' || user?.role === 'hr'

  // If not admin, only show user's own payrolls
  const myPayrolls = isHR ? payrolls : payrolls.filter(p => p.employeeId === user?.id)

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || 'Unknown'
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Payroll & Compensation</h2>
          <p className="text-slate-500 mt-1">Securely view and download your monthly compensation documents.</p>
        </div>
      </div>

      {isHR && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-600" />
            HR Administration: Bulk Upload
          </h3>
          <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors cursor-pointer group">
            <UploadCloud size={32} className="text-slate-400 group-hover:text-indigo-600 mb-4" />
            <p className="font-semibold text-slate-700">Upload bulk PDF payslips</p>
            <p className="text-sm text-slate-500 mt-1">Files must be named using the format: EMPID_YYYY_MM.pdf</p>
            <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">Select Files</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">My Payslips (2026)</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading payroll records...</div>
          ) : myPayrolls.length > 0 ? (
            myPayrolls.map(payroll => (
              <div key={payroll.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{getMonthName(payroll.month)} {payroll.year}</p>
                    <p className="text-sm text-slate-500">Issued for period ending {payroll.month}/{payroll.year} • {payroll.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {payroll.month === 4 ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <AlertCircle size={14} /> NEW
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <CheckCircle2 size={14} /> Processed
                    </span>
                  )}
                  
                  <h4 className="font-mono text-slate-400 font-medium tracking-widest hidden sm:block">****</h4>
                  
                  <Button variant="outline" className="gap-2 border-slate-200 text-slate-700 hover:text-blue-600">
                    <Download size={16} />
                    Download PDF
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              <FileText className="mx-auto mb-4 opacity-20" size={48} />
              <p>No payslips found for your account.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-4 border border-blue-100 mt-auto">
        <AlertCircle className="text-blue-600 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-blue-900 text-sm">Security Notice</h4>
          <p className="text-sm text-blue-700 mt-1">
            These documents contain highly confidential personal and financial information. Ensure you do not download these files on public computers. Access is heavily monitored via audit logs.
          </p>
        </div>
      </div>
    </div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
