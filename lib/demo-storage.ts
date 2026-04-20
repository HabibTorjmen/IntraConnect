export const DEMO_APP_STATE_KEY = 'intraconnect-demo-state-v1'
export const DEMO_AUTH_STATE_KEY = 'intraconnect-auth-state-v1'

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
