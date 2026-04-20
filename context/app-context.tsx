'use client'

import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import {
  MOCK_AUDIT_LOGS,
  MOCK_DOCUMENTS,
  MOCK_EMPLOYEES,
  MOCK_FEEDBACK,
  MOCK_LEAVES,
  MOCK_PAYROLL,
  MOCK_SURVEYS,
  MOCK_TICKETS,
  MOCK_TRAINING,
} from '@/lib/mock-data'
import { DEMO_APP_STATE_KEY, DEMO_AUTH_STATE_KEY, createId } from '@/lib/demo-storage'

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  joinDate: string
  status: 'active' | 'inactive'
  managerId?: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  startDate: string
  endDate: string
  type: 'annual' | 'sick' | 'personal'
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface TicketCategory {
  id: string
  name: string
  description?: string
}

export interface TicketComment {
  id: string
  content: string
  createdAt: string
  authorId: string
  authorName: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  categoryId?: string
  categoryName?: string
  employeeId: string
  employeeName?: string
  assignedToId?: string
  assignedToName?: string
  createdAt: string
  slaDeadline?: string
  slaStatus?: 'ON_TRACK' | 'NEAR_BREACH' | 'BREACHED'
  location?: string
  comments?: TicketComment[]
}

export interface TrainingPlan {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  employeeId: string
  employeeName?: string
}

export interface Payroll {
  id: string
  employeeId: string
  employeeName?: string
  status: 'draft' | 'processed' | 'paid'
  periodStart: string
  periodEnd: string
  netAmount: number
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
}

export interface Document {
  id: string
  title: string
  fileName: string
  fileType: string
  fileSize: number
  filePath: string
  version: number
  isLatest: boolean
  parentId?: string
  description?: string
  category?: string
  isPublic: boolean
  uploadedById: string
  uploadedByName?: string
  createdAt: string
  updatedAt: string
}

