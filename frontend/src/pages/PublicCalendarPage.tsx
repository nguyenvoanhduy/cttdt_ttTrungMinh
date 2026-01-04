/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useMemo } from 'react';
import * as Icons from '../components/Icons';

/**
 * Thuật toán chuyển đổi Dương lịch sang Âm lịch Việt Nam
 * Dựa trên thuật toán của Hồ Ngọc Đức
 */
const PI = Math.PI;

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L - 360 * Math.floor(L / 360);
  return L;
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = Math.floor(sunLongitude(nm) / 30);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = Math.floor(sunLongitude(getNewMoonDay(k + i, timeZone)) / 30);
  do {
    last = arc;
    i++;
    arc = Math.floor(sunLongitude(getNewMoonDay(k + i, timeZone)) / 30);
  } while (arc !== last && i < 14);
  return i - 1;
}

const getLunarDate = (dd: number, mm: number, yy: number) => {
  const timeZone = 7; // GMT+7 cho Việt Nam
  const dayNumber = jdFromDate(dd, mm + 1, yy); // mm + 1 vì mm từ 0-11
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return {
    day: lunarDay,
    month: lunarMonth,
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
