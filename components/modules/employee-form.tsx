'use client'

import { useContext, useState, useEffect } from 'react'
import { AppContext, Employee } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EmployeeFormProps {
  employeeId?: string
  onClose: () => void
}

const CONTRACT_TYPES: Array<Employee['contractType']> = ['CDI', 'CDD', 'Internship', 'Contractor']

export default function EmployeeForm({ employeeId, onClose }: EmployeeFormProps) {
  const { employees, roles, addEmployee, updateEmployee } = useContext(AppContext)
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    roleId: '',
    roleName: '',
    roleCode: '',
    permissions: [],
    dateOfBirth: '',
    address: '',
    contractType: '',
    workLocation: '',
    salaryGrade: '',
    probationEndDate: '',
    hrNotes: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  })

  useEffect(() => {
    if (employeeId) {
      const emp = employees.find(e => e.id === employeeId)
      if (emp) {
        const { id, ...rest } = emp
        setFormData(prev => ({ ...prev, ...rest }))
      }
    }
  }, [employeeId, employees])

  useEffect(() => {
    if (employeeId || formData.roleId || roles.length === 0) return
    const defaultRole = roles.find(role => role.code === 'employee') || roles[0]
    if (!defaultRole) return
    setFormData(current => ({
      ...current,
      roleId: defaultRole.id,
      roleName: defaultRole.name,
      roleCode: defaultRole.code,
      permissions: defaultRole.permissions,
    }))
  }, [employeeId, formData.roleId, roles])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingForm(true)
    setFormError(null)
    try {
      const selectedRole = roles.find(role => role.id === formData.roleId)
      if (!selectedRole) throw new Error('A role is required before creating a user.')

      const payload = {
        ...formData,
        roleId: selectedRole.id,
        roleName: selectedRole.name,
        roleCode: selectedRole.code,
        permissions: selectedRole.permissions,
      }
      if (employeeId) await updateEmployee(employeeId, payload)
      else await addEmployee(payload)
      onClose()
    } catch (err: any) {
      setFormError(err.message || 'Failed to save employee')
    } finally {
      setIsLoadingForm(false)
    }
  }

  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const selectedRole = roles.find(role => role.id === formData.roleId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {employeeId ? 'Edit Employee' : 'Add New Employee'}
        </h1>
        <p className="text-slate-500 mt-1">
          Fields per charge.docx §4.1 (required + optional).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {formError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{formError}</div>
        )}
        <fieldset disabled={isLoadingForm} className="space-y-6">
          {/* Identity */}
          <Card className="p-6 bg-white">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Identity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <Input name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <Input name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
                <Input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Street, City" />
              </div>
            </div>
          </Card>

          {/* Job */}
          <Card className="p-6 bg-white">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Job</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                <Input name="department" value={formData.department} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position *</label>
                <Input name="position" value={formData.position} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract Type</label>
                <Select
                  value={formData.contractType || ''}
                  onValueChange={(v) => setFormData({ ...formData, contractType: v as Employee['contractType'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.filter(Boolean).map(t => (
                      <SelectItem key={t as string} value={t as string}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Location</label>
                <Input name="workLocation" value={formData.workLocation || ''} onChange={handleChange} placeholder="HQ – Floor 2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Salary Grade</label>
                <Input name="salaryGrade" value={formData.salaryGrade || ''} onChange={handleChange} placeholder="Grade 4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Join Date *</label>
                <Input name="joinDate" type="date" value={formData.joinDate} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Probation End Date</label>
                <Input name="probationEndDate" type="date" value={formData.probationEndDate || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Emergency contact */}
          <Card className="p-6 bg-white">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <Input name="emergencyName" value={formData.emergencyName || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <Input name="emergencyPhone" value={formData.emergencyPhone || ''} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                <Input name="emergencyRelation" value={formData.emergencyRelation || ''} onChange={handleChange} placeholder="Spouse, parent…" />
              </div>
            </div>
          </Card>

          {/* HR */}
          <Card className="p-6 bg-white">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Role & HR notes</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) => {
                    const role = roles.find(item => item.id === value)
                    setFormData({
                      ...formData,
                      roleId: value,
                      roleName: role?.name || '',
                      roleCode: role?.code || '',
                      permissions: role?.permissions || [],
                    })
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({role.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Role Details</p>
                    <p className="text-sm text-slate-500">
                      {selectedRole?.description || 'Choose a role to preview its access bundle.'}
                    </p>
                  </div>
                  {selectedRole && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {selectedRole.code}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedRole?.permissions || []).map(permission => (
                    <span key={permission} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal HR Notes</label>
                <Textarea
                  name="hrNotes"
                  value={formData.hrNotes || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Internal notes — not visible to the employee."
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoadingForm}>
              {isLoadingForm ? 'Saving...' : (employeeId ? 'Update Employee' : 'Add Employee')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoadingForm}>
              Cancel
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}
