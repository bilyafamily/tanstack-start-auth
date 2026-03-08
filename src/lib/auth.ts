import { betterAuth } from 'better-auth'
export const auth = betterAuth({
  user: {
    additionalFields: {
      firstname: {
        type: 'string',
        required: false,
      },
      lastname: {
        type: 'string',
        required: false,
      },
      sector: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
      },
    },
  },
})
