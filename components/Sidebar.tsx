"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getNotifications } from "@/app/services/notificationsService";
import {
  Home,
  Users,
  BarChart3,
  Settings,
  CheckSquare,
  X,
  UserPlus,
  Plus,
  Calendar,
  Mail,
  FileText,
  Phone,
  MessageSquare,
  Users as UsersIcon,
  Video,
  Clock,
  ChevronDown,
  ChevronRight,
  Bell,
  LogOut,
  User,
  ExternalLink,
  Car,
  Ticket,
  ListTodo,
  Award,
  MapPin,
  DollarSign,
  PieChart,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  divider?: boolean;
  adminOnly?: boolean;
  teamOnly?: boolean;
  adminOrTeamOnly?: boolean;
  employeeOnly?: boolean;
  driverOnly?: boolean;
  notDriverOnly?: boolean;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home, notDriverOnly: true },
  { name: "Dashboard", href: "/", icon: Home, driverOnly: true },
  { name: "Profile", href: "/?tab=profile", icon: User, employeeOnly: true },
  {
    name: "Notifications",
    href: "/?tab=notifications",
    icon: Bell,
    employeeOnly: true,
  },
  { name: "Tasks", href: "/?tab=tasks", icon: CheckSquare, employeeOnly: true },
  {
    name: "Attendance",
    href: "/?tab=attendance",
    icon: Clock,
    employeeOnly: true,
  },

  {
    name: "My Trips",
    href: "/driver/trips",
    icon: MapPin,
    driverOnly: true,
  },

  {
    name: "Reservations",
    href: "/reservations",
    icon: Ticket,
    adminOrTeamOnly: true,
    children: [
      { name: "Create Reservation", href: "/reservations/create", icon: Plus },
      { name: "Manage Reservations", href: "/reservations", icon: ListTodo },
    ],
  },

  {
    name: "Dispatch Board",
    href: "/dispatch",
    icon: Car,
    adminOrTeamOnly: true,
    children: [
      { name: "Dispatch Board", href: "/dispatch", icon: Car },
      { name: "Assign Drivers", href: "/dispatch/assign", icon: Users },
      { name: "Active Trips", href: "/dispatch/active", icon: MapPin },
      { name: "Passengers", href: "/dispatch/passengers", icon: User },
    ],
  },

  {
    name: "Driver Management",
    href: "/admin/drivers",
    icon: UserPlus,
    adminOrTeamOnly: true,
    children: [
      {
        name: "Register Driver",
        href: "/admin/drivers/register",
        icon: Plus,
        adminOnly: true,
      },
      { name: "Drivers", href: "/admin/drivers", icon: Users },
    ],
  },
  {
    name: "Team Management",
    href: "/admin/team",
    icon: UsersIcon,
    adminOnly: true,
    children: [
      {
        name: "Register Team Member",
        href: "/admin/team/register",
        icon: Plus,
      },
      { name: "Manage Team", href: "/admin/team", icon: UsersIcon },
    ],
  },

  {
    name: "Attendance Admin",
    href: "/admin/attendance",
    icon: Clock,
    adminOnly: true,
    children: [
      {
        name: "Attendance Record",
        href: "/admin/attendance/record",
        icon: FileText,
      },
    ],
  },

  // { name: 'Calendar', href: '/admin/calendar', icon: Calendar, adminOnly: true },
  // { name: 'Emails', href: '/admin/emails', icon: Mail, adminOnly: true },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    name: "Form Configuration",
    href: "/admin/form-configuration",
    icon: FileText,
    adminOnly: true,
  },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function SidebarContent({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAdmin, isTeam, isEmployee, isDriver, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Attendance Admin": true, // Default expanded
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  useEffect(() => {
    const activeSubmenus: Record<string, boolean> = {
      "Attendance Admin": true,
    };

    navigationItems.forEach((item) => {
      if (
        item.children &&
        item.children.some((child) => isActive(child.href))
      ) {
        activeSubmenus[item.name] = true;
      }
    });

    setExpandedMenus(() => activeSubmenus);
  }, [pathname, searchParams, isAdmin, isTeam, isEmployee]);

  // Fetch unread notifications count for employees
  useEffect(() => {
    if (isEmployee && user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await getNotifications(50, 0);
          setUnreadNotifications(response.unread || 0);
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
          setUnreadNotifications(0);
        }
      };

      fetchUnreadCount();

      // Refresh every 10 seconds for more responsive updates
      const interval = setInterval(fetchUnreadCount, 10000);

      // Listen for custom notification update events
      const handleNotificationUpdate = () => {
        fetchUnreadCount();
      };
      window.addEventListener("notificationsUpdated", handleNotificationUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener(
          "notificationsUpdated",
          handleNotificationUpdate,
        );
      };
    }
  }, [isEmployee, user, pathname]); // Add pathname to refresh when navigating

  const filteredNavigationItems = navigationItems
    .filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.teamOnly && !isTeam) return false;
      if (item.adminOrTeamOnly && !(isAdmin || isTeam)) return false;
      if (item.employeeOnly && !isEmployee) return false;
      if (item.driverOnly && !isDriver) return false;
      if (item.notDriverOnly && isDriver) return false;
      return true;
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => {
            if (child.adminOnly && !isAdmin) return false;
            if (child.teamOnly && !isTeam) return false;
            if (child.adminOrTeamOnly && !(isAdmin || isTeam)) return false;
            if (child.employeeOnly && !isEmployee) return false;
            if (child.driverOnly && !isDriver) return false;
            return true;
          }),
        };
      }
      return item;
    });

  const isActive = (href: string) => {
    const [targetPath, targetQuery] = href.split("?");
    const currentTab = searchParams.get("tab");

    // Page matches the target path exactly
    const isPathMatch = pathname === targetPath;

    if (targetQuery) {
      const targetParams = new URLSearchParams(targetQuery);
      const targetTab = targetParams.get("tab");
      return isPathMatch && currentTab === targetTab;
    }

    // For the main Dashboard link (/), only active if NO tab is selected
    if (href === "/") {
      return isPathMatch && !currentTab;
    }

    return isPathMatch;
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      window.location.href = "/login";
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {user?.name ? user.name.charAt(0).toUpperCase() : "L"}
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate w-32">
              {user?.name || "Lead CRM"}
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {user?.role || "Employee"}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavigationItems.map((item, index) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus[item.name];
            const active =
              isActive(item.href) ||
              (hasChildren &&
                item.children?.some((child) => isActive(child.href)));

            const uniqueKey = `${item.name}-${item.href}-${index}`;

            return (
              <div key={uniqueKey}>
                {item.divider && index > 0 && (
                  <div className="my-2 border-t border-slate-200"></div>
                )}

                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? "text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                          : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400"
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`h-5 w-5 mr-3 ${
                            active
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                          }`}
                        />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-4 pl-4 border-l border-slate-100 space-y-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActive(child.href);
                          return (
                            <Link
                              key={`${child.name}-${child.href}`}
                              href={child.href}
                              onClick={onClose}
                              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                childActive
                                  ? "text-white bg-slate-900 dark:bg-emerald-600 shadow-sm"
                                  : "text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400"
                              }`}
                            >
                              <ChildIcon
                                className={`h-4 w-4 mr-3 ${childActive ? "text-emerald-400" : "text-slate-400"}`}
                              />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? "text-white bg-slate-900 dark:bg-emerald-600 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    <div className="relative flex items-center flex-1">
                      <Icon
                        className={`h-5 w-5 mr-3 ${
                          active
                            ? "text-emerald-400"
                            : "text-slate-500 group-hover:text-emerald-600"
                        }`}
                      />
                      <span>{item.name}</span>
                      {item.name === "Notifications" &&
                        unreadNotifications > 0 && (
                          <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                            {unreadNotifications > 99
                              ? "99+"
                              : unreadNotifications}
                          </span>
                        )}
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense
      fallback={
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen hidden lg:flex flex-col animate-pulse">
          <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center px-6">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full" />
            <div className="ml-3 h-4 bg-slate-100 dark:bg-slate-800 rounded w-24" />
          </div>
          <div className="mt-6 px-3 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <SidebarContent {...props} />
    </Suspense>
  );
}
