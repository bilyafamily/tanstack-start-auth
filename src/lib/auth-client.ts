import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3333/api/auth'
      : 'https://nmdpra-auth-api.azurewebsites.net/api/auth',

  fetchOptions: {
    credentials: 'include',
  },
})
