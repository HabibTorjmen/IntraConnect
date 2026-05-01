'use client'

import { useContext, useState } from 'react'
import { AppContext } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Search, FileUp, Filter, Users, History } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuthContext } from '@/context/auth-context'
import AuditLogList from './audit-log-list'

interface EmployeeListProps {
  onEditEmployee: (id: string) => void
}

export default function EmployeeList({ onEditEmployee }: EmployeeListProps) {
  const { employees, deleteEmployee, advancedSearch, addBulkEmployees, isLoading } = useContext(AppContext)
  const { user } = useContext(AuthContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAuditTrail, setShowAuditTrail] = useState(false)

  const handleSearch = () => {
    advancedSearch(
      searchTerm, 
      deptFilter === 'all' ? undefined : deptFilter, 
      statusFilter === 'all' ? undefined : statusFilter
    )
  }

  const handleBulkImport = async () => {
    // In a real app, this would open a file picker and parse CSV.
    // For this PFE demo, we'll simulate importing a few employees.
    const dummyEmployees = [
      { fullName: 'Jean Dupont', department: 'IT', status: 'active' as const, phone: '0612345678', joinDate: new Date().toISOString() },
      { fullName: 'Marie Curie', department: 'HR', status: 'active' as const, phone: '0687654321', joinDate: new Date().toISOString() }
    ]
    
    if (confirm(`Simulate bulk import of ${dummyEmployees.length} employees?`)) {
      try {
        await addBulkEmployees(dummyEmployees)
        alert('Bulk import successful!')
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  const itemsPerPage = 10
  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = employees.slice(start, start + itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-slate-600 mt-1">Manage all employees and perform bulk operations</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Button 
              onClick={() => setShowAuditTrail(!showAuditTrail)} 
              variant="outline" 
              className={`gap-2 ${showAuditTrail ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
            >
              <History size={18} />
              {showAuditTrail ? 'Hide Logs' : 'Audit Trail'}
            </Button>
          )}
          <Button onClick={handleBulkImport} variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <FileUp size={18} />
            Mass Import
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white shadow-sm border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading} className="h-11 px-4">
              <Filter size={18} />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.map(emp => (
                <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{emp.name}</TableCell>
                  <TableCell className="text-slate-600">{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{emp.roleName || 'Unassigned'}</span>
                      <span className="text-xs text-slate-500">{emp.roleCode || 'no-role'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{emp.position}</TableCell>
                  <TableCell className="text-slate-600">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      emp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {emp.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                        onClick={() => onEditEmployee(emp.id)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this employee?')) {
                            try {
                            await deleteEmployee(emp.id)
                            alert('Employee deleted successfully (Demo Mode)')
                            } catch (err: any) {
                              alert(err.message || 'Failed to delete employee')
                            }
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg mt-4 border border-dashed">
            <Users className="mx-auto mb-3 text-slate-300" size={48} />
            <p className="text-lg font-medium">No employees found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <div className="text-sm font-medium text-slate-600">
              Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      {showAuditTrail && user?.role === 'admin' && (
        <div className="animate-in slide-in-from-bottom duration-300">
          <AuditLogList />
        </div>
      )}
    </Card>
  </div>
  )
}
