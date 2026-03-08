import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { authClient } from './auth-client'

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const incomingCookie = headers.get('cookie') ?? ''

    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: {
          Cookie: incomingCookie,
        },
      },
    })

    return session
  },
)

export const ensureSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const incomingCookie = headers.get('cookie') ?? ''

    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: {
          Cookie: incomingCookie,
        },
      },
    })

    if (!session) {
      throw new Error('Unauthorized')
    }
    return session
  },
)

// Bonus: wrap other actions the same way (recommended)
// export const signIn = createServerFn().handler(async ({ data }) => {
//   return authClient.signIn.email({
//     email: data?.email,
//     password: data?.password,
//   })
// })

// export const signOut = createServerFn().handler(async () => {
//   return authClient.signOut()
// })
