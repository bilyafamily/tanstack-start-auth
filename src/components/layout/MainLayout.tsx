import React, { useState, useEffect } from 'react'
import { Link, useMatches, useRouter } from '@tanstack/react-router'
import {
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  Collapse,
  Badge,
  Card,
  CardBody,
} from 'reactstrap'

import {
  FiHome,
  FiUsers,
  FiSettings,
  FiFileText,
  FiBarChart2,
  FiMail,
  FiCalendar,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiBell,
  FiGrid,
  FiDatabase,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { authClient } from '@/lib/auth-client'

interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  path?: string
  badge?: string | number
  badgeColor?: string
  children?: MenuItem[]
  permissions?: string[]
}

interface AdminLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
}

const MainLayout: React.FC<AdminLayoutProps> = ({ children, user }) => {
  const matches = useMatches()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // State for dropdown menus
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  )

  // Get current path
  const currentPath = matches[matches.length - 1]?.pathname || ''

  const handleLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.navigate({ to: '/auth/login' }),
      },
    })
  }

  // Menu structure
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <FiHome />,
      path: '/dashboard',
      badge: 'New',
      badgeColor: 'primary',
    },
    {
      key: 'users',
      label: 'User Management',
      icon: <FiUsers />,
      children: [
        {
          key: 'all-users',
          label: 'All Users',
          path: '/admin/users',
        },
        {
          key: 'roles',
          label: 'Roles & Permissions',
          path: '/admin/users/roles',
        },
        {
          key: 'admins',
          label: 'Administrators',
          path: '/admin/users/admins',
          badge: 3,
          badgeColor: 'success',
        },
      ],
    },
    {
      key: 'content',
      label: 'Content Management',
      icon: <FiFileText />,
      children: [
        {
          key: 'pages',
          label: 'Pages',
          path: '/admin/content/pages',
        },
        {
          key: 'blog',
          label: 'Blog Posts',
          path: '/admin/content/blog',
          badge: 12,
          badgeColor: 'warning',
        },
        {
          key: 'media',
          label: 'Media Library',
          path: '/admin/content/media',
        },
        {
          key: 'comments',
          label: 'Comments',
          path: '/admin/content/comments',
          badge: 5,
          badgeColor: 'danger',
        },
      ],
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: <FiBarChart2 />,
      children: [
        {
          key: 'reports',
          label: 'Reports',
          path: '/admin/analytics/reports',
        },
        {
          key: 'visitors',
          label: 'Visitors',
          path: '/admin/analytics/visitors',
        },
        {
          key: 'sales',
          label: 'Sales',
          path: '/admin/analytics/sales',
        },
      ],
    },
    {
      key: 'communications',
      label: 'Communications',
      icon: <FiMail />,
      children: [
        {
          key: 'email',
          label: 'Email Templates',
          path: '/admin/communications/email',
        },
        {
          key: 'notifications',
          label: 'Push Notifications',
          path: '/admin/communications/notifications',
        },
        {
          key: 'sms',
          label: 'SMS',
          path: '/admin/communications/sms',
        },
      ],
    },
    {
      key: 'calendar',
      label: 'Calendar',
      icon: <FiCalendar />,
      path: '/admin/calendar',
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: <FiShoppingCart />,
      path: '/admin/orders',
      badge: 24,
      badgeColor: 'info',
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <FiSettings />,
      children: [
        {
          key: 'general',
          label: 'General',
          path: '/admin/settings/general',
        },
        {
          key: 'security',
          label: 'Security',
          icon: <FiShield />,
          path: '/admin/settings/security',
        },
        {
          key: 'database',
          label: 'Database',
          icon: <FiDatabase />,
          path: '/admin/settings/database',
        },
      ],
    },
  ]

  // Toggle dropdown
  const toggleDropdown = (key: string) => {
    // Only allow dropdown toggling when sidebar is open
    if (sidebarOpen) {
      setOpenDropdowns((prev) => ({
        ...prev,
        [key]: !prev[key],
      }))
    }
  }

  // Check if menu or any child is active
  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path && currentPath.startsWith(item.path)) {
      return true
    }
    if (item.children) {
      return item.children.some(
        (child) => child.path && currentPath.startsWith(child.path),
      )
    }
    return false
  }

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [currentPath])

  // Close all dropdowns when sidebar closes
  useEffect(() => {
    if (!sidebarOpen) {
      setOpenDropdowns({})
    }
  }, [sidebarOpen])

  // Render menu items recursively
  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0
      const isActive = isMenuActive(item)
      const isOpen = openDropdowns[item.key] || (isActive && sidebarOpen)

      return (
        <React.Fragment key={item.key}>
          {hasChildren ? (
            <>
              <NavItem className="w-100">
                <NavLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleDropdown(item.key)
                  }}
                  className={`d-flex align-items-center px-3 py-2 ${
                    isActive ? 'active bg-primary text-white' : 'text-dark'
                  }`}
                  style={{
                    cursor: sidebarOpen ? 'pointer' : 'default',
                    borderRadius: '0.375rem',
                    margin: '0.25rem 0.5rem',
                    backgroundColor: isActive ? '#0ab39c' : 'transparent',
                    justifyContent: sidebarOpen ? 'space-between' : 'center',
                  }}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <span className="d-flex align-items-center gap-2">
                    <span className="me-2">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge color={item.badgeColor || 'secondary'} pill>
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </span>
                  {sidebarOpen && (
                    <span>{isOpen ? <FiChevronUp /> : <FiChevronDown />}</span>
                  )}
                </NavLink>
              </NavItem>
              {sidebarOpen && (
                <Collapse isOpen={isOpen}>
                  <Nav vertical className="ms-3">
                    {renderMenuItems(item.children as any, level + 1)}
                  </Nav>
                </Collapse>
              )}
            </>
          ) : (
            <NavItem className="w-100">
              <NavLink
                tag={Link}
                to={item.path || '#'}
                className={`d-flex align-items-center px-3 py-2 ${
                  isActive ? 'active bg-primary text-white' : 'text-dark'
                }`}
                style={{
                  borderRadius: '0.375rem',
                  margin: '0.25rem 0.5rem',
                  backgroundColor: isActive ? '#0ab39c' : 'transparent',
                  justifyContent: sidebarOpen ? 'space-between' : 'center',
                }}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="d-flex align-items-center gap-2">
                  <span className="me-2">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge color={item.badgeColor || 'secondary'} pill>
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </span>
              </NavLink>
            </NavItem>
          )}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="admin-layout d-flex vh-100 bg-light">
      {/* Mobile Sidebar Toggle */}
      <Button
        color="primary"
        className="d-lg-none position-fixed"
        style={{ top: '1rem', left: '1rem', zIndex: 1050 }}
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? <FiX /> : <FiMenu />}
      </Button>

      {/* Sidebar Overlay for Mobile */}
      {mobileSidebarOpen && (
        <div
          className="position-fixed top-0 inset-s-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white shadow-sm h-100 position-fixed position-lg-relative ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'
        } ${mobileSidebarOpen ? 'mobile-show' : ''}`}
        style={{
          width: sidebarOpen ? '280px' : '80px',
          transition: 'all 0.3s ease',
          zIndex: 1050,
          overflowY: 'auto',
          left: 0,
          top: 0,
        }}
      >
        {/* Logo Area */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          {sidebarOpen ? (
            <h5 className="mb-0 fw-bold text-primary">Admin Panel</h5>
          ) : (
            <FiGrid className="text-primary" size={24} />
          )}
          <Button
            color="link"
            className="p-0 text-secondary d-none d-lg-block"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </Button>
        </div>

        {/* User Info (visible only when sidebar expanded) */}
        {sidebarOpen && user && (
          <Card className="mx-3 my-3 border-0 bg-light">
            <CardBody className="p-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle w-100 h-100"
                    />
                  ) : (
                    <FiUser size={20} />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="fw-bold text-truncate">{user.name}</div>
                  <small className="text-muted text-truncate d-block">
                    {user.role}
                  </small>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Navigation Menu */}
        <Nav vertical className="mt-3">
          {renderMenuItems(menuItems)}
        </Nav>

        {/* Bottom Menu */}
        <div
          className={`position-absolute bottom-0 w-100 p-3 border-top bg-white ${
            !sidebarOpen ? 'text-center' : ''
          }`}
        >
          <Nav vertical>
            <NavItem>
              <NavLink
                href="#"
                className={`d-flex align-items-center gap-2 px-3 py-2 text-dark ${
                  !sidebarOpen ? 'justify-content-center' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  handleLogout()
                }}
                title={!sidebarOpen ? 'Logout' : ''}
              >
                <FiLogOut />
                {sidebarOpen && <span>Logout</span>}
              </NavLink>
            </NavItem>
          </Nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="grow"
        style={{
          marginLeft: sidebarOpen ? '280px' : '80px',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm py-3 px-4 d-flex align-items-center justify-content-end">
          {/* Right Header Icons */}
          <div className="d-flex align-items-center gap-3">
            {/* Notifications Dropdown */}
            <Dropdown
              isOpen={notificationsOpen}
              toggle={() => setNotificationsOpen(!notificationsOpen)}
            >
              <DropdownToggle tag="span" className="position-relative">
                <FiBell
                  size={20}
                  className="text-secondary"
                  style={{ cursor: 'pointer' }}
                />
                <Badge
                  color="danger"
                  pill
                  className="position-absolute"
                  style={{ top: '-8px', right: '-8px', fontSize: '10px' }}
                >
                  3
                </Badge>
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem header>Notifications</DropdownItem>
                <DropdownItem>New user registered</DropdownItem>
                <DropdownItem>Server update completed</DropdownItem>
                <DropdownItem>System backup failed</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>View all</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* User Dropdown */}
            <Dropdown
              isOpen={userMenuOpen}
              toggle={() => setUserMenuOpen(!userMenuOpen)}
            >
              <DropdownToggle
                tag="span"
                className="d-flex align-items-center gap-2"
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px' }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle w-100 h-100"
                    />
                  ) : (
                    <FiUser size={16} />
                  )}
                </div>
                {user?.name && (
                  <span className="d-none d-md-inline">{user.name}</span>
                )}
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem header>
                  <div className="text-primary">{user?.name}</div>
                  <small className="text-muted">{user?.email}</small>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem
                  tag={Link}
                  to="/admin/profile"
                  className="d-flex align-items-center"
                >
                  <FiUser className="me-2" /> Profile
                </DropdownItem>
                <DropdownItem
                  tag={Link}
                  to="/admin/settings"
                  className="d-flex align-items-center"
                >
                  <FiSettings className="me-2" /> Settings
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem
                  onClick={handleLogout}
                  className="d-flex align-items-center text-danger"
                >
                  <FiLogOut className="me-2" /> Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4" style={{ minHeight: 'calc(100vh - 72px)' }}>
          {children}
        </main>
      </div>

      {/* Add custom CSS for responsive behavior */}
      <style>{`
        @media (max-width: 991.98px) {
          .sidebar-open,
          .sidebar-collapsed {
            transform: translateX(-100%);
          }
          .sidebar-open.mobile-show,
          .sidebar-collapsed.mobile-show {
            transform: translateX(0);
          }
          .flex-grow-1 {
            margin-left: 0 !important;
          }
        }

        .nav-link {
          transition: all 0.2s ease !important;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link.active {
          color: white !important;
          background-color: #0ab39c !important;
        }

        .nav-link.active svg {
          color: white !important;
        }

        .nav-link:hover:not(.active) {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
        }

        .nav-link:hover:not(.active) svg {
          color: #1f2937 !important;
        }

        .sidebar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .transition-all {
          transition: all 0.2s ease;
        }

        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .min-w-0 {
          min-width: 0;
        }

        .flex-shrink-0 {
          flex-shrink: 0;
        }

        .flex-grow-1 {
          flex-grow: 1;
        }
      `}</style>
    </div>
  )
}

export default MainLayout
