import { useEffect, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Tooltip } from 'radix-ui';
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  CircleDollarSign,
  TicketPercent,
  Settings,
  Menu,
  House,
  Info,
  LogOut,
  UserRound,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';

import { Wordmark } from '@/modules/frontend/layouts/SiteLayout';
import { useApp } from '@/shared/context/AppContext';
import { useAuth } from '@/modules/auth/context/AuthContext';

const storageKey = 'matelink.admin.sidebar-collapsed';

const navigation = [
  ['/admin', 'Overview', LayoutDashboard],
  ['/admin/bookings', 'Bookings', ClipboardList],
  ['/admin/quotes', 'Quote requests', MessageSquare],
  ['/admin/recleans', 'Re-clean requests', ShieldCheck],
  ['/admin/payments', 'Payments', CreditCard],
  ['/admin/services', 'Services & add-ons', SlidersHorizontal],
  ['/admin/pricing', 'Pricing', CircleDollarSign],
  ['/admin/promotions', 'Promotions', TicketPercent],
  ['/admin/settings', 'Settings', Settings],
];

const sidebarStyles = `
  .admin-layout.matelink-admin-layout {
    --admin-expanded-width: 245px;
    grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr);
    transition: grid-template-columns 220ms ease;
  }

  .matelink-admin-layout .admin-sidebar {
    height: 100dvh;
    min-height: 0;
    transition: padding 220ms ease;
  }

  .matelink-admin-layout .admin-sidebar-heading {
    min-height: 79px;
    flex-shrink: 0;
  }

  .matelink-admin-layout .admin-brand {
    min-height: 43px;
    white-space: nowrap;
  }

  .matelink-admin-layout .admin-sidebar-menu {
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: thin;
    padding-bottom: 12px;
  }

  .matelink-admin-navigation {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .matelink-admin-navigation .admin-navlink,
  .matelink-admin-layout .admin-sidebar-footer .admin-navlink {
    display: flex;
    align-items: center;
    min-height: 48px;
    flex-shrink: 0;
  }

  .matelink-admin-navigation .admin-navlink svg,
  .matelink-admin-layout .admin-sidebar-footer .admin-navlink svg {
    flex-shrink: 0;
  }

  .matelink-admin-layout .admin-sidebar-footer {
    flex-shrink: 0;
  }

  .matelink-admin-layout[data-collapsed='true'] .admin-sidebar {
    padding-inline: 12px;
  }

  .matelink-admin-layout[data-collapsed='true'] .admin-brand {
    justify-content: center;
  }

  .matelink-admin-layout[data-collapsed='true'] .wordmark-type {
    display: none;
  }

  .matelink-admin-layout[data-collapsed='true'] .admin-workspace-label {
    visibility: hidden;
    white-space: nowrap;
  }

  .matelink-admin-layout .admin-navlink.admin-icon-link {
    width: 52px;
    height: 48px;
    min-height: 48px;
    padding: 12px 16px;
    justify-content: center;
    gap: 0;
  }

  .matelink-admin-tooltip {
    z-index: 1000;
    padding: 9px 13px;
    border-radius: 8px;
    background: #102d43;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    white-space: nowrap;
    box-shadow: 0 6px 20px rgba(16, 45, 67, 0.16);
  }

  .matelink-admin-tooltip-arrow {
    fill: #102d43;
  }


  /* =======================================================
     STICKY ADMIN TOP BAR
     ======================================================= */

  .matelink-admin-layout .admin-topbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(245, 247, 248, 0.96);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 1px 0 rgba(16, 45, 67, 0.04);
  }

  /* =======================================================
     ADMIN ACCOUNT MENU
     ======================================================= */

  .admin-account-menu-wrap {
    position: relative;
  }

  .admin-account-trigger {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 4px 7px 4px 5px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: #ffffff;
    color: var(--foreground);
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease;
  }

  .admin-account-trigger:hover,
  .admin-account-trigger.is-open {
    border-color: rgba(8, 126, 131, 0.32);
    background: #fbfdfd;
    box-shadow: 0 6px 18px rgba(16, 45, 67, 0.07);
  }

  .admin-account-avatar {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 50%;
    background: #102d43;
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .admin-account-chevron {
    color: #6b7d87;
    transition: transform 0.18s ease;
  }

  .admin-account-trigger.is-open .admin-account-chevron {
    transform: rotate(180deg);
  }

  .admin-account-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 120;
    width: 250px;
    padding: 8px;
    border: 1px solid rgba(220, 229, 233, 0.98);
    border-radius: 15px;
    background: #ffffff;
    box-shadow:
      0 18px 46px rgba(16, 45, 67, 0.12),
      0 4px 12px rgba(16, 45, 67, 0.035);
  }

  .admin-account-dropdown::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 17px;
    width: 12px;
    height: 12px;
    border-top: 1px solid var(--border);
    border-left: 1px solid var(--border);
    background: #ffffff;
    transform: rotate(45deg);
  }

  .admin-account-profile {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px;
  }

  .admin-account-profile-icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 11px;
    background: var(--secondary);
    color: var(--primary);
  }

  .admin-account-divider {
    height: 1px;
    margin: 4px 7px;
    background: var(--border);
  }

  .admin-account-dropdown-item {
    width: 100%;
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 11px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.8rem;
    font-weight: 650;
    text-align: left;
    transition:
      color 0.18s ease,
      background-color 0.18s ease;
  }

  .admin-account-dropdown-item:hover {
    color: var(--primary);
    background: var(--secondary);
  }

  .admin-account-dropdown-item.is-logout,
  .admin-sidebar-logout {
    color: #993636;
  }

  .admin-account-dropdown-item.is-logout:hover,
  .admin-sidebar-logout:hover {
    color: #993636;
    background: #fceeee;
  }

  .admin-sidebar-action {
    width: 100%;
    border: 0;
    text-align: left;
  }

  .matelink-admin-layout[data-collapsed='true'] .admin-sidebar-action.admin-icon-link {
    width: 52px;
  }

  @media (min-width: 901px) and (max-width: 1100px) {
    .admin-layout.matelink-admin-layout {
      --admin-expanded-width: 215px;
    }
  }

  @media (max-width: 900px) {
    .admin-layout.matelink-admin-layout {
      display: block;
    }

    .matelink-admin-layout .admin-sidebar,
    .matelink-admin-layout .admin-desktop-toggle {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-layout.matelink-admin-layout,
    .matelink-admin-layout .admin-sidebar {
      transition: none;
    }
  }
`;

