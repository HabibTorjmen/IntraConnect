'use client'

import { useContext, useState } from 'react'
import { Bell, Briefcase, Database, Mail, Settings, Shield, Users } from 'lucide-react'

import { AppContext } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import AuditLogsModule from '@/components/modules/audit-logs'

const settingsCategories = [
  { id: 'general', name: 'General Settings', icon: Settings },
  { id: 'roles', name: 'Roles & Permissions', icon: Shield },
  { id: 'tools', name: 'Tools Directory', icon: Briefcase },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'audit', name: 'Audit Logs', icon: Database },
  { id: 'directory', name: 'Workforce Snapshot', icon: Users },
  { id: 'email', name: 'Support Settings', icon: Mail },
] as const

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<(typeof settingsCategories)[number]['id']>('general')
  const {
    roles,
    addRole,
    updateRole,
    tools,
    addTool,
    updateTool,
    notifications,
    settings,
    updateSettings,
    employees,
  } = useContext(AppContext)

  return (
    <div className="flex flex-col h-full bg-slate-50 -m-6 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Console</h2>
        <p className="text-slate-500 mt-1">Governance, configuration, RBAC, and audit monitoring in one place.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        <div className="w-full md:w-72 shrink-0 space-y-1">
          {settingsCategories.map(category => {
            const Icon = category.icon
            const isActive = activeTab === category.id

            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-100' : 'text-slate-400'} />
                {category.name}
              </button>
            )
          })}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 overflow-auto">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800">General Settings</h3>
                <p className="text-sm text-slate-500 mt-1">These settings are stored locally for demo testing.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={settings.companyName}
                  onChange={event => updateSettings({ companyName: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={settings.supportEmail}
                  onChange={event => updateSettings({ supportEmail: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Timezone</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={settings.timezone}
                  onChange={event => updateSettings({ timezone: event.target.value })}
                >
                  <option value="Africa/Tunis">Africa/Tunis</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Roles & Permissions</h3>
                  <p className="text-sm text-slate-500 mt-1">Frontend-only RBAC catalog aligned with the sprint scope.</p>
                </div>
                <Button
                  onClick={() => addRole({
                    name: 'Custom Role',
                    description: 'Editable business role',
                    permissions: ['tickets.read', 'documents.read'],
                  })}
                >
                  Add Role
                </Button>
              </div>

              {roles.map(role => (
                <div key={role.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{role.name}</h4>
                      <p className="text-sm text-slate-500">{role.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => updateRole(role.id, { memberCount: role.memberCount + 1 })}
                    >
                      Simulate Member
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map(permission => (
                      <span key={permission} className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                        {permission}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{role.memberCount} mapped users</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Tools Directory Management</h3>
                  <p className="text-sm text-slate-500 mt-1">Create and toggle internal apps without the backend.</p>
                </div>
                <Button
                  onClick={() => addTool({
                    name: 'HR Knowledge Base',
                    description: 'Policies, checklists and forms',
                    category: 'HR',
                    url: 'https://example.com',
                    visibility: ['employee', 'manager', 'admin'],
                    active: true,
                  })}
                >
                  Add Tool
                </Button>
              </div>
              {tools.map(tool => (
                <div key={tool.id} className="flex items-center justify-between gap-4 border border-slate-200 rounded-lg p-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{tool.name}</h4>
                    <p className="text-sm text-slate-500">{tool.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => updateTool(tool.id, { active: !tool.active })}
                  >
                    {tool.active ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Notification Activity</h3>
                <p className="text-sm text-slate-500 mt-1">Recent in-app notifications generated by demo workflows.</p>
              </div>
              {notifications.map(notification => (
                <div key={notification.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{notification.title}</h4>
                      <p className="text-sm text-slate-500">{notification.message}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${notification.isRead ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Workforce Snapshot</h3>
                <p className="text-sm text-slate-500 mt-1">Quick view of departments and headcount for sprint demo reviews.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-slate-500">Employees</p>
                  <p className="text-3xl font-bold text-slate-900">{employees.length}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-slate-500">Departments</p>
                  <p className="text-3xl font-bold text-slate-900">{new Set(employees.map(employee => employee.department)).size}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-slate-500">Active Users</p>
                  <p className="text-3xl font-bold text-slate-900">{employees.filter(employee => employee.status === 'active').length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Support & Email Settings</h3>
                <p className="text-sm text-slate-500 mt-1">Simple test configuration for demos and screenshots.</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-slate-500">Primary support mailbox</p>
                <p className="font-bold text-slate-800 mt-1">{settings.supportEmail}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-slate-500">Notification digest</p>
                <p className="font-bold text-slate-800 mt-1">Daily summary enabled for admins</p>
              </div>
            </div>
          )}

          {activeTab === 'audit' && <AuditLogsModule />}
        </div>
      </div>
    </div>
  )
}
