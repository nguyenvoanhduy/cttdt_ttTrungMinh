/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from '../components/Icons';
import { EventStatus, type Event } from '../types';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        
        // Handle different response structures
        const eventsArray = data.data || data || [];
        
        // Filter upcoming and ongoing events only
        const upcomingEvents = eventsArray
          .filter((event: Event) => 
            event.status === EventStatus.UPCOMING || 
            event.status === EventStatus.ONGOING
          )
          .sort((a: Event, b: Event) => {
            // Ưu tiên sự kiện có nhiều người đăng ký nhất
            const countA = a.participantsCount || 0;
            const countB = b.participantsCount || 0;
            
            if (countB !== countA) {
              return countB - countA; // Nhiều người đăng ký hơn lên trước
            }
            
            // Nếu số người đăng ký bằng nhau, ưu tiên sự kiện gần hơn
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          })
          .slice(0, 3);
        
        setEvents(upcomingEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId: string) => {
    navigate('/events');
  };

  return (
    <>
      {/* --- HERO SECTION (REDESIGNED) --- */}
      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden bg-white">
        <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
                
                {/* Left Content */}
                <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                    <h2 className="text-blue-500 font-bold tracking-widest text-sm uppercase mb-3 animate-in slide-in-from-bottom-5 duration-700">
                        Cổng thông tin điện tử
                    </h2>
                    <h1 className="font-sans text-5xl md:text-6xl lg:text-7xl font-extrabold text-blue-600 leading-tight mb-6 animate-in slide-in-from-bottom-5 duration-700 delay-100">
                        THÁNH THẤT <br/>
                        <span className="text-blue-500">TRUNG MINH</span>
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 animate-in slide-in-from-bottom-5 duration-700 delay-200">
                        Nơi cập nhật tin tức, sự kiện về hoạt động của 
                        Thánh Thất Trung Minh – kết nối cộng đồng Đạo hữu gần xa.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in slide-in-from-bottom-5 duration-700 delay-300">
                        <Link to="/events" className="px-8 py-4 bg-secondary text-amber-900 font-bold rounded-lg shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center">
                            Xem chi tiết hoạt động
                        </Link>
                        <Link to="/about" className="px-8 py-4 bg-white text-blue-900 border border-gray-200 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                            Tìm hiểu thêm
                        </Link>
                    </div>
                </div>

                {/* Right Image */}
                <div className="w-full lg:w-1/2 relative animate-in zoom-in duration-1000">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                         <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent pointer-events-none z-10"></div>
                         <img 
                            src="/anhThanhThat.png"
                            alt="Thánh Thất Trung Minh" 
                            className="w-full h-full object-cover aspect-[4/3] transform hover:scale-105 transition-transform duration-1000"
                        />
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-100 rounded-full blur-3xl -z-10"></div>
                </div>

            </div>
        </div>
      </section>

      {/* --- STATS & INTRO --- */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-6 md:px-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                  <h2 className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-2">Giới thiệu chung</h2>
                  <h3 className="font-serif text-4xl text-gray-900 font-bold mb-6">70 Năm Hình Thành & Phát Triển</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Thánh Thất Trung Minh được thành lập với sứ mệnh hoằng khai Đại Đạo, phổ độ chúng sanh. 
                    Trải qua nhiều thăng trầm lịch sử, nơi đây đã trở thành điểm tựa tâm linh vững chắc cho hàng ngàn tín đồ.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    Chúng tôi duy trì các hoạt động cúng tế thường nhật, các lớp giáo lý và đặc biệt là các chương trình 
                    từ thiện xã hội, giúp đỡ những hoàn cảnh khó khăn trong khu vực.
                  </p>
                  <Link to="/about" className="text-blue-600 font-semibold hover:text-blue-800 inline-flex items-center group">
                    Xem lịch sử hình thành 
                    <Icons.ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white shadow-sm p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Users className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">120+</div>
                      <div className="text-gray-500 text-sm">Tín đồ</div>
                  </div>
                  <div className="bg-white shadow-sm p-6 rounded-2xl text-center translate-y-8 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Home className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">1954</div>
                      <div className="text-gray-500 text-sm">Năm thành lập</div>
                  </div>
                  <div className="bg-white shadow-sm p-6 rounded-2xl text-center hover:shadow-md transition-shadow">
                       <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Briefcase className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                      <div className="text-gray-500 text-sm">Hoạt động thiện nguyện</div>
                  </div>
                  <div className="bg-white shadow-sm p-6 rounded-2xl text-center translate-y-8 hover:shadow-md transition-shadow">
                       <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.BookOpen className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
                      <div className="text-gray-500 text-sm">Tài liệu giáo lý</div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- UPCOMING EVENTS --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-2">Lịch Sắp Tới</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-gray-900 font-bold">Sự Kiện Nổi Bật</h3>
            </div>
            <Link to="/events" className="hidden md:flex items-center px-6 py-3 border border-gray-300 rounded-full hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all font-medium">
              Xem tất cả
              <Icons.ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Đang tải sự kiện...</p>
              </div>
            ) : events.length > 0 ? events.map(event => (
              <div 
                key={event._id} 
                onClick={() => handleEventClick(event._id)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                   <img 
                      src={event.bannerUrl || `https://picsum.photos/seed/${event._id}/800/600`} 
                      alt={event.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                   />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-center p-2 rounded-lg shadow-sm min-w-[60px]">
                      <span className="block text-sm font-bold text-gray-500 uppercase">
                        {new Date(event.startTime).toLocaleString('vi-VN', { month: 'short' })}
                      </span>
                      <span className="block text-2xl font-bold text-blue-600">
                        {new Date(event.startTime).getDate()}
                      </span>
                   </div>
                   <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        event.status === EventStatus.UPCOMING
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {event.status === EventStatus.UPCOMING ? "Sắp diễn ra" : "Đang diễn ra"}
                      </span>
                   </div>
                </div>
                <div className="p-6">
                   <div className="text-xs font-bold text-amber-600 uppercase mb-2 tracking-wide">
                     {typeof event.eventType === 'object' && event.eventType !== null && 'name' in event.eventType 
                       ? (event.eventType as { name: string }).name 
                       : event.eventType || 'Sự kiện'}
                   </div>
                   <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                     {event.name}
                   </h4>
                   <div className="flex items-center text-gray-500 text-sm mb-4">
                      <Icons.Clock className="w-4 h-4 mr-2" />
                      {new Date(event.startTime).toLocaleString('vi-VN', {
                        hour: '2-digit', 
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                   </div>
                   <div className="flex items-center justify-between text-gray-500 text-sm border-t border-gray-100 pt-4">
                      <div className="flex items-center">
                        <Icons.MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.participantsCount && event.participantsCount > 0 && (
                        <div className="flex items-center text-blue-600 font-semibold ml-2">
                          <Icons.Users className="w-4 h-4 mr-1" />
                          <span className="text-xs">{event.participantsCount}</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl">
                <Icons.Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Chưa có sự kiện sắp diễn ra</p>
                <Link 
                  to="/events" 
                  className="text-blue-600 font-semibold hover:text-blue-800 inline-flex items-center"
                >
                  Xem tất cả sự kiện
                  <Icons.ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- LIBRARY HIGHLIGHT --- */}
      <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-800 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-600 rounded-full opacity-30 blur-3xl"></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
           <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                 <h2 className="text-amber-400 font-bold tracking-wider uppercase text-sm mb-2">Thư Viện Số</h2>
                 <h3 className="font-serif text-4xl font-bold mb-6">Kho Tàng Giáo Lý & <br/>Âm Nhạc Đạo</h3>
                 <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                    Truy cập miễn phí hàng trăm tài liệu giáo lý, kinh sách và các bài thánh ca. 
                    Nền tảng giúp tín đồ dễ dàng tu học và tìm hiểu về Đại Đạo mọi lúc, mọi nơi.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/library" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center">
                        <Icons.BookOpen className="w-5 h-5 mr-2" />
                        Đọc Sách
                    </Link>
                    <Link to="/library" className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center">
                        <Icons.Music className="w-5 h-5 mr-2" />
                        Nghe Nhạc
                    </Link>
                 </div>
              </div>
              <div className="lg:w-1/2 relative">
                 <div className="grid grid-cols-2 gap-4">
                     <img src="https://picsum.photos/id/24/300/400" className="rounded-2xl shadow-2xl transform translate-y-8 border-4 border-white/10" alt="Book Cover" />
                     <img src="https://picsum.photos/id/26/300/400" className="rounded-2xl shadow-2xl border-4 border-white/10" alt="Song Cover" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- NEWSLETTER --- */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-6 md:px-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Đăng Ký Nhận Thông Tin</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Để lại số điện thoại để nhận thông báo mới nhất về lịch cúng, các ngày lễ lớn và hoạt động của Thánh Thất.
            </p>
            <div className="max-w-md mx-auto flex gap-2">
                <input 
                    type="string" 
                    placeholder="Nhập số điện thoại của bạn..." 
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                    Đăng Ký
                </button>
            </div>
        </div>
      </section>
    </>
  );
};
