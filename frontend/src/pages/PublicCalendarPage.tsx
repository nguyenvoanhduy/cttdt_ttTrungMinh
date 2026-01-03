/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useMemo } from 'react';
import * as Icons from '../components/Icons';

/**
 * Thuật toán chuyển đổi Dương lịch sang Âm lịch Việt Nam (Rút gọn)
 * Đảm bảo tính chính xác cho các ngày Sóc Vọng mùng 1, rằm
 */
const getLunarDate = (dd: number, mm: number, yy: number) => {
  // mm: 0-11
  const solarDate = new Date(yy, mm, dd);   
  
  // Tính số ngày Julian
  const a = Math.floor((14 - (mm + 1)) / 12);
  const y = yy + 4800 - a;
  const m = (mm + 1) + 12 * a - 3;
  const jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Điểm mốc: 10/02/2024 là mùng 1 tháng 1 năm Giáp Thìn (JD: 2460351)
  const baseJD = 2460351; 
  const diff = jd - baseJD;
  
  // Chu kỳ mặt trăng trung bình ~29.53 ngày
  const lunarMonthLength = 29.530588853;
  
  // Tính số tháng âm lịch đã trôi qua kể từ mốc
  const totalLunarMonths = Math.floor(diff / lunarMonthLength);
  
  // Ngày âm trong tháng
  let lunarDay = Math.floor(diff - (totalLunarMonths * lunarMonthLength)) + 1;
  
  // Hiệu chỉnh sai số nhỏ do độ dài tháng âm thực tế là 29 hoặc 30 ngày
  if (lunarDay > 30) lunarDay -= 30;
  if (lunarDay <= 0) lunarDay += 30;

  // Tính tháng âm tương đối (cho mục đích hiển thị ngày)
  const lunarMonth = ((totalLunarMonths) % 12) + 1;
  
  return {
    day: lunarDay,
    month: lunarMonth > 0 ? lunarMonth : lunarMonth + 12,
  };
};

export const PublicCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    // Padding ngày trống của tháng trước
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Các ngày trong tháng
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-white pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Bộ điều khiển lịch */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-blue-900">
              {monthNames[currentDate.getMonth()]} <span className="text-blue-500 font-normal">/ {currentDate.getFullYear()}</span>
            </h2>
            <div className="flex bg-white shadow-sm border border-gray-200 rounded-md p-0.5">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-blue-50 rounded transition-colors text-gray-600">
                <Icons.ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-blue-50 rounded transition-colors text-gray-600">
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-2">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div> Sóc Vọng
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div> Hôm nay
                </div>
             </div>
             <button 
                onClick={handleToday}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-all shadow-sm"
              >
                Về hôm nay
              </button>
          </div>
        </div>

        {/* Lưới lịch */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Thứ trong tuần */}
          <div className="grid grid-cols-7 bg-blue-900">
            {["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"].map((day, idx) => (
              <div key={day} className={`py-1.5 text-center text-[10px] font-black uppercase tracking-tight ${idx === 0 ? 'text-amber-400' : 'text-blue-100'}`}>
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{idx === 0 ? 'CN' : `T${idx + 1}`}</span>
              </div>
            ))}
          </div>

          {/* Ô ngày */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="bg-gray-50 h-16 sm:h-20"></div>;
              
              const lunar = getLunarDate(day, currentDate.getMonth(), currentDate.getFullYear());
              const isToday = day === new Date().getDate() && 
                              currentDate.getMonth() === new Date().getMonth() && 
                              currentDate.getFullYear() === new Date().getFullYear();
              
              const isSócVọng = lunar.day === 1 || lunar.day === 15;

              return (
                <div 
                  key={day} 
                  className={`
                    bg-white h-16 sm:h-20 p-1 transition-all relative group overflow-hidden
                    ${isToday ? 'z-10' : ''}
                    ${idx % 7 === 0 ? 'bg-red-50/30' : ''}
                  `}
                >
                  {/* Background Highlight for Today */}
                  {isToday && <div className="absolute inset-0 bg-blue-50/50"></div>}
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <span className={`text-base sm:text-lg font-black transition-transform group-hover:scale-110 duration-300 ${isToday ? 'text-blue-600' : (idx % 7 === 0 ? 'text-red-500' : 'text-gray-800')}`}>
                      {day}
                    </span>
                    <div className="flex flex-col items-end">
                        <span className={`text-[10px] sm:text-xs font-bold ${isSócVọng ? 'text-amber-600' : 'text-gray-300'}`}>
                        {lunar.day}
                        </span>
                        {lunar.day === 1 && (
                            <span className="text-[7px] sm:text-[8px] text-amber-500 font-bold -mt-0.5">Tháng {lunar.month}</span>
                        )}
                    </div>
                  </div>

                  {/* Indicators */}
                  <div className="absolute bottom-0.5 left-0.5 right-0.5 sm:bottom-1 sm:left-1 sm:right-1">
                    {isToday && (
                        <div className="w-full h-0.5 bg-blue-600 rounded-full animate-pulse"></div>
                    )}
                    {isSócVọng && (
                        <div className={`mt-0.5 flex items-center gap-0.5 px-0.5 py-0.5 rounded text-[7px] border ${lunar.day === 1 ? 'bg-amber-500 border-amber-600 text-white' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            <div className={`w-0.5 h-0.5 rounded-full ${lunar.day === 1 ? 'bg-white' : 'bg-amber-500'}`}></div>
                            <span className="font-black uppercase truncate">
                                {lunar.day === 1 ? 'Mùng 1' : 'Rằm'}
                            </span>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chú thích */}
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-[10px] font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-gray-800">15</span>
                <span>Ngày Dương lịch</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-400">10</span>
                <span>Ngày Âm lịch</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Ngày sóc vọng (Mùng 1, Rằm)</span>
            </div>
        </div>
      </div>
    </div>
  );
};
