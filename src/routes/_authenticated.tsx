import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/session'
import MainLayout from '#/components/layout/MainLayout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({ to: '/auth/login', search: { redirect: location.href } })
    }

    return session
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
})
