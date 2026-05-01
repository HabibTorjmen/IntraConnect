'use client'

import { useContext, useState, useEffect } from 'react'
import { AppContext, Employee } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EmployeeFormProps {
  employeeId?: string
  onClose: () => void
}

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
  })

  useEffect(() => {
    if (employeeId) {
      const emp = employees.find(e => e.id === employeeId)
      if (emp) {
        const { id, ...rest } = emp
        setFormData(rest)
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

      if (!selectedRole) {
        throw new Error('A role is required before creating a user.')
      }

      const payload = {
        ...formData,
        roleId: selectedRole.id,
        roleName: selectedRole.name,
        roleCode: selectedRole.code,
        permissions: selectedRole.permissions,
      }

      if (employeeId) {
        await updateEmployee(employeeId, payload)
      } else {
        await addEmployee(payload)
      }
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
      </div>

      <Card className="p-6 bg-white max-w-2xl">
        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isLoadingForm}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-555-0000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
              <Input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Engineering"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Position *</label>
              <Input
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Senior Developer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Join Date *</label>
              <Input
                name="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
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
          </div>

            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoadingForm}>
                {isLoadingForm ? 'Saving...' : (employeeId ? 'Update Employee' : 'Add Employee')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoadingForm}>
                Cancel
              </Button>
            </div>
          </fieldset>
        </form>
      </Card>
    </div>
  )
}
