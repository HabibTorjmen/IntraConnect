'use client'

import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import LoginPageComponent from '@/components/auth/login-page'
import RegisterPageComponent from '@/components/auth/register-page'
import MainLayoutComponent from '@/components/layout/main-layout'

export default function HomePage() {
  const { user } = useContext(AuthContext)
  const [showRegister, setShowRegister] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    if (showRegister) {
      return <RegisterPageComponent onSwitchToLogin={() => setShowRegister(false)} />
    }
    return <LoginPageComponent onSwitchToRegister={() => setShowRegister(true)} />
  }

  return <MainLayoutComponent />
}
