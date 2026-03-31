'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'employee' | 'manager' | 'admin'
  department?: string
  position?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isLoading: false,
  error: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('sprint1_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('sprint1_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    
    try {
      // Demo users for testing
      const demoUsers: Record<string, User> = {
        'employee@example.com': {
          id: '1',
          email: 'employee@example.com',
          name: 'John Employee',
          role: 'employee',
          department: 'IT',
          position: 'Developer'
        },
        'manager@example.com': {
          id: '2',
          email: 'manager@example.com',
          name: 'Jane Manager',
          role: 'manager',
          department: 'IT',
          position: 'Team Lead'
        },
        'admin@example.com': {
          id: '3',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          department: 'HR',
          position: 'Administrator'
        }
      }

      const foundUser = demoUsers[email.toLowerCase()]
      if (foundUser && password === 'demo123') {
        setUser(foundUser)
        localStorage.setItem('sprint1_user', JSON.stringify(foundUser))
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        name,
        role: 'employee',
        department: 'General',
        position: 'New Employee'
      }
      
      setUser(newUser)
      localStorage.setItem('sprint1_user', JSON.stringify(newUser))
    } catch (err) {
      setError('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sprint1_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}
