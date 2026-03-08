import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Alert,
  Container,
  Row,
  Col,
} from 'reactstrap'
import { FiMail, FiCheckCircle } from 'react-icons/fi'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    return {
      email: search.email as string | undefined,
    }
  },
})

function VerifyEmailPage() {
  const { email } = Route.useSearch()
  const router = useRouter()
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const handleResendEmail = async () => {
    setResendLoading(true)
    try {
      // Call your resend verification endpoint
      const { error } = await authClient.sendVerificationEmail({
        email: email || '',
      })

      if (!error) {
        setResendSuccess(true)
        setCountdown(60)
      }
    } catch (error) {
      console.error('Failed to resend:', error)
    } finally {
      setResendLoading(false)
    }
  }

  // Countdown timer for resend button
  useEffect(() => {
    if (resendSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (countdown === 0) {
      setResendSuccess(false)
    }
  }, [resendSuccess, countdown])

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Container style={{ maxWidth: '500px' }}>
        <Row className="justify-content-center">
          <Col>
            <Card className="shadow-lg border-0 text-center">
              <CardHeader className="bg-success text-white py-4 border-0">
                <FiMail size={48} className="mb-3" />
                <h3 className="mb-0 fw-bold">Verify Your Email</h3>
              </CardHeader>

              <CardBody className="p-4 p-lg-5">
                <FiCheckCircle size={64} className="text-success mb-4" />

                <h5 className="mb-3">We've sent a verification email to:</h5>
                <p className="h6 mb-4 text-success fw-bold">{email}</p>

                <p className="text-muted mb-4">
                  Please check your inbox and click the verification link to
                  activate your account. If you don't see the email, check your
                  spam folder.
                </p>

                <Button
                  color="success"
                  outline
                  onClick={handleResendEmail}
                  disabled={resendLoading || resendSuccess}
                  className="px-4"
                >
                  {resendLoading ? (
                    <>Sending...</>
                  ) : resendSuccess ? (
                    `Resend available in ${countdown}s`
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>

                {resendSuccess && (
                  <Alert color="success" className="mt-4 mb-0">
                    Verification email sent successfully!
                  </Alert>
                )}

                <hr className="my-4" />

                <Button
                  color="link"
                  onClick={() => router.navigate({ to: '/auth/login' })}
                  className="text-decoration-none"
                >
                  Return to Login
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
