import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Card,
  CardBody,
  CardHeader,
  Container,
  Row,
  Col,
  FormFeedback,
  InputGroup,
  InputGroupText,
} from 'reactstrap'
import {
  FiMail,
  FiUser,
  FiLock,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from 'react-icons/fi'

// Validation schema for registration
const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    firstname: z.string().min(2, 'First name must be at least 2 characters'),
    lastname: z.string().min(2, 'Last name must be at least 2 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
    sector: z.string().min(1, 'Please select a sector'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

// Sector options for dropdown
const sectorOptions = [
  { value: '', label: 'Select a sector', disabled: true },
  { value: 'upstream', label: 'Upstream (Exploration & Production)' },
  { value: 'midstream', label: 'Midstream (Transportation & Storage)' },
  { value: 'downstream', label: 'Downstream (Refining & Marketing)' },
  { value: 'services', label: 'Oil Field Services' },
  { value: 'trading', label: 'Oil & Gas Trading' },
  { value: 'regulatory', label: 'Regulatory & Compliance' },
  { value: 'consulting', label: 'Consulting & Advisory' },
  { value: 'other', label: 'Other' },
]

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
  ssr: false,
})

function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    sector: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterForm | 'general', string>>
  >({})
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterForm, boolean>>
  >({})

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user starts typing
    if (errors[name as keyof RegisterForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Handle field blur for validation
  const handleBlur = (field: keyof RegisterForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }))

    // Validate single field on blur
    try {
      const fieldSchema = z.object({ [field]: registerSchema.shape[field] })
      fieldSchema.parse({ [field]: formData[field] })
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues[0]?.message
        setErrors((prev) => ({ ...prev, [field]: fieldError }))
      }
    }

    // Special validation for confirm password
    if (field === 'confirmPassword' || field === 'password') {
      if (formData.password && formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords don't match",
          }))
        } else {
          setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
        }
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      // Validate all fields
      const validatedData = registerSchema.parse(formData)
      setIsLoading(true)

      // Use authClient to register
      const { error } = await authClient.signUp.email({
        email: validatedData.email,
        password: validatedData.password,
        name: `${validatedData.firstname} ${validatedData.lastname}`,
        // Additional user data can be passed in the callback
        callbackURL: '/auth/verify-email',
      })

      if (error) {
        throw new Error(error.message || 'Registration failed')
      }

      // Show success message or redirect
      router.navigate({
        to: '/auth/verify-email',
        search: { email: validatedData.email },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegisterForm, string>> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterForm] = err.message
          }
        })
        setErrors(fieldErrors)
      } else if (error instanceof Error) {
        setErrors({ general: error.message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Check if field is invalid
  const isInvalid = (field: keyof RegisterForm) => {
    return touched[field] && !!errors[field]
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Container style={{ maxWidth: '500px' }}>
        <Row className="justify-content-center">
          <Col>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-success text-white text-center py-4 border-0">
                <h3 className="mb-0 fw-bold text-white">Create an Account</h3>
                <p className="mb-0 mt-2 small">
                  Join the Nigerian Midstream and Downstream Regulatory
                  Authority
                </p>
              </CardHeader>

              <CardBody className="p-4 p-lg-5">
                {/* General Error Alert */}
                {errors.general && (
                  <Alert color="danger" className="mb-4">
                    {errors.general}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <FormGroup className="mb-4">
                    <Label for="email" className="fw-semibold">
                      Email Address
                    </Label>
                    <InputGroup>
                      <InputGroupText>
                        <FiMail className="text-success" />
                      </InputGroupText>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        invalid={isInvalid('email')}
                        disabled={isLoading}
                        className="py-2 "
                      />
                    </InputGroup>
                    {errors.email && (
                      <FormFeedback tooltip valid={false}>
                        {errors.email}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* First Name Field */}
                  <FormGroup className="mb-4">
                    <Label for="firstname" className="fw-semibold">
                      First Name
                    </Label>
                    <InputGroup>
                      <InputGroupText>
                        <FiUser className="text-success" />
                      </InputGroupText>
                      <Input
                        id="firstname"
                        name="firstname"
                        type="text"
                        placeholder="John"
                        value={formData.firstname}
                        onChange={handleChange}
                        onBlur={() => handleBlur('firstname')}
                        invalid={isInvalid('firstname')}
                        disabled={isLoading}
                        className="py-2"
                      />
                    </InputGroup>
                    {errors.firstname && (
                      <FormFeedback tooltip valid={false}>
                        {errors.firstname}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* Last Name Field */}
                  <FormGroup className="mb-4">
                    <Label for="lastname" className="fw-semibold">
                      Last Name
                    </Label>
                    <InputGroup>
                      <InputGroupText>
                        <FiUser className="text-success" />
                      </InputGroupText>
                      <Input
                        id="lastname"
                        name="lastname"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastname}
                        onChange={handleChange}
                        onBlur={() => handleBlur('lastname')}
                        invalid={isInvalid('lastname')}
                        disabled={isLoading}
                        className="py-2"
                      />
                    </InputGroup>
                    {errors.lastname && (
                      <FormFeedback tooltip valid={false}>
                        {errors.lastname}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* Sector Dropdown */}
                  <FormGroup className="mb-4">
                    <Label for="sector" className="fw-semibold">
                      Oil & Gas Sector
                    </Label>
                    <InputGroup>
                      <InputGroupText>
                        <FiBriefcase className="text-success" />
                      </InputGroupText>
                      <Input
                        id="sector"
                        name="sector"
                        type="select"
                        value={formData.sector}
                        onChange={handleChange}
                        onBlur={() => handleBlur('sector')}
                        invalid={isInvalid('sector')}
                        disabled={isLoading}
                        className="py-2"
                      >
                        {sectorOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                          >
                            {option.label}
                          </option>
                        ))}
                      </Input>
                    </InputGroup>
                    {errors.sector && (
                      <FormFeedback tooltip valid={false}>
                        {errors.sector}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* Password Field */}
                  <FormGroup className="mb-4">
                    <Label for="password" className="fw-semibold">
                      Password
                    </Label>
                    <InputGroup>
                      <InputGroupText>
                        <FiLock className="text-success" />
                      </InputGroupText>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        invalid={isInvalid('password')}
                        disabled={isLoading}
                        className="py-2"
                      />
                      <Button
                        color="link"
                        className="text-decoration-none position-absolute end-0 top-50 translate-middle-y z-3 bg-transparent border-0"
                        style={{ right: '10px' }}
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </InputGroup>
                    {errors.password && (
                      <FormFeedback tooltip valid={false}>
                        {errors.password}
                      </FormFeedback>
                    )}

                    {/* Password strength indicators */}
                    {formData.password && (
                      <div className="mt-2 small">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FiCheckCircle
                            color={
                              formData.password.length >= 8
                                ? '#28a745'
                                : '#6c757d'
                            }
                          />
                          <span>At least 8 characters</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FiCheckCircle
                            color={
                              /[A-Z]/.test(formData.password)
                                ? '#28a745'
                                : '#6c757d'
                            }
                          />
                          <span>One uppercase letter</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FiCheckCircle
                            color={
                              /[a-z]/.test(formData.password)
                                ? '#28a745'
                                : '#6c757d'
                            }
                          />
                          <span>One lowercase letter</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FiCheckCircle
                            color={
                              /[0-9]/.test(formData.password)
                                ? '#28a745'
                                : '#6c757d'
                            }
                          />
                          <span>One number</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <FiCheckCircle
                            color={
                              /[^A-Za-z0-9]/.test(formData.password)
                                ? '#28a745'
                                : '#6c757d'
                            }
                          />
                          <span>One special character</span>
                        </div>
                      </div>
                    )}
                  </FormGroup>

                  {/* Confirm Password Field */}
                  <FormGroup className="mb-4">
                    <Label for="confirmPassword" className="fw-semibold">
                      Confirm Password
                    </Label>
                    <InputGroup>
                      <InputGroupText>
                        <FiLock className="text-success" />
                      </InputGroupText>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        invalid={isInvalid('confirmPassword')}
                        disabled={isLoading}
                        className="py-2"
                      />
                      <Button
                        color="link"
                        className="text-decoration-none position-absolute end-0 top-50 translate-middle-y z-3 bg-transparent border-0"
                        style={{ right: '10px' }}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        type="button"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </InputGroup>
                    {errors.confirmPassword && (
                      <FormFeedback tooltip valid={false}>
                        {errors.confirmPassword}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    color="success"
                    size="lg"
                    block
                    disabled={isLoading}
                    className="fw-semibold py-3 mb-3"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  {/* Login Link */}
                  <p className="text-center text-muted mb-0">
                    Already have an account?{' '}
                    <a
                      href="/auth/login"
                      className="text-success fw-semibold text-decoration-none"
                    >
                      Sign In
                    </a>
                  </p>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