export interface DocumentAccessLog {
  id: string
  documentId: string
  userId: string
  action: 'VIEW' | 'DOWNLOAD' | 'UPDATE' | 'DELETE'
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface Survey {
  id: string
  title: string
  description?: string
  questions: any[]
  isActive: boolean
  createdAt: string
}

export interface SurveyResponse {
  id: string
  surveyId: string
  userId?: string
  answers: any
  createdAt: string
}

export interface PerformanceFeedback {
  id: string
  content: string
  rating?: number
  employeeId: string
  employeeName?: string
  authorId: string
  authorName?: string
  createdAt: string
}

export interface AuditLog {
  id: string
  action: string
  module?: string
  details?: string
  userId: string
  userName?: string
  createdAt: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
  createdAt: string
  isRead: boolean
  userId?: string
}

export interface ToolRecord {
  id: string
  name: string
  description: string
  category: string
  url: string
  visibility: Array<'employee' | 'manager' | 'admin'>
  active: boolean
}

export interface RoleRecord {
  id: string
  name: string
  description: string
  permissions: string[]
  memberCount: number
  system: boolean
}

export interface OnboardingTask {
  id: string
  label: string
  done: boolean
}

export interface OnboardingPlan {
  id: string
  employeeId: string
  progress: number
  mentor: string
  startDate: string
  tasks: OnboardingTask[]
}

export interface AppSettings {
  companyName: string
  supportEmail: string
  timezone: string
}

interface AppState {
  employees: Employee[]
  leaveRequests: LeaveRequest[]
  tickets: Ticket[]
  ticketCategories: TicketCategory[]
  trainingPlans: TrainingPlan[]
  payrolls: Payroll[]
  documents: Document[]
  documentLogs: DocumentAccessLog[]
  surveys: Survey[]
  performanceFeedback: PerformanceFeedback[]
  auditLogs: AuditLog[]
  notifications: NotificationItem[]
  tools: ToolRecord[]
  roles: RoleRecord[]
  onboardingPlans: OnboardingPlan[]
  settings: AppSettings
}

interface AppContextType extends AppState {
  isLoading: boolean
  error: string | null
  addEmployee: (employee: Partial<Employee>) => Promise<void>
  addBulkEmployees: (employees: Partial<Employee>[]) => Promise<void>
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  submitLeaveRequest: (request: Partial<LeaveRequest>) => Promise<void>
  updateLeaveRequest: (id: string, status: 'approved' | 'rejected') => Promise<void>
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[]
  createTicket: (ticket: Partial<Ticket>) => Promise<void>
  updateTicket: (id: string, data: Partial<Ticket>) => Promise<void>
  addTicketComment: (ticketId: string, content: string) => Promise<void>
  assignTicket: (id: string, employeeId: string) => Promise<void>
  createTrainingPlan: (plan: Partial<TrainingPlan>) => Promise<void>
  generatePayroll: (data: Partial<Payroll>) => Promise<void>
  uploadDocument: (formData: FormData) => Promise<void>
  uploadNewVersion: (documentId: string, formData: FormData) => Promise<void>
  downloadDocument: (id: string, fileName: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  submitSurveyResponse: (surveyId: string, answers: any) => Promise<void>
  createPerformanceFeedback: (data: Partial<PerformanceFeedback>) => Promise<void>
  fetchAuditLogs: () => Promise<void>
  refreshData: () => Promise<void>
  advancedSearch: (query: string, departmentId?: string, status?: string) => Promise<void>
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addTool: (tool: Partial<ToolRecord>) => void
  updateTool: (id: string, tool: Partial<ToolRecord>) => void
  addRole: (role: Partial<RoleRecord>) => void
  updateRole: (id: string, role: Partial<RoleRecord>) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleOnboardingTask: (planId: string, taskId: string) => void
  isDemoMode: boolean
}

const defaultTicketCategories: TicketCategory[] = [
  { id: '1', name: 'IT Support', description: 'Accounts, access, devices' },
  { id: '2', name: 'Facility', description: 'Building, space, maintenance' },
  { id: '3', name: 'HR', description: 'Policies, contracts, payroll requests' },
]

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Leave approved',
    message: 'Your annual leave request has been approved.',
    type: 'success',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    userId: 'user-employee',
  },
  {
    id: 'notif-2',
    title: 'New document published',
    message: 'The updated employee handbook is now available in the library.',
    type: 'info',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
]

const defaultTools: ToolRecord[] = [
  {
    id: 'tool-1',
    name: 'Google Workspace',
    description: 'Email, Meet, Drive and shared docs',
    category: 'Communication',
    url: 'https://workspace.google.com/',
    visibility: ['employee', 'manager', 'admin'],
    active: true,
  },
  {
    id: 'tool-2',
    name: 'Jira Software',
    description: 'Project planning and sprint execution',
    category: 'Project Management',
    url: 'https://www.atlassian.com/software/jira',
    visibility: ['manager', 'admin'],
    active: true,
  },
  {
    id: 'tool-3',
    name: 'Confluence',
    description: 'Knowledge base and procedures',
    category: 'Documentation',
    url: 'https://www.atlassian.com/software/confluence',
    visibility: ['employee', 'manager', 'admin'],
    active: true,
  },
  {
    id: 'tool-4',
    name: 'Expensify',
    description: 'Expense claims and reimbursement requests',
    category: 'Finance',
    url: 'https://www.expensify.com/',
    visibility: ['employee', 'manager', 'admin'],
    active: true,
  },
]

const defaultRoles: RoleRecord[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Platform governance and unrestricted access',
    permissions: ['users.manage', 'documents.manage', 'payroll.manage', 'settings.manage'],
    memberCount: 1,
    system: true,
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Team approvals, help desk and dashboard oversight',
    permissions: ['employees.read', 'leave.approve', 'tickets.manage', 'dashboard.read'],
    memberCount: 2,
    system: true,
  },
  {
    id: 'role-employee',
    name: 'Employee',
    description: 'Self-service requests and personal document access',
    permissions: ['leave.create', 'tickets.create', 'documents.read', 'profile.read'],
    memberCount: 9,
    system: true,
  },
]

