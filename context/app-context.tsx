'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'

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

interface AppContextType {
  employees: Employee[]
  leaveRequests: LeaveRequest[]
  addEmployee: (employee: Omit<Employee, 'id'>) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt'>) => void
  updateLeaveRequest: (id: string, status: 'approved' | 'rejected') => void
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[]
}

export const AppContext = createContext<AppContextType>({
  employees: [],
  leaveRequests: [],
  addEmployee: () => {},
  updateEmployee: () => {},
  deleteEmployee: () => {},
  submitLeaveRequest: () => {},
  updateLeaveRequest: () => {},
  getEmployeeLeaves: () => [],
})

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1-555-0101',
    department: 'Engineering',
    position: 'Senior Developer',
    joinDate: '2021-03-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1-555-0102',
    department: 'Marketing',
    position: 'Marketing Manager',
    joinDate: '2022-06-20',
    status: 'active'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    phone: '+1-555-0103',
    department: 'Sales',
    position: 'Sales Executive',
    joinDate: '2020-01-10',
    status: 'active'
  }
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])

  useEffect(() => {
    const storedEmployees = localStorage.getItem('sprint1_employees')
    const storedLeaves = localStorage.getItem('sprint1_leaves')
    if (storedEmployees) setEmployees(JSON.parse(storedEmployees))
    if (storedLeaves) setLeaveRequests(JSON.parse(storedLeaves))
  }, [])

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { ...employee, id: Date.now().toString() }
    const updated = [...employees, newEmployee]
    setEmployees(updated)
    localStorage.setItem('sprint1_employees', JSON.stringify(updated))
  }

  const updateEmployee = (id: string, updatedData: Partial<Employee>) => {
    const updated = employees.map(emp => emp.id === id ? { ...emp, ...updatedData } : emp)
    setEmployees(updated)
    localStorage.setItem('sprint1_employees', JSON.stringify(updated))
  }

  const deleteEmployee = (id: string) => {
    const updated = employees.filter(emp => emp.id !== id)
    setEmployees(updated)
    localStorage.setItem('sprint1_employees', JSON.stringify(updated))
  }

  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'createdAt'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    const updated = [...leaveRequests, newRequest]
    setLeaveRequests(updated)
    localStorage.setItem('sprint1_leaves', JSON.stringify(updated))
  }

  const updateLeaveRequest = (id: string, status: 'approved' | 'rejected') => {
    const updated = leaveRequests.map(req => req.id === id ? { ...req, status } : req)
    setLeaveRequests(updated)
    localStorage.setItem('sprint1_leaves', JSON.stringify(updated))
  }

  const getEmployeeLeaves = (employeeId: string) => {
    return leaveRequests.filter(req => req.employeeId === employeeId)
  }

  return (
    <AppContext.Provider
      value={{
        employees,
        leaveRequests,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        submitLeaveRequest,
        updateLeaveRequest,
        getEmployeeLeaves
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
