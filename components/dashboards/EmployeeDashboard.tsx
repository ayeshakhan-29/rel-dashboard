"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Clock,
  Bell,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  User,
  CheckSquare,
  TrendingUp,
  Zap,
  Award,
  Home as HomeIcon,
  Layout,
  Mail,
  Shield,
  ClipboardList,
} from "lucide-react";
import {
  attendanceService,
  AttendanceRecord,
} from "@/app/services/attendanceService";
import { useAuth } from "@/app/context/AuthContext";
import { getTasks, Task, updateTaskStatus } from "@/app/services/tasksService";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
} from "@/app/services/notificationsService";

type TabType = "home" | "profile" | "attendance" | "tasks" | "notifications";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const tabParam = searchParams.get("tab") as TabType;

  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "home");
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceRecord | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (
      tabParam &&
      ["home", "profile", "attendance", "tasks", "notifications"].includes(
        tabParam,
      )
    ) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("home");
    }
  }, [tabParam]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setNotificationsLoading(true);
      const response = await getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setAttendanceLoading(true);
        const response = await attendanceService.getStatus();
        setAttendanceStatus(response.data);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      } finally {
        setAttendanceLoading(false);
      }
    };

    const fetchAssignedTasks = async () => {
      if (!user) return;
      try {
        setTasksLoading(true);
        // Fetch tasks specifically assigned to THIS user
        const response = await getTasks({ assigned_to: user.id });
        setAssignedTasks(response.data);
      } catch (err) {
        console.error("Failed to fetch assigned tasks:", err);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchAttendance();
    fetchAssignedTasks();
    fetchNotifications();

    // Listen for notification updates
    const handleNotificationUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener("notificationsUpdated", handleNotificationUpdate);

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationUpdate,
      );
    };
  }, [user]);

  const handleCheckIn = async () => {
    try {
      setAttendanceLoading(true);
      const response = await attendanceService.checkIn();
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error("Check in failed:", error);
      alert("Check in failed. Please try again.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setAttendanceLoading(true);
      const response = await attendanceService.checkOut();
      setAttendanceStatus(response.data);
    } catch (error) {
      console.error("Check out failed:", error);
      alert("Check out failed. Please try again.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: number,
    newStatus: "Pending" | "In Progress" | "Completed",
  ) => {
    try {
      setUpdatingTaskId(taskId);
      await updateTaskStatus(taskId, newStatus);
      // Update local state
      setAssignedTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
      alert("Could not update task status. Please try again.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getPendingTasksCount = () =>
    assignedTasks.filter((t) => t.status !== "Completed").length;
  const getCompletedTasksCount = () =>
    assignedTasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="space-y-6">
      {activeTab === "home" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                Pending Tasks
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {getPendingTasksCount()}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                Completed Tasks
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {getCompletedTasksCount()}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                Unread Notifications
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {unreadCount}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">
                Attendance Status
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {attendanceStatus
                  ? attendanceStatus.check_out
                    ? "Completed"
                    : "Active"
                  : "Not Clocked In"}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => router.push("/?tab=tasks")}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">My Tasks</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {assignedTasks.length} assigned
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <div
              onClick={() => router.push("/?tab=attendance")}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Attendance
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {attendanceStatus
                      ? attendanceStatus.check_out
                        ? "View records"
                        : "Clock out"
                      : "Clock in"}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xl font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {user?.name}
                </h2>
                <p className="text-sm text-slate-500 capitalize">
                  {user?.role}
                </p>
                <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Employee ID
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  #{user?.id?.toString().padStart(4, "0")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Account Status
                </p>
                <div className="flex items-center text-emerald-600 mt-1">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-semibold">Active</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Department
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  Operations
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">
                  Role Type
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                  Check In Time
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {attendanceStatus?.check_in
                    ? new Date(attendanceStatus.check_in).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit", hour12: true },
                      )
                    : "--:--"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                  Check Out Time
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {attendanceStatus?.check_out
                    ? new Date(attendanceStatus.check_out).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit", hour12: true },
                      )
                    : "--:--"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 pt-4 border-t border-slate-200">
              {attendanceLoading ? (
                <div className="flex items-center space-x-2 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : !attendanceStatus ? (
                <button
                  onClick={handleCheckIn}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Clock className="h-5 w-5" />
                  <span>Clock In</span>
                </button>
              ) : !attendanceStatus.check_out ? (
                <button
                  onClick={handleCheckOut}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <ArrowRight className="h-5 w-5" />
                  <span>Clock Out</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Shift Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-900">
                My Tasks
              </h3>
              <span className="text-xs text-slate-500">
                {assignedTasks.length} assigned
              </span>
            </div>
            {tasksLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm">Loading tasks...</p>
              </div>
            ) : assignedTasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium text-slate-900">
                  No tasks assigned
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You don't have any tasks at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-600 mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          {task.due_date && (
                            <div className="flex items-center text-xs text-slate-500">
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              {new Date(task.due_date).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              task.priority === "High"
                                ? "bg-rose-50 text-rose-600"
                                : task.priority === "Medium"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                      <select
                        value={task.status}
                        disabled={updatingTaskId === task.id}
                        onChange={(e) =>
                          handleUpdateTaskStatus(task.id, e.target.value as any)
                        }
                        className={`text-xs font-medium px-3 py-1 rounded border cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                          task.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : task.status === "In Progress"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await markAllAsRead();
                      const response = await getNotifications();
                      setNotifications(response.data);
                      setUnreadCount(0);
                      // Trigger sidebar update
                      window.dispatchEvent(new Event("notificationsUpdated"));
                    } catch (err) {
                      console.error("Failed to mark all as read:", err);
                    }
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {notificationsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Bell className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium text-slate-900">
                  No notifications
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      notification.is_read
                        ? "bg-white border-slate-200 hover:border-slate-300"
                        : "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                    }`}
                    onClick={async () => {
                      if (!notification.is_read) {
                        try {
                          await markAsRead(notification.id);
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.id === notification.id
                                ? { ...n, is_read: 1 }
                                : n,
                            ),
                          );
                          setUnreadCount((prev) => Math.max(0, prev - 1));
                          // Trigger sidebar update
                          window.dispatchEvent(
                            new Event("notificationsUpdated"),
                          );
                        } catch (err) {
                          console.error("Failed to mark as read:", err);
                        }
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeeDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
