/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import * as Icons from "@/components/Icons";
import { UserStatus, EventStatus, EventStatusLabel } from "@/types";
import { Link } from "react-router";
import type { Event, Personal } from "@/types";
import analyticsService from "@/services/analyticsService";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      {subText && <p className="text-xs text-gray-400 mt-2">{subText}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export const Dashboard = () => {
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitData, setVisitData] = useState<any[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [personalsRes, eventsRes] = await Promise.all([
          fetch("http://localhost:3000/api/personals", { headers }),
          fetch("http://localhost:3000/api/events", { headers }),
        ]);

        if (personalsRes.ok) {
          const personalsData = await personalsRes.json();
          setPersonals(personalsData.data || personalsData || []);
        }
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.data || eventsData || []);
        }

        // Lấy dữ liệu lượt truy cập thật từ backend
        const dailyVisits = await analyticsService.getDailyVisits(7);
        if (dailyVisits && dailyVisits.data) {
          setVisitData(dailyVisits.data);
          
          // Tính tổng lượt truy cập
          const total = dailyVisits.data.reduce((sum: number, day: any) => sum + day.visits, 0);
          setTotalVisits(total);
        }

        // Lấy hoạt động gần đây (10 logs mới nhất)
        const logsRes = await fetch("http://localhost:3000/api/activity-logs?limit=10", { 
          headers 
        });
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setActivityLogs(logsData.logs || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeFollowers = personals.filter(
    (p) => p.status === UserStatus.ACTIVE
  ).length;
  const upcomingEvents = events.filter(
    (e) => e.status === EventStatus.UPCOMING || e.status === EventStatus.ONGOING
  ).length;

  // Sort events: upcoming/ongoing first, then by startTime (nearest first)
  const sortedEvents = [...events].sort((a, b) => {
    // Priority: UPCOMING and ONGOING events first
    const aIsActive = a.status === EventStatus.UPCOMING || a.status === EventStatus.ONGOING;
    const bIsActive = b.status === EventStatus.UPCOMING || b.status === EventStatus.ONGOING;
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    // Then sort by startTime (nearest first)
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
        <p className="text-gray-500">
          Tổng quan hoạt động Thánh Thất Trung Minh
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng Tín đồ"
          value={personals.length}
          icon={Icons.Users}
          colorClass="bg-blue-500"
          subText={`${activeFollowers} đang hoạt động`}
        />
        <StatCard
          title="Sự kiện sắp tới"
          value={upcomingEvents}
          icon={Icons.Calendar}
          colorClass="bg-emerald-500"
          subText="Sắp diễn ra hoặc đang diễn ra"
        />
        <StatCard
          title="Tổng sự kiện"
          value={events.length}
          icon={Icons.Home}
          colorClass="bg-purple-500"
          subText="Từ trước tới nay"
        />
        <StatCard
          title="Tổng lượt truy cập"
          value={totalVisits || 0}
          icon={Icons.BarChart3}
          colorClass="bg-amber-500"
          subText="7 ngày gần nhất"
        />
      </div>

      {/* Visit Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Lượt truy cập</h2>
            <p className="text-sm text-gray-500">7 ngày gần nhất</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Lượt truy cập</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={visitData}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVisits)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Sự kiện nổi bật</h2>
            <button className="text-primary-600 text-sm font-medium hover:underline">
              <Link to="/admin/events">Xem tất cả</Link>
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : events.length > 0 ? (
              sortedEvents.slice(0, 3).map((event) => (
                <div
                  key={event._id}
                  className="flex items-center p-4 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-md flex flex-col items-center justify-center text-blue-700 font-bold mr-4">
                    <span className="text-xs uppercase">
                      {new Date(event.startTime).toLocaleString("default", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-xl">
                      {new Date(event.startTime).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{event.name}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Icons.MapPin className="w-3 h-3 mr-1" /> {event.location}
                    <span className="mx-2">•</span>
                    <Icons.Users className="w-3 h-3 mr-1" />{" "}
                    {event.participantsCount} tham gia
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === EventStatus.UPCOMING || event.status === EventStatus.ONGOING
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {EventStatusLabel[event.status as EventStatus] || event.status}
                </span>
              </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Không có sự kiện nào</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activityLogs.length > 0 ? (
              activityLogs.map((log, index) => (
                <div key={log._id || index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {log.action === "create" && <Icons.Plus className="w-4 h-4 text-blue-600" />}
                    {log.action === "update" && <Icons.Edit className="w-4 h-4 text-green-600" />}
                    {log.action === "delete" && <Icons.Trash2 className="w-4 h-4 text-red-600" />}
                    {!["create", "update", "delete"].includes(log.action) && <Icons.Activity className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {log.userId?.personalId?.fullname || "Người dùng"}
                      </span>
                      {" "}
                      <span className="text-gray-600">
                        {log.action === "create" && "đã tạo"}
                        {log.action === "update" && "đã cập nhật"}
                        {log.action === "delete" && "đã xóa"}
                        {!["create", "update", "delete"].includes(log.action) && log.action}
                      </span>
                      {" "}
                      <span className="text-gray-600">
                        {log.targetCollection === "Event" && "sự kiện"}
                        {log.targetCollection === "Personal" && "tín đồ"}
                        {log.targetCollection === "Temple" && "thánh thất"}
                        {log.targetCollection === "Department" && "ban"}
                        {log.targetCollection === "User" && "người dùng"}
                        {!["Event", "Personal", "Temple", "Department", "User"].includes(log.targetCollection) && log.targetCollection}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Icons.Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
          {activityLogs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                to="/admin/logs"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
              >
                Xem tất cả hoạt động
                <Icons.ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
