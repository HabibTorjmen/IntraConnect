'use client'

import { useContext, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface LoginPageProps {
  onSwitchToRegister: () => void
}

export default function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login, isLoading, error } = useContext(AuthContext)
  const [email, setEmail] = useState('employee@example.com')
  const [password, setPassword] = useState('demo123')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900"> HR</h1>
          <p className="text-slate-600 mt-2">Employee Management System</p>
        </div>

        {error && <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@example.com"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1">Try: employee@example.com, manager@example.com, admin@example.com</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo123"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1">Password: demo123</p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 text-center">Don&apos;t have an account?</p>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={onSwitchToRegister}
          >
            Create Account
          </Button>
        </div>
      </Card>
    </div>
  )
}
