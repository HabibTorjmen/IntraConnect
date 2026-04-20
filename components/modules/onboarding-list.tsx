'use client'

import { useContext, useMemo, useState } from 'react'
import { ChevronRight, UserCheck, UserPlus } from 'lucide-react'

import { AppContext } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function OnboardingList() {
  const { employees, onboardingPlans, toggleOnboardingTask } = useContext(AppContext)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(onboardingPlans[0]?.id || null)

  const selectedPlan = onboardingPlans.find(plan => plan.id === selectedPlanId) || onboardingPlans[0]
  const newHires = onboardingPlans.map(plan => {
    const employee = employees.find(item => item.id === plan.employeeId)
    return {
      ...plan,
      employee,
    }
  })

  const completedThisMonth = useMemo(() => onboardingPlans.filter(plan => plan.progress === 100).length, [onboardingPlans])
  const inProgress = useMemo(() => onboardingPlans.filter(plan => plan.progress > 0 && plan.progress < 100).length, [onboardingPlans])
  const pendingSetup = useMemo(() => onboardingPlans.filter(plan => plan.progress < 50).length, [onboardingPlans])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <UserPlus size={32} className="text-blue-600" />
            Employee Onboarding
          </h1>
          <p className="text-slate-600 mt-1">Track first-login, orientation, checklist completion, and enablement.</p>
        </div>
        {selectedPlan && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
                <UserCheck size={18} />
                Open Checklist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Onboarding Checklist</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Current Progress</span>
                    <span className="text-blue-600 font-bold">{selectedPlan.progress}%</span>
                  </div>
                  <Progress value={selectedPlan.progress} className="h-2" />
                </div>
                <div className="space-y-3">
                  {selectedPlan.tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => toggleOnboardingTask(selectedPlan.id, task.id)}
                    >
                      <Checkbox checked={task.done} onCheckedChange={() => toggleOnboardingTask(selectedPlan.id, task.id)} />
                      <span className={`text-sm ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="font-semibold text-slate-500 text-sm uppercase mb-4">Pending Setup</h3>
          <span className="text-4xl font-bold text-slate-900">{pendingSetup}</span>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="font-semibold text-slate-500 text-sm uppercase mb-4">In Progress</h3>
          <span className="text-4xl font-bold text-slate-900">{inProgress}</span>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="font-semibold text-slate-500 text-sm uppercase mb-4">Completed</h3>
          <span className="text-4xl font-bold text-slate-900">{completedThisMonth}</span>
        </Card>
      </div>

      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">New Joiners Tracking</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newHires.map(plan => (
              <TableRow key={plan.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-slate-900">{plan.employee?.name || 'Unknown Employee'}</TableCell>
                <TableCell>{plan.employee?.department || 'General'}</TableCell>
                <TableCell className="w-[220px]">
                  <div className="flex items-center gap-3">
                    <Progress value={plan.progress} className="flex-1 h-2" />
                    <span className="text-xs font-bold text-slate-500">{plan.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 text-sm italic">{plan.mentor}</TableCell>
                <TableCell className="text-slate-500 text-sm">{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedPlanId(plan.id)}>
                    <ChevronRight size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
