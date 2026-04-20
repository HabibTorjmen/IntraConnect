'use client'

import { useContext, useState, useMemo } from 'react'
import { 
  Search, Filter, Users, Network, Mail, Phone, 
  MapPin, ChevronRight, ChevronDown, User, 
  Building2, Briefcase, ExternalLink, MoreHorizontal,
  ChevronLeft
} from 'lucide-react'
import { AppContext, Employee } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface OrgNodeProps {
  employee: Employee
  employees: Employee[]
  level: number
}

function OrgNode({ employee, employees, level }: OrgNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const subordinates = employees.filter(e => e.managerId === employee.id)
  const hasSubordinates = subordinates.length > 0

  return (
    <div className="flex flex-col items-center">
      <div className={`relative flex flex-col items-center group ${level > 0 ? 'mt-8' : ''}`}>
        {level > 0 && (
          <div className="absolute -top-8 w-px h-8 bg-slate-300" />
        )}
        
        <Card className={`w-64 border-2 transition-all duration-300 hover:shadow-lg ${level === 0 ? 'border-primary shadow-md' : 'border-slate-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} alt={employee.name} />
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{employee.name}</p>
                <p className="text-xs text-primary font-medium truncate">{employee.position}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{employee.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasSubordinates && (
          <>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute -bottom-3 z-10 bg-white rounded-full p-0.5 border border-slate-200 shadow-sm text-slate-400 hover:text-primary transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className="h-4 w-px bg-slate-300 mt-2" />
          </>
        )}
      </div>

      {hasSubordinates && isExpanded && (
        <div className="relative pt-4">
          {subordinates.length > 1 && (
            <div className="absolute top-0 left-[calc(50%/subordinates.length)] right-[calc(50%/subordinates.length)] h-px bg-slate-300" 
                 style={{ 
                   left: `${100 / (subordinates.length * 2)}%`, 
                   right: `${100 / (subordinates.length * 2)}%` 
                 }} 
            />
          )}
          <div className="flex gap-8 justify-center">
            {subordinates.map(sub => (
              <OrgNode key={sub.id} employee={sub} employees={employees} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StaffDirectory() {
  const { employees } = useContext(AppContext)
  const [view, setView] = useState<'directory' | 'org-chart'>('directory')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')

  const departments = ['All', ...Array.from(new Set(employees.map(e => e.department)))]

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           e.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = selectedDept === 'All' || e.department === selectedDept
      return matchesSearch && matchesDept
    })
  }, [employees, searchQuery, selectedDept])

  const topLevelEmployees = useMemo(() => {
    return employees.filter(e => !e.managerId)
  }, [employees])

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Staff Directory</h2>
            <p className="text-slate-500 text-sm">Browse and connect with team members across the organization.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <Button 
              variant={view === 'directory' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-lg px-4 ${view === 'directory' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500'}`}
              onClick={() => setView('directory')}
            >
              <Users size={16} className="mr-2" />
              Directory
            </Button>
            <Button 
              variant={view === 'org-chart' ? 'default' : 'ghost'} 
              size="sm"
              className={`rounded-lg px-4 ${view === 'org-chart' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500'}`}
              onClick={() => setView('org-chart')}
            >
              <Network size={16} className="mr-2" />
              Org Chart
            </Button>
          </div>
        </div>

        {view === 'directory' && (
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search by name, role or email..." 
                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {departments.map(dept => (
                <Button
                  key={dept}
                  variant={selectedDept === dept ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-xl px-4 h-11 whitespace-nowrap border-slate-200 transition-all ${
                    selectedDept === dept ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedDept(dept)}
                >
                  {dept}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {view === 'directory' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEmployees.map(employee => (
              <Card key={employee.id} className="group hover:shadow-xl transition-all duration-500 border-slate-200 bg-white overflow-hidden rounded-2xl flex flex-col">
                <div className="h-2 bg-gradient-to-r from-primary/80 to-blue-500/80" />
                <CardHeader className="pt-6 pb-4 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} alt={employee.name} />
                      <AvatarFallback className="text-xl bg-slate-100 text-slate-400">{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white shadow-sm ${employee.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800">{employee.name}</CardTitle>
                  <CardDescription className="text-primary font-semibold text-sm flex items-center gap-1.5">
                    <Briefcase size={14} />
                    {employee.position}
                  </CardDescription>
                  <Badge variant="outline" className="mt-2 bg-slate-50 text-slate-500 border-slate-200 font-medium">
                    {employee.department}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 pb-6 flex-1 text-sm text-slate-600 px-6">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Mail size={16} />
                    </div>
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Phone size={16} />
                    </div>
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                      <MapPin size={16} />
                    </div>
                    <span className="text-slate-500 italic">Office A-12</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 p-6 bg-slate-50/50 border-t border-slate-100">
                  <Button variant="ghost" className="w-full justify-between text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all h-10 px-4">
                    View Full Profile
                    <ChevronRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-full min-w-max flex items-start justify-center pt-8 pb-32">
            <div className="flex flex-col gap-16">
              {topLevelEmployees.map(top => (
                <OrgNode key={top.id} employee={top} employees={employees} level={0} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