function SidebarLink({
  to,
  label,
  Icon,
  collapsed = false,
  className = '',
}) {
  // A string className preserves styling inside Tooltip.Trigger.
  // NavLink automatically adds "active" for the current page.
  const link = (
    <NavLink
      to={to}
      end={to === '/admin' || to === '/'}
      className={`admin-navlink ${
        collapsed ? 'admin-icon-link' : ''
      } ${className}`.trim()}
      aria-label={collapsed ? label : undefined}
    >
      <Icon size={18} aria-hidden="true" />

      <span className={collapsed ? 'sr-only' : undefined}>
        {label}
      </span>
    </NavLink>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {link}
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={12}
          collisionPadding={12}
          className="matelink-admin-tooltip"
        >
          {label}

          <Tooltip.Arrow className="matelink-admin-tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}


function SidebarAction({
  label,
  Icon,
  collapsed = false,
  className = '',
  onClick,
}) {
  const button = (
    <button
      type="button"
      className={`admin-navlink admin-sidebar-action ${
        collapsed ? 'admin-icon-link' : ''
      } ${className}`.trim()}
      aria-label={collapsed ? label : undefined}
      onClick={onClick}
    >
      <Icon size={18} aria-hidden="true" />

      <span className={collapsed ? 'sr-only' : undefined}>
        {label}
      </span>
    </button>
  );

  if (!collapsed) {
    return button;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {button}
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={12}
          collisionPadding={12}
          className="matelink-admin-tooltip"
        >
          {label}
          <Tooltip.Arrow className="matelink-admin-tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function AdminNavigation({ collapsed = false }) {
  return (
    <nav
      aria-label="Administration"
      className="matelink-admin-navigation mt-9"
    >
      {navigation.map(([to, label, Icon]) => (
        <SidebarLink
          key={to}
          to={to}
          label={label}
          Icon={Icon}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        window.localStorage.getItem(storageKey) === 'true'
      );
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { bookings } = useApp();
  const { user, logout } = useAuth();

  const pending = bookings.filter(
    booking => booking.status === 'pending'
  ).length;

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, String(collapsed));
    } catch {
      // Collapsing still works when browser storage is unavailable.
    }
  }, [collapsed]);


  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setAccountOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLogout() {
    setAccountOpen(false);
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  }

  const adminName = user?.name || 'Matelink Admin';
  const adminEmail = user?.email || 'Administrator';

  const adminInitials = adminName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'MC';

  return (
    <Tooltip.Provider delayDuration={200}>
      <div
        className="admin-layout matelink-admin-layout"
        data-collapsed={String(collapsed)}
        style={{
          '--admin-sidebar-width': collapsed
            ? '76px'
            : 'var(--admin-expanded-width)',
        }}
      >
        <style>{sidebarStyles}</style>

        <aside
          id="desktop-admin-sidebar"
          className="admin-sidebar"
        >
          <div className="admin-sidebar-heading">
            <Wordmark className="admin-brand" />

            <p className="admin-workspace-label mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your cleaning workspace
            </p>
          </div>

          <div className="admin-sidebar-menu">
            <AdminNavigation collapsed={collapsed} />
          </div>

          <div className="admin-sidebar-footer mt-auto">
            {!collapsed && (
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-sm font-semibold">
                  {pending} request{pending === 1 ? '' : 's'} to review
                </p>

                <p className="field-help mt-2">
                  Keep your next fresh starts moving.
                </p>
              </div>
            )}

            <SidebarLink
              to="/"
              label="View website"
              Icon={House}
              collapsed={collapsed}
              className="mt-5"
            />

            <SidebarAction
              label="Log out"
              Icon={LogOut}
              collapsed={collapsed}
              className="admin-sidebar-logout mt-1"
              onClick={handleLogout}
            />
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="admin-desktop-toggle"
                onClick={() => setCollapsed(value => !value)}
                aria-label={
                  collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                aria-expanded={!collapsed}
                aria-controls="desktop-admin-sidebar"
              >
                <Menu size={19} />
              </Button>

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    className="admin-mobile-nav"
                    variant="outline"
                    size="icon"
                    aria-label="Open admin navigation"
                  >
                    <Menu size={19} />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[300px] p-6"
                >
                  <SheetHeader>
                    <SheetTitle>Matelink workspace</SheetTitle>
                  </SheetHeader>

                  <AdminNavigation />

                  <Link
                    to="/"
                    className="admin-navlink mt-5"
                  >
                    <House size={18} />
                    View website
                  </Link>

                  <button
                    type="button"
                    className="admin-navlink admin-sidebar-action admin-sidebar-logout mt-1"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Log out
                  </button>
                </SheetContent>
              </Sheet>

              <p className="text-sm font-semibold">
                Matelink workspace
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div
                ref={accountMenuRef}
                className="admin-account-menu-wrap"
              >
                <button
                  type="button"
                  className={`admin-account-trigger ${
                    accountOpen ? 'is-open' : ''
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen(value => !value)}
                >
                  <span className="admin-account-avatar">
                    {adminInitials}
                  </span>

                  <span className="hidden max-w-[120px] truncate text-xs font-semibold sm:block">
                    {adminName}
                  </span>

                  <ChevronDown
                    size={14}
                    className="admin-account-chevron hidden sm:block"
                    aria-hidden="true"
                  />
                </button>

                {accountOpen && (
                  <div
                    className="admin-account-dropdown"
                    role="menu"
                  >
                    <div className="admin-account-profile">
                      <div className="admin-account-profile-icon">
                        <UserRound size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-navy">
                          {adminName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {adminEmail}
                        </p>
                      </div>
                    </div>

                    <div className="admin-account-divider" />

                    <Link
                      to="/admin/settings"
                      role="menuitem"
                      className="admin-account-dropdown-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Settings size={17} />
                      Settings
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      className="admin-account-dropdown-item is-logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="mb-7 flex items-start gap-2 rounded-lg border border-dashed bg-white px-4 py-3 text-xs text-muted-foreground">
            <Info
              className="mt-0.5 shrink-0"
              size={15}
            />

            <span>
              Demo workspace. Data stays in this browser. Status updates
              create email previews; they do not send messages.
              Production requires authenticated server access.
            </span>
          </div>

          <main id="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </Tooltip.Provider>
  );
}