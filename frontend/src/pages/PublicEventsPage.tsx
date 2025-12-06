import React, { useState } from "react";
import * as Icons from "../components/Icons";
import { MOCK_EVENTS, MOCK_PERSONALS } from "../constants";
import { EventStatus, type Event } from "../types";

export const PublicEventsPage = () => {
  const [filter, setFilter] = useState<"All" | "Upcoming" | "Past">("Upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const filteredEvents = MOCK_EVENTS.filter((event) => {
    // 1. Filter by Status Tab
    let statusMatch = true;
    if (filter === "Upcoming")
      statusMatch =
        event.status === EventStatus.UPCOMING ||
        event.status === EventStatus.ONGOING;
    if (filter === "Past") statusMatch = event.status === EventStatus.COMPLETED;

    // 2. Filter by Search Term
    const searchLower = searchTerm.toLowerCase();
    const searchMatch =
      event.name.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.eventType.toLowerCase().includes(searchLower);

    return statusMatch && searchMatch;
  });

  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    setRegisterSuccess(false);
  };

  const handleRegister = () => {
    setIsRegistering(true);
    // Simulate API call
    setTimeout(() => {
      setIsRegistering(false);
      setRegisterSuccess(true);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Banner */}
      <div className="bg-blue-900 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="font-serif text-4xl font-bold mb-4">
            Sự Kiện & Lễ Hội
          </h1>
          <p className="text-blue-200 text-lg">
            Cập nhật các hoạt động sinh hoạt tôn giáo và xã hội
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Search & Filter Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow"
              placeholder="Tìm kiếm sự kiện, địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            {["Upcoming", "Past", "All"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "Upcoming"
                  ? "Sắp diễn ra"
                  : f === "Past"
                  ? "Đã diễn ra"
                  : "Tất cả"}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer"
                onClick={() => handleOpenEvent(event)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      event.bannerUrl ||
                      `https://picsum.photos/seed/${event._id}/800/600`
                    }
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-0 right-0 p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        event.status === EventStatus.UPCOMING
                          ? "bg-green-100 text-green-800"
                          : event.status === EventStatus.COMPLETED
                          ? "bg-gray-200 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-4 mb-4">
                    <div className="text-center min-w-[3.5rem] bg-blue-50 rounded-lg p-2 h-fit">
                      <span className="block text-xs font-bold text-gray-500 uppercase">
                        {new Date(event.startTime).toLocaleString("default", {
                          month: "short",
                        })}
                      </span>
                      <span className="block text-2xl font-bold text-blue-600">
                        {new Date(event.startTime).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-600 uppercase mb-1">
                        {event.eventType}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 text-gray-600 text-sm">
                    <div className="flex items-start">
                      <Icons.Clock className="w-4 h-4 mr-3 mt-0.5 text-blue-400" />
                      <span>
                        {new Date(event.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(event.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Icons.MapPin className="w-4 h-4 mr-3 mt-0.5 text-blue-400" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button className="w-full py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors">
                      Chi tiết sự kiện
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl">
              <Icons.Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                Không tìm thấy sự kiện nào phù hợp.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedEvent(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>

            {/* Modal Header / Banner */}
            <div className="relative h-64 md:h-80 flex-shrink-0">
              <img
                src={
                  selectedEvent.bannerUrl ||
                  `https://picsum.photos/seed/${selectedEvent._id}/800/600`
                }
                alt={selectedEvent.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded mb-3 uppercase tracking-wider">
                  {selectedEvent.eventType}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {selectedEvent.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm">
                  <div className="flex items-center">
                    <Icons.Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedEvent.startTime).toLocaleDateString(
                      "vi-VN",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </div>
                  <div className="flex items-center">
                    <Icons.MapPin className="w-4 h-4 mr-2" />
                    {selectedEvent.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 flex-1">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin chi tiết
                  </h3>
                  <div className="prose prose-blue text-gray-600 mb-8">
                    <p>
                      {selectedEvent.description ||
                        "Chưa có mô tả chi tiết cho sự kiện này. Vui lòng liên hệ Ban Tổ Chức để biết thêm thông tin."}
                    </p>
                    <p>
                      Đến với sự kiện, quý đạo hữu sẽ được tham gia vào các hoạt
                      động ý nghĩa, lắng nghe thuyết giảng giáo lý và cùng nhau
                      cầu nguyện cho thế giới hòa bình, vạn linh sanh chúng được
                      an lạc.
                    </p>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Lịch trình dự kiến
                  </h3>
                  <ul className="space-y-4 mb-8">
                    <li className="flex gap-4">
                      <div className="w-20 font-bold text-blue-600 text-sm text-right shrink-0">
                        {new Date(selectedEvent.startTime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                      <div className="pb-4 border-l-2 border-blue-100 pl-6 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="font-bold text-gray-800">
                          Khai mạc & Tiếp đón
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Đón tiếp quý đại biểu và đạo hữu.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-20 font-bold text-blue-600 text-sm text-right shrink-0">
                        {new Date(
                          new Date(selectedEvent.startTime).getTime() +
                            60 * 60 * 1000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="pb-4 border-l-2 border-blue-100 pl-6 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="font-bold text-gray-800">
                          Phần Lễ chính thức
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Dâng hương và cầu nguyện.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Sidebar Info */}
                <div className="md:w-72 shrink-0">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-4">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <Icons.Info className="w-4 h-4 mr-2 text-blue-500" />
                      Thông tin tổ chức
                    </h4>

                    {(() => {
                      const organizer = MOCK_PERSONALS.find(
                        (p) => p._id === selectedEvent.organizerId
                      );
                      return organizer ? (
                        <div className="flex items-center mb-6">
                          <img
                            src={organizer.avatarUrl}
                            alt=""
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {organizer.fullname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {organizer.position}
                            </p>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Trạng thái:</span>
                        <span className="font-medium text-green-600">
                          {selectedEvent.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Số lượng:</span>
                        <span className="font-medium">
                          {selectedEvent.participantsCount} người
                        </span>
                      </div>
                    </div>

                    {!registerSuccess ? (
                      <button
                        onClick={handleRegister}
                        disabled={
                          isRegistering ||
                          selectedEvent.status === EventStatus.COMPLETED
                        }
                        className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center
                                            ${
                                              selectedEvent.status ===
                                              EventStatus.COMPLETED
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
                                            }
                                        `}
                      >
                        {isRegistering ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Đang xử lý...
                          </>
                        ) : selectedEvent.status === EventStatus.COMPLETED ? (
                          "Sự kiện đã kết thúc"
                        ) : (
                          "Đăng Ký Tham Gia"
                        )}
                      </button>
                    ) : (
                      <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center animate-in zoom-in">
                        <Icons.CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="font-bold">Đăng ký thành công!</p>
                        <p className="text-xs mt-1">
                          BTC sẽ gửi thông tin chi tiết qua email.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
