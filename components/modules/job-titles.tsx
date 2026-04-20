'use client'

import { useContext, useMemo } from 'react'
import { Briefcase, Network, ShieldCheck } from 'lucide-react'

import { AppContext } from '@/context/app-context'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function JobTitles() {
  const { employees } = useContext(AppContext)

  const groupedTitles = useMemo(() => {
    const titles = new Map<string, { department: string; count: number; levels: string[] }>()

    employees.forEach(employee => {
      const current = titles.get(employee.position) || {
        department: employee.department,
        count: 0,
        levels: [],
      }

      current.count += 1
      current.department = employee.department
      current.levels = Array.from(new Set([...current.levels, employee.position]))
      titles.set(employee.position, current)
    })

    return Array.from(titles.entries()).map(([name, value], index) => ({
      id: String(index + 1),
      name,
      department: value.department,
      level: value.count > 2 ? 'Multi-level' : 'Single-level',
      count: value.count,
    }))
  }, [employees])

  const hierarchy = useMemo(() => {
    const top = employees.filter(employee => !employee.managerId)
    return top.map(employee => ({
      role: employee.position,
      name: employee.name,
      subordinates: employees
        .filter(item => item.managerId === employee.id)
        .map(item => ({
          role: item.position,
          name: item.name,
          subordinates: employees.filter(child => child.managerId === item.id).map(child => child.department),
        })),
    }))
  }, [employees])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Titles & Hierarchy</h1>
        <p className="text-muted-foreground">Standardized positions, reporting lines, and organization structure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standardized Position Catalog</CardTitle>
              <CardDescription>Live title summary derived from the local workforce dataset.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedTitles.map(job => (
                  <div key={job.id} className="p-4 border rounded-xl bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Briefcase size={20} />
                      </div>
                      <Badge variant="secondary">{job.count} Employees</Badge>
                    </div>
                    <h3 className="font-bold text-lg">{job.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{job.department} • {job.level}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">Mapped</Badge>
                      <Badge variant="outline" className="text-[10px]">Demo Ready</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md">Job Governance Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 text-green-600" />
                  <span>Titles are normalized by role and visible across the employee directory.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 text-green-600" />
                  <span>Manager relationships are reused to power the simplified org chart.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 text-green-600" />
                  <span>The module is fully frontend-driven, so it can be tested without backend dependencies.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network size={18} />
                Org Hierarchy
              </CardTitle>
              <CardDescription>Reporting lines and structure.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hierarchy.map((root, index) => (
                  <div key={index} className="space-y-4">
                    <div className="p-3 bg-slate-900 text-white rounded-lg text-center">
                      <p className="text-xs opacity-70 underline uppercase">{root.role}</p>
                      <p className="font-bold">{root.name}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {root.subordinates.map((subordinate, childIndex) => (
                        <div key={childIndex} className="p-2 border rounded bg-slate-50 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase leading-none mb-1">{subordinate.role}</p>
                          <p className="text-xs font-semibold">{subordinate.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
