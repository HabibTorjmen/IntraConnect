'use client'

import { useContext } from 'react'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BookOpen, Award, CheckCircle, Clock, ExternalLink } from 'lucide-react'

export default function TrainingList() {
  const { trainingPlans, isLoading } = useContext(AppContext)

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Completed</span>
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">In Progress</span>
      case 'PLANNED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Planned</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Training & Development</h1>
          <p className="text-slate-600 mt-1">Enhance your skills with company-provided courses</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
          <BookOpen size={18} />
          Browse Catalog
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-slate-800">In Progress</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {trainingPlans.filter(p => p.status === 'IN_PROGRESS').length}
          </p>
          <p className="text-slate-500 text-sm mt-1">Courses currently active</p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {trainingPlans.filter(p => p.status === 'COMPLETED').length}
          </p>
          <p className="text-slate-500 text-sm mt-1">Certifications earned</p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Points</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">1,250</p>
          <p className="text-slate-500 text-sm mt-1">Gained from learning</p>
        </Card>
      </div>

      <Card className="p-0 bg-white shadow-sm border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Training Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading training programs...</TableCell>
              </TableRow>
            ) : trainingPlans.length > 0 ? (
              trainingPlans.map(plan => (
                <TableRow key={plan.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{plan.title}</TableCell>
                  <TableCell className="text-slate-600 max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600 gap-2">
                       Launch
                       <ExternalLink size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                  <BookOpen className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No training plans assigned</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
