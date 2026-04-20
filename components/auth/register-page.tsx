'use client'

import { useContext, useState } from 'react'

import { AuthContext } from '@/context/auth-context'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface RegisterPageProps {
  onSwitchToLogin: () => void
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register, isLoading, error } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const passwordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (passwordMismatch) return
    await register(formData.name, formData.email, formData.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-600 mt-2">Create a local demo account and matching employee profile.</p>
        </div>

        {error && <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">{error}</Alert>}
        {passwordMismatch && <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">Passwords do not match.</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || passwordMismatch}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 text-center">Already have an account?</p>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={onSwitchToLogin}
          >
            Login
          </Button>
        </div>
      </Card>
    </div>
  )
}