function createDefaultOnboardingPlans(employees: Employee[]): OnboardingPlan[] {
  return employees.slice(0, 5).map((employee, index) => ({
    id: `onboard-${employee.id}`,
    employeeId: employee.id,
    mentor: index % 2 === 0 ? 'Akram Trimech' : 'Nada Ben Romdhane',
    startDate: employee.joinDate,
    progress: index === 0 ? 80 : index === 1 ? 60 : 40,
    tasks: [
      { id: `${employee.id}-task-1`, label: 'Sign employment contract', done: true },
      { id: `${employee.id}-task-2`, label: 'Upload identity documents', done: true },
      { id: `${employee.id}-task-3`, label: 'Setup email and collaboration tools', done: index < 2 },
      { id: `${employee.id}-task-4`, label: 'Attend first-day orientation', done: index === 0 },
      { id: `${employee.id}-task-5`, label: 'Complete compliance training', done: false },
    ],
  }))
}

function buildDefaultState(): AppState {
  const employees = [...MOCK_EMPLOYEES]
  const payrolls = MOCK_PAYROLL.map((item, index) => {
    const periodStart = item.periodStart || '2026-03-01'
    const periodEnd = item.periodEnd || '2026-03-31'
    const startDate = new Date(periodStart)
    const basicSalary = Math.round(item.netAmount * 1.12)
    const allowances = Math.round(item.netAmount * 0.08)
    const deductions = Math.max(basicSalary + allowances - item.netAmount, 0)

    return {
      ...item,
      id: item.id || `pay-${index + 1}`,
      status: item.status || 'paid',
      month: startDate.getMonth() + 1,
      year: startDate.getFullYear(),
      basicSalary,
      allowances,
      deductions,
      netSalary: item.netAmount,
      netAmount: item.netAmount,
      periodStart,
      periodEnd,
    }
  })

  return {
    employees,
    leaveRequests: [...MOCK_LEAVES],
    tickets: [...MOCK_TICKETS],
    ticketCategories: defaultTicketCategories,
    trainingPlans: [...MOCK_TRAINING],
    payrolls,
    documents: [...MOCK_DOCUMENTS],
    documentLogs: [],
    surveys: [...MOCK_SURVEYS],
    performanceFeedback: [...MOCK_FEEDBACK],
    auditLogs: [...MOCK_AUDIT_LOGS],
    notifications: defaultNotifications,
    tools: defaultTools,
    roles: defaultRoles,
    onboardingPlans: createDefaultOnboardingPlans(employees),
    settings: {
      companyName: 'IntraConnect',
      supportEmail: 'support@intraconnect.local',
      timezone: 'Africa/Tunis',
    },
  }
}

function readAppState(): AppState {
  if (typeof window === 'undefined') return buildDefaultState()

  const stored = window.localStorage.getItem(DEMO_APP_STATE_KEY)
  if (!stored) return buildDefaultState()

  try {
    return {
      ...buildDefaultState(),
      ...JSON.parse(stored),
    }
  } catch {
    return buildDefaultState()
  }
}

function persistAppState(state: AppState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_APP_STATE_KEY, JSON.stringify(state))
}

function getAuthUser() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(DEMO_AUTH_STATE_KEY)
    if (!raw) return null
    return JSON.parse(raw)?.user || null
  } catch {
    return null
  }
}

function getCurrentEmployeeSnapshot(state: AppState) {
  const user = getAuthUser()
  if (!user) return null

  return state.employees.find(employee => employee.id === user.employeeId) || null
}

