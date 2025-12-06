/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import * as Icons from "@/components/Icons";
import {
  MOCK_EVENTS,
  MOCK_PERSONALS,
  MOCK_TEMPLES,
  MOCK_LOGS,
} from "@/constants";
import { UserStatus } from "@/types";
import { Link } from "react-router";

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
  const activeFollowers = MOCK_PERSONALS.filter(
    (p) => p.status === UserStatus.ACTIVE
  ).length;
  const upcomingEvents = MOCK_EVENTS.filter(
    (e) => e.status === "Sắp diễn ra"
  ).length;

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
          value={MOCK_PERSONALS.length}
          icon={Icons.Users}
          colorClass="bg-blue-500"
          subText={`${activeFollowers} đang hoạt động`}
        />
        <StatCard
          title="Sự kiện sắp tới"
          value={upcomingEvents}
          icon={Icons.Calendar}
          colorClass="bg-emerald-500"
          subText="Trong tháng này"
        />
        <StatCard
          title="Thánh Thất"
          value={MOCK_TEMPLES.length}
          icon={Icons.Home}
          colorClass="bg-purple-500"
          subText="Trực thuộc"
        />
        <StatCard
          title="Tổng lượt truy cập"
          value="1,204"
          icon={Icons.BarChart3}
          colorClass="bg-amber-500"
          subText="+12% so với tuần trước"
        />
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
            {MOCK_EVENTS.slice(0, 3).map((event) => (
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
                    event.status === "Sắp diễn ra"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Hoạt động gần đây
          </h2>
          <div className="flow-root">
            <ul className="-mb-8">
              {MOCK_LOGS.slice(0, 4).map((log, logIdx) => (
                <li key={log._id}>
                  <div className="relative pb-8">
                    {logIdx !== 3 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      ></span>
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-white">
                          <Icons.FileClock
                            className="h-4 w-4 text-blue-500"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {log.userId}
                            </span>{" "}
                            {log.action}
                          </p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
