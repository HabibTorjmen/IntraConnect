'use client'

import { useContext } from 'react'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileDown, DollarSign, Wallet, TrendingUp, Calendar } from 'lucide-react'

export default function PayrollList() {
  const { payrolls, isLoading } = useContext(AppContext)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payroll & Payslips</h1>
          <p className="text-slate-600 mt-1">View your monthly earnings and download payslips</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-slate-200">
            <Calendar size={18} />
            History
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
            <DollarSign size={18} />
            Advance Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/30 rounded-lg">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-medium bg-blue-500/50 px-2 py-1 rounded">Net Salary</span>
          </div>
          <p className="text-3xl font-bold">
            {payrolls.length > 0 ? formatCurrency(payrolls[0].netSalary) : formatCurrency(0)}
          </p>
          <p className="text-blue-100 text-sm mt-1">
            Last payment: {payrolls.length > 0 ? `${payrolls[0].month}/${payrolls[0].year}` : 'N/A'}
          </p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(450.50)}</p>
          <p className="text-slate-500 text-sm mt-1">Bonuses & Allowances</p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <TrendingUp size={24} className="rotate-180" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(120.40)}</p>
          <p className="text-slate-500 text-sm mt-1">Tax Deductions</p>
        </Card>
      </div>

      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileDown size={18} className="text-blue-600" />
            Recent Payslips
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Allowance</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading payroll data...</TableCell>
              </TableRow>
            ) : payrolls.length > 0 ? (
              payrolls.map(payroll => (
                <TableRow key={payroll.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">
                    {payroll.month}/{payroll.year}
                  </TableCell>
                  <TableCell>{formatCurrency(payroll.basicSalary)}</TableCell>
                  <TableCell className="text-emerald-600">+{formatCurrency(payroll.allowances)}</TableCell>
                  <TableCell className="text-rose-600">-{formatCurrency(payroll.deductions)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(payroll.netSalary)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Paid
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <FileDown size={16} />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <DollarSign className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No payroll records found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
