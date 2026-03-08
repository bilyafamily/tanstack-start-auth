import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { Button } from 'reactstrap'

// Validation schema
const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
  ssr: false,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginForm>({
    email: 'bilyafamily@yahoo.com',
    password: 'MotheR$12@',
  })
  const [errors, setErrors] = useState<Partial<LoginForm>>({})
  // const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      // Validate form
      loginSchema.parse(formData)
      setIsLoading(true)

      await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/dashboard'
            : 'https://support-nmdpra-ui-aecfcnd3fucqakez.westeurope-01.azurewebsites.net/dashboard',
        fetchOptions: {
          onSuccess: () => {
            setIsLoading(false)
          },
          onError: (error) => {
            setIsLoading(false)
            setErrors({ email: error.error.message || 'Login failed' })
          },
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginForm> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginForm] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    }
  }

  const handleSocialLogin = (provider: 'github' | 'microsoft' | 'google') => {
    authClient.signIn.social({
      provider: provider,
      callbackURL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/dashboard'
          : 'https://support-nmdpra-ui-aecfcnd3fucqakez.westeurope-01.azurewebsites.net/dashboard',
      fetchOptions: {
        onSuccess: () => {
          // router.navigate({ to: '/dashboard' })
        },
        onError: (error) => {
          console.log(error)
          setErrors({ email: error.error.message || 'Login failed' })
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <a
              href="/auth/forgot-password"
              className="text-sm text-green-600 hover:text-green-500"
            >
              Forgot password?
            </a>
          </div>

          <Button
            color="success"
            size="lg"
            block
            type="submit"
            disabled={isLoading}
            className="fw-semibold py-3 mb-3"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleSocialLogin('github')}
            className="flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={() => handleSocialLogin('google')}
            className="flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>

          <button
            onClick={() => handleSocialLogin('microsoft')}
            className="flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0078D4">
              <path d="M11.5 2.5L2 7.5v10l9.5 5 9.5-5v-10l-9.5-5zm0 2.1L19 8.9v7.8l-7.5 4-7.5-4V8.9l7.5-4.3zM5 10.5v4.5l5-2.5V8l-5 2.5zm7 2.5l5-2.5V8l-5 2.5V13z" />
            </svg>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/auth/register"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