export const AppContext = createContext<AppContextType>({
  ...buildDefaultState(),
  isLoading: false,
  error: null,
  isDemoMode: true,
  addEmployee: async () => {},
  addBulkEmployees: async () => {},
  updateEmployee: async () => {},
  deleteEmployee: async () => {},
  submitLeaveRequest: async () => {},
  updateLeaveRequest: async () => {},
  getEmployeeLeaves: () => [],
  createTicket: async () => {},
  updateTicket: async () => {},
  addTicketComment: async () => {},
  assignTicket: async () => {},
  createTrainingPlan: async () => {},
  generatePayroll: async () => {},
  uploadDocument: async () => {},
  uploadNewVersion: async () => {},
  downloadDocument: async () => {},
  deleteDocument: async () => {},
  submitSurveyResponse: async () => {},
  createPerformanceFeedback: async () => {},
  fetchAuditLogs: async () => {},
  refreshData: async () => {},
  advancedSearch: async () => {},
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  addTool: () => {},
  updateTool: () => {},
  addRole: () => {},
  updateRole: () => {},
  updateSettings: () => {},
  toggleOnboardingTask: () => {},
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(buildDefaultState())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employeeDirectory, setEmployeeDirectory] = useState<Employee[]>([])

  useEffect(() => {
    const initialState = readAppState()
    setState(initialState)
    setEmployeeDirectory(initialState.employees)
    setIsLoading(false)
  }, [])

  const commit = useCallback((updater: (previous: AppState) => AppState) => {
    setState(previous => {
      const next = updater(previous)
      persistAppState(next)
      return next
    })
  }, [])

  const appendAudit = useCallback((draft: AppState, action: string, module: string, details: string) => {
    const user = getAuthUser()

    draft.auditLogs = [
      {
        id: createId('audit'),
        action,
        module,
        details,
        userId: user?.id || 'system',
        userName: user?.name || 'System',
        createdAt: new Date().toISOString(),
      },
      ...draft.auditLogs,
    ]
  }, [])

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    const next = readAppState()
    setState(next)
    setEmployeeDirectory(next.employees)
    setIsLoading(false)
  }, [])

  const advancedSearch = useCallback(async (query: string, departmentId?: string, status?: string) => {
    setIsLoading(true)
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = state.employees.filter(employee => {
      const matchesQuery =
        !normalizedQuery ||
        employee.name.toLowerCase().includes(normalizedQuery) ||
        employee.email.toLowerCase().includes(normalizedQuery) ||
        employee.phone.toLowerCase().includes(normalizedQuery)

      const matchesDepartment = !departmentId || employee.department === departmentId
      const matchesStatus = !status || employee.status === status.toLowerCase()

      return matchesQuery && matchesDepartment && matchesStatus
    })

    setEmployeeDirectory(filtered)
    setIsLoading(false)
  }, [state.employees])

  const addEmployee = useCallback(async (employee: Partial<Employee>) => {
    commit(previous => {
      const next = structuredClone(previous)
      const newEmployee: Employee = {
        id: createId('emp'),
        name: employee.name || 'New Employee',
        email: employee.email || `employee-${next.employees.length + 1}@intraconnect.com`,
        phone: employee.phone || '+216 00 000 000',
        department: employee.department || 'General',
        position: employee.position || 'Staff',
        joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
        status: employee.status || 'active',
        managerId: employee.managerId,
      }

      next.employees = [newEmployee, ...next.employees]
      appendAudit(next, 'CREATE_EMPLOYEE', 'EMPLOYEES', `Created employee ${newEmployee.name}`)
      return next
    })
  }, [appendAudit, commit])

  const addBulkEmployees = useCallback(async (employees: Partial<Employee>[]) => {
    commit(previous => {
      const next = structuredClone(previous)
      const created = employees.map(employee => ({
        id: createId('emp'),
        name: employee.name || employee['fullName' as keyof Employee] as string || 'Imported Employee',
        email: employee.email || `${createId('user')}@intraconnect.com`,
        phone: employee.phone || '+216 00 000 000',
        department: employee.department || 'General',
        position: employee.position || 'Staff',
        joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
        status: employee.status || 'active',
        managerId: employee.managerId,
      }))

      next.employees = [...created, ...next.employees]
      appendAudit(next, 'BULK_IMPORT_EMPLOYEE', 'EMPLOYEES', `Imported ${created.length} employees`)
      return next
    })
  }, [appendAudit, commit])

  const updateEmployee = useCallback(async (id: string, employee: Partial<Employee>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.employees = next.employees.map(item => item.id === id ? { ...item, ...employee } : item)
      appendAudit(next, 'UPDATE_EMPLOYEE', 'EMPLOYEES', `Updated employee ${id}`)
      return next
    })
  }, [appendAudit, commit])

  const deleteEmployee = useCallback(async (id: string) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.employees = next.employees.filter(item => item.id !== id)
      appendAudit(next, 'DELETE_EMPLOYEE', 'EMPLOYEES', `Removed employee ${id}`)
      return next
    })
  }, [appendAudit, commit])

  const submitLeaveRequest = useCallback(async (request: Partial<LeaveRequest>) => {
    commit(previous => {
      const next = structuredClone(previous)
      const employee = next.employees.find(item => item.id === request.employeeId)
      const leave: LeaveRequest = {
        id: createId('leave'),
        employeeId: request.employeeId || employee?.id || 'unknown',
        employeeName: request.employeeName || employee?.name || 'Current User',
        startDate: request.startDate || new Date().toISOString().split('T')[0],
        endDate: request.endDate || new Date().toISOString().split('T')[0],
        type: request.type || 'annual',
        reason: request.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      next.leaveRequests = [leave, ...next.leaveRequests]
      next.notifications = [
        {
          id: createId('notif'),
          title: 'Leave submitted',
          message: `${leave.employeeName} submitted a ${leave.type} leave request.`,
          type: 'info',
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        ...next.notifications,
      ]
      appendAudit(next, 'CREATE_LEAVE', 'LEAVES', `Created leave request ${leave.id}`)
      return next
    })
  }, [appendAudit, commit])

  const updateLeaveRequest = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    commit(previous => {
      const next = structuredClone(previous)
      const target = next.leaveRequests.find(item => item.id === id)
      next.leaveRequests = next.leaveRequests.map(item => item.id === id ? { ...item, status } : item)

      if (target) {
        next.notifications = [
          {
            id: createId('notif'),
            title: `Leave ${status}`,
            message: `${target.employeeName}'s request has been ${status}.`,
            type: status === 'approved' ? 'success' : 'warning',
            createdAt: new Date().toISOString(),
            isRead: false,
          },
          ...next.notifications,
        ]
      }

      appendAudit(next, 'UPDATE_LEAVE', 'LEAVES', `Marked leave ${id} as ${status}`)
      return next
    })
  }, [appendAudit, commit])

  const getEmployeeLeaves = useCallback((employeeId: string) => {
    return state.leaveRequests.filter(request => request.employeeId === employeeId)
  }, [state.leaveRequests])

  const createTicket = useCallback(async (ticket: Partial<Ticket>) => {
    commit(previous => {
      const next = structuredClone(previous)
      const employee = next.employees.find(item => item.id === ticket.employeeId) || getCurrentEmployeeSnapshot(next)
      const category = next.ticketCategories.find(item => item.id === ticket.categoryId)
      const createdAt = new Date().toISOString()
      const slaDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const newTicket: Ticket = {
        id: createId('ticket'),
        title: ticket.title || 'Untitled request',
        description: ticket.description || '',
        priority: ticket.priority || 'medium',
        status: 'open',
        categoryId: ticket.categoryId,
        categoryName: category?.name || 'General',
        employeeId: ticket.employeeId || employee?.id || 'unknown',
        employeeName: ticket.employeeName || employee?.name || 'Current User',
        assignedToId: ticket.assignedToId,
        assignedToName: ticket.assignedToName,
        createdAt,
        slaDeadline,
        slaStatus: ticket.priority === 'urgent' ? 'NEAR_BREACH' : 'ON_TRACK',
        location: ticket.location,
        comments: [],
      }

      next.tickets = [newTicket, ...next.tickets]
      next.notifications = [
        {
          id: createId('notif'),
          title: 'New support request',
          message: `${newTicket.title} has been created in ${newTicket.categoryName}.`,
          type: 'info',
          createdAt,
          isRead: false,
        },
        ...next.notifications,
      ]
      appendAudit(next, 'CREATE_TICKET', 'TICKETS', `Created ticket ${newTicket.id}`)
      return next
    })
  }, [appendAudit, commit])

  const updateTicket = useCallback(async (id: string, data: Partial<Ticket>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.tickets = next.tickets.map(ticket => {
        if (ticket.id !== id) return ticket

        const nextStatus = data.status || ticket.status
        const nextSlaStatus =
          nextStatus === 'resolved' || nextStatus === 'closed'
            ? 'ON_TRACK'
            : data.slaStatus || ticket.slaStatus

        return {
          ...ticket,
          ...data,
          status: nextStatus,
          slaStatus: nextSlaStatus,
        }
      })
      appendAudit(next, 'UPDATE_TICKET', 'TICKETS', `Updated ticket ${id}`)
      return next
    })
  }, [appendAudit, commit])

  const addTicketComment = useCallback(async (ticketId: string, content: string) => {
    commit(previous => {
      const next = structuredClone(previous)
      const user = getAuthUser()
      next.tickets = next.tickets.map(ticket => ticket.id === ticketId
        ? {
            ...ticket,
            comments: [
              ...(ticket.comments || []),
              {
                id: createId('comment'),
                content,
                createdAt: new Date().toISOString(),
                authorId: user?.id || 'system',
                authorName: user?.name || 'System',
              },
            ],
          }
        : ticket)

      appendAudit(next, 'COMMENT_TICKET', 'TICKETS', `Added comment to ticket ${ticketId}`)
      return next
    })
  }, [appendAudit, commit])

  const assignTicket = useCallback(async (id: string, employeeId: string) => {
    commit(previous => {
      const next = structuredClone(previous)
      const assignee = next.employees.find(item => item.id === employeeId)
      next.tickets = next.tickets.map(ticket => ticket.id === id
        ? {
            ...ticket,
            assignedToId: employeeId || undefined,
            assignedToName: assignee?.name,
          }
        : ticket)
      appendAudit(next, 'ASSIGN_TICKET', 'TICKETS', `Assigned ticket ${id} to ${assignee?.name || 'nobody'}`)
      return next
    })
  }, [appendAudit, commit])

  const createTrainingPlan = useCallback(async (plan: Partial<TrainingPlan>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.trainingPlans = [
        {
          id: createId('training'),
          title: plan.title || 'New training plan',
          description: plan.description,
          startDate: plan.startDate || new Date().toISOString().split('T')[0],
          endDate: plan.endDate,
          status: plan.status || 'planned',
          employeeId: plan.employeeId || getCurrentEmployeeSnapshot(next)?.id || 'unknown',
          employeeName: plan.employeeName,
        },
        ...next.trainingPlans,
      ]
      appendAudit(next, 'CREATE_TRAINING', 'TRAINING', `Created training plan ${plan.title || 'untitled'}`)
      return next
    })
  }, [appendAudit, commit])

  const generatePayroll = useCallback(async (data: Partial<Payroll>) => {
    commit(previous => {
      const next = structuredClone(previous)
      const month = data.month || new Date().getMonth() + 1
      const year = data.year || new Date().getFullYear()
      const basicSalary = data.basicSalary || 3200
      const allowances = data.allowances || 300
      const deductions = data.deductions || 150
      const netSalary = data.netSalary || basicSalary + allowances - deductions

      next.payrolls = [
        {
          id: createId('pay'),
          employeeId: data.employeeId || getCurrentEmployeeSnapshot(next)?.id || 'unknown',
          employeeName: data.employeeName || getCurrentEmployeeSnapshot(next)?.name,
          status: data.status || 'paid',
          periodStart: data.periodStart || `${year}-${String(month).padStart(2, '0')}-01`,
          periodEnd: data.periodEnd || `${year}-${String(month).padStart(2, '0')}-28`,
          netAmount: netSalary,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          netSalary,
        },
        ...next.payrolls,
      ]
      appendAudit(next, 'CREATE_PAYROLL', 'PAYROLL', `Generated payroll for ${month}/${year}`)
      return next
    })
  }, [appendAudit, commit])

  const uploadDocument = useCallback(async (formData: FormData) => {
    commit(previous => {
      const next = structuredClone(previous)
      const file = formData.get('file') as File | null
      const user = getAuthUser()
      const newDocument: Document = {
        id: createId('doc'),
        title: (formData.get('title') as string) || file?.name || 'Untitled Document',
        fileName: file?.name || 'document.txt',
        fileType: file?.type || 'text/plain',
        fileSize: file?.size || 1024,
        filePath: '',
        version: 1,
        isLatest: true,
        description: (formData.get('description') as string) || '',
        category: (formData.get('category') as string) || 'General',
        isPublic: formData.get('isPublic') === 'true',
        uploadedById: user?.id || 'system',
        uploadedByName: user?.name || 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      next.documents = [newDocument, ...next.documents]
      next.documentLogs = [
        {
          id: createId('doclog'),
          documentId: newDocument.id,
          userId: user?.id || 'system',
          action: 'UPDATE',
          createdAt: new Date().toISOString(),
        },
        ...next.documentLogs,
      ]
      appendAudit(next, 'UPLOAD_DOCUMENT', 'DOCUMENTS', `Uploaded document ${newDocument.title}`)
      return next
    })
  }, [appendAudit, commit])

  const uploadNewVersion = useCallback(async (documentId: string, formData: FormData) => {
    commit(previous => {
      const next = structuredClone(previous)
      const file = formData.get('file') as File | null
      next.documents = next.documents.map(document => {
        if (document.id !== documentId) return document

        return {
          ...document,
          version: document.version + 1,
          fileName: file?.name || document.fileName,
          fileType: file?.type || document.fileType,
          fileSize: file?.size || document.fileSize,
          updatedAt: new Date().toISOString(),
        }
      })
      appendAudit(next, 'VERSION_DOCUMENT', 'DOCUMENTS', `Uploaded new version for ${documentId}`)
      return next
    })
  }, [appendAudit, commit])

  const downloadDocument = useCallback(async (id: string, fileName: string) => {
    const selectedDocument = state.documents.find(item => item.id === id)
    const user = getAuthUser()

    commit(previous => {
      const next = structuredClone(previous)
      next.documentLogs = [
        {
          id: createId('doclog'),
          documentId: id,
          userId: user?.id || 'system',
          action: 'DOWNLOAD',
          createdAt: new Date().toISOString(),
        },
        ...next.documentLogs,
      ]
      appendAudit(next, 'DOWNLOAD_DOCUMENT', 'DOCUMENTS', `Downloaded ${fileName}`)
      return next
    })

    if (typeof window !== 'undefined' && selectedDocument) {
      const blob = new Blob(
        [
          `Document: ${selectedDocument.title}\n`,
          `Category: ${selectedDocument.category}\n`,
          `Version: ${selectedDocument.version}\n`,
          `This is a demo download generated in the frontend-only environment.\n`,
        ],
        { type: 'text/plain' },
      )
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = fileName.replace(/\.[^.]+$/, '') + '.txt'
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }
  }, [appendAudit, commit, state.documents])

  const deleteDocument = useCallback(async (id: string) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.documents = next.documents.filter(document => document.id !== id)
      appendAudit(next, 'DELETE_DOCUMENT', 'DOCUMENTS', `Deleted document ${id}`)
      return next
    })
  }, [appendAudit, commit])

  const submitSurveyResponse = useCallback(async (surveyId: string, answers: any) => {
    commit(previous => {
      const next = structuredClone(previous)
      appendAudit(next, 'SUBMIT_SURVEY', 'FEEDBACK', `Submitted survey ${surveyId} with ${Object.keys(answers || {}).length} answers`)
      return next
    })
  }, [appendAudit, commit])

  const createPerformanceFeedback = useCallback(async (data: Partial<PerformanceFeedback>) => {
    commit(previous => {
      const next = structuredClone(previous)
      const author = getCurrentEmployeeSnapshot(next)
      const recipient = next.employees.find(employee => employee.id === data.employeeId)
      next.performanceFeedback = [
        {
          id: createId('feedback'),
          content: data.content || '',
          rating: data.rating,
          employeeId: data.employeeId || 'unknown',
          employeeName: recipient?.name,
          authorId: author?.id || 'unknown',
          authorName: author?.name || 'Current User',
          createdAt: new Date().toISOString(),
        },
        ...next.performanceFeedback,
      ]
      appendAudit(next, 'CREATE_FEEDBACK', 'FEEDBACK', `Created feedback for ${recipient?.name || data.employeeId}`)
      return next
    })
  }, [appendAudit, commit])

  const fetchAuditLogs = useCallback(async () => {
    setState(previous => ({ ...previous }))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.notifications = next.notifications.map(notification => notification.id === id ? { ...notification, isRead: true } : notification)
      return next
    })
  }, [commit])

  const markAllNotificationsRead = useCallback(() => {
    commit(previous => {
      const next = structuredClone(previous)
      next.notifications = next.notifications.map(notification => ({ ...notification, isRead: true }))
      return next
    })
  }, [commit])

  const addTool = useCallback((tool: Partial<ToolRecord>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.tools = [
        {
          id: createId('tool'),
          name: tool.name || 'New Tool',
          description: tool.description || 'Internal application',
          category: tool.category || 'General',
          url: tool.url || 'https://example.com',
          visibility: tool.visibility || ['employee', 'manager', 'admin'],
          active: tool.active ?? true,
        },
        ...next.tools,
      ]
      appendAudit(next, 'CREATE_TOOL', 'TOOLS', `Created tool ${tool.name || 'New Tool'}`)
      return next
    })
  }, [appendAudit, commit])

  const updateTool = useCallback((id: string, tool: Partial<ToolRecord>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.tools = next.tools.map(item => item.id === id ? { ...item, ...tool } : item)
      appendAudit(next, 'UPDATE_TOOL', 'TOOLS', `Updated tool ${id}`)
      return next
    })
  }, [appendAudit, commit])

  const addRole = useCallback((role: Partial<RoleRecord>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.roles = [
        {
          id: createId('role'),
          name: role.name || 'Custom Role',
          description: role.description || 'User-defined permission set',
          permissions: role.permissions || [],
          memberCount: role.memberCount || 0,
          system: false,
        },
        ...next.roles,
      ]
      appendAudit(next, 'CREATE_ROLE', 'RBAC', `Created role ${role.name || 'Custom Role'}`)
      return next
    })
  }, [appendAudit, commit])

  const updateRole = useCallback((id: string, role: Partial<RoleRecord>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.roles = next.roles.map(item => item.id === id ? { ...item, ...role } : item)
      appendAudit(next, 'UPDATE_ROLE', 'RBAC', `Updated role ${id}`)
      return next
    })
  }, [appendAudit, commit])

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.settings = { ...next.settings, ...settings }
      appendAudit(next, 'UPDATE_SETTINGS', 'SYSTEM', 'Updated general settings')
      return next
    })
  }, [appendAudit, commit])

  const toggleOnboardingTask = useCallback((planId: string, taskId: string) => {
    commit(previous => {
      const next = structuredClone(previous)
      next.onboardingPlans = next.onboardingPlans.map(plan => {
        if (plan.id !== planId) return plan

        const tasks = plan.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task)
        const progress = Math.round((tasks.filter(task => task.done).length / tasks.length) * 100)
        return { ...plan, tasks, progress }
      })
      appendAudit(next, 'UPDATE_ONBOARDING', 'ONBOARDING', `Updated onboarding plan ${planId}`)
      return next
    })
  }, [appendAudit, commit])

  useEffect(() => {
    setEmployeeDirectory(state.employees)
  }, [state.employees])

  const value = useMemo(() => ({
    ...state,
    employees: employeeDirectory,
    isLoading,
    error,
    addEmployee,
    addBulkEmployees,
    updateEmployee,
    deleteEmployee,
    submitLeaveRequest,
    updateLeaveRequest,
    getEmployeeLeaves,
    createTicket,
    updateTicket,
    addTicketComment,
    assignTicket,
    createTrainingPlan,
    generatePayroll,
    uploadDocument,
    uploadNewVersion,
    downloadDocument,
    deleteDocument,
    submitSurveyResponse,
    createPerformanceFeedback,
    fetchAuditLogs,
    refreshData,
    advancedSearch,
    markNotificationRead,
    markAllNotificationsRead,
    addTool,
    updateTool,
    addRole,
    updateRole,
    updateSettings,
    toggleOnboardingTask,
    isDemoMode: true,
  }), [
    state,
    employeeDirectory,
    isLoading,
    error,
    addEmployee,
    addBulkEmployees,
    updateEmployee,
    deleteEmployee,
    submitLeaveRequest,
    updateLeaveRequest,
    getEmployeeLeaves,
    createTicket,
    updateTicket,
    addTicketComment,
    assignTicket,
    createTrainingPlan,
    generatePayroll,
    uploadDocument,
    uploadNewVersion,
    downloadDocument,
    deleteDocument,
    submitSurveyResponse,
    createPerformanceFeedback,
    fetchAuditLogs,
    refreshData,
    advancedSearch,
    markNotificationRead,
    markAllNotificationsRead,
    addTool,
    updateTool,
    addRole,
    updateRole,
    updateSettings,
    toggleOnboardingTask,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
