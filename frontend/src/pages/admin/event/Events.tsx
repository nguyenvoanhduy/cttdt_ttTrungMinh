import React, { useState } from 'react';
import * as Icons from '@/components/Icons';
import { MOCK_EVENTS, MOCK_PERSONALS } from '@/constants';
import { EventStatus } from '@/types';

export const Events = () => {
  const [filter, setFilter] = useState('All');

  const filteredEvents = filter === 'All' 
    ? MOCK_EVENTS 
    : MOCK_EVENTS.filter(e => e.status === filter);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Quản lý Sự kiện</h1>
           <p className="text-gray-500 text-sm mt-1">Lên kế hoạch các lễ hội và hoạt động đạo sự</p>
        </div>
        <div className="flex gap-3">
             <div className="relative">
                <select 
                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">Tất cả trạng thái</option>
                    <option value={EventStatus.UPCOMING}>{EventStatus.UPCOMING}</option>
                    <option value={EventStatus.ONGOING}>{EventStatus.ONGOING}</option>
                    <option value={EventStatus.COMPLETED}>{EventStatus.COMPLETED}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <Icons.ChevronDown className="h-4 w-4" />
                </div>
             </div>
            <button className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Tạo sự kiện
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
             const organizer = MOCK_PERSONALS.find(p => p._id === event.organizerId);
             const isUpcoming = event.status === EventStatus.UPCOMING;
             
             return (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden group">
                    <div className="h-40 bg-gray-200 relative overflow-hidden">
                        <img 
                            src={event.bannerUrl || `https://picsum.photos/seed/${event._id}/800/400`} 
                            alt={event.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                                isUpcoming ? 'bg-white text-green-600' : 'bg-gray-800 text-white'
                            } shadow-sm`}>
                                {event.status}
                            </span>
                        </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="text-xs font-semibold text-primary-600 mb-1 uppercase tracking-wide">
                            {event.eventType}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.name}</h3>
                        
                        <div className="space-y-2 mt-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Icons.Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {new Date(event.startTime).toLocaleDateString()} • {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Icons.MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="truncate">{event.location}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                             <div className="flex items-center text-xs text-gray-500">
                                <span className="font-medium mr-1">Tổ chức:</span> {organizer ? organizer.fullname : 'N/A'}
                             </div>
                             <button className="text-gray-400 hover:text-primary-600">
                                <Icons.ArrowRight className="w-5 h-5" />
                             </button>
                        </div>
                    </div>
                </div>
             );
        })}
      </div>
    </div>
  );
};
