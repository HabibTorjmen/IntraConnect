'use client'

import { useContext, useMemo, useState } from 'react'
import { KeyRound, Plus, ShieldCheck, Users } from 'lucide-react'

import { AppContext } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const permissionGroups = [
  {
    title: 'User Administration',
    permissions: ['users.create', 'users.read', 'users.manage', 'roles.manage', 'permissions.manage'],
  },
  {
    title: 'HR & Leave',
    permissions: ['employees.read', 'leave.create', 'leave.read', 'leave.approve', 'training.manage'],
  },
  {
    title: 'Support & Documents',
    permissions: ['tickets.create', 'tickets.read', 'tickets.assign', 'tickets.manage', 'documents.read', 'documents.manage'],
  },
  {
    title: 'Business Operations',
    permissions: ['payroll.manage', 'reports.read', 'dashboard.read', 'audit.read', 'settings.manage'],
  },
  {
    title: 'Self Service',
    permissions: ['profile.read', 'profile.update', 'feedback.submit', 'tools.read'],
  },
] as const

interface RoleManagementProps {
  embedded?: boolean
}

export default function RoleManagement({ embedded = false }: RoleManagementProps) {
  const { roles, addRole } = useContext(AppContext)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    permissions: [] as string[],
  })

  const allPermissions = useMemo(
    () => permissionGroups.flatMap(group => group.permissions),
    [],
  )

  const togglePermission = (permission: string) => {
    setFormData(current => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter(item => item !== permission)
        : [...current.permissions, permission],
    }))
  }

  const handleCreateRole = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      return
    }

    const normalizedCode = (formData.code.trim() || formData.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    addRole({
      name: formData.name.trim(),
      description: formData.description.trim(),
      code: normalizedCode,
      permissions: formData.permissions,
    })

    setFormData({
      name: '',
      description: '',
      code: '',
      permissions: [],
    })
    setShowCreateRole(false)
  }

  return (
    <div className="space-y-6">
      <div className={embedded ? 'space-y-2' : 'flex flex-col gap-3 md:flex-row md:items-end md:justify-between'}>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
          <p className="mt-1 text-slate-600">
            Configure role details, role codes, and permission bundles for every user profile.
          </p>
        </div>
        <Button className="gap-2 self-start" onClick={() => setShowCreateRole(current => !current)}>
          <Plus size={18} />
          {showCreateRole ? 'Close Form' : 'Create Role'}
        </Button>
      </div>

      {showCreateRole && (
        <Card className="border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create Role</h2>
              <p className="text-sm text-slate-500">
                Define role details first, then select as many permissions as needed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={formData.name}
                onChange={event => setFormData(current => ({ ...current, name: event.target.value }))}
                placeholder="HR Supervisor"
              />
            </div>
            <div>
              <Label htmlFor="role-code">Role Code</Label>
              <Input
                id="role-code"
                value={formData.code}
                onChange={event => setFormData(current => ({ ...current, code: event.target.value }))}
                placeholder="hr_supervisor"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              value={formData.description}
              onChange={event => setFormData(current => ({ ...current, description: event.target.value }))}
              placeholder="Manages HR operations, onboarding, employee files, and leave approvals."
              className="min-h-28"
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Permissions</h3>
                <p className="text-sm text-slate-500">Select the permissions granted by this role.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(current => ({ ...current, permissions: allPermissions }))}
              >
                Select All
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {permissionGroups.map(group => (
                <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="font-semibold text-slate-900">{group.title}</h4>
                  <div className="mt-3 space-y-3">
                    {group.permissions.map(permission => (
                      <label key={permission} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                        <Checkbox
                          checked={formData.permissions.includes(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                        />
                        <span>{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleCreateRole}>Save Role</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateRole(false)
                setFormData({ name: '', description: '', code: '', permissions: [] })
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {roles.map(role => (
          <Card key={role.id} className="border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{role.name}</h2>
                  {role.system && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      System
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{role.description}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <KeyRound size={20} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Role Code</p>
                <p className="mt-1 font-semibold text-slate-900">{role.code}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Permissions</p>
                <p className="mt-1 font-semibold text-slate-900">{role.permissions.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Assigned Users</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                  <Users size={16} className="text-slate-400" />
                  {role.memberCount}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {role.permissions.map(permission => (
                <span key={permission} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {permission}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
