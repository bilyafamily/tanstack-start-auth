import { createFileRoute, useRouter } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Card, CardBody, Row } from 'reactstrap'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const router = useRouter()
  return (
    <Row>
      <Card>
        <CardBody>
          <div>Hello {user.name}</div>
          <div>Email {user.email}</div>
          <button
            className="bg-green-400"
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.navigate({ to: '/auth/login' }),
                },
              })
            }
          >
            Sign Out
          </button>
        </CardBody>
      </Card>
    </Row>
  )
}
