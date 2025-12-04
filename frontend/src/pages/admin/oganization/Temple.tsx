import React from 'react';
import * as Icons from '@/components/Icons';
import { MOCK_TEMPLES } from '@/constants';

export const Temple = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Thánh Thất & Cơ Sở</h1>
           <p className="text-gray-500 text-sm mt-1">Quản lý các cơ sở thờ tự trực thuộc</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 shadow-sm transition-colors">
            <Icons.Plus className="w-4 h-4 mr-2" />
            Thêm Thánh Thất
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_TEMPLES.map(temple => (
            <div key={temple._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                    <Icons.Home className="w-12 h-12 text-white opacity-80" />
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{temple.name}</h3>
                    <div className="space-y-3">
                        <div className="flex items-start text-sm text-gray-600">
                            <Icons.MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                            {temple.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Icons.Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            Thành lập: {new Date(temple.establishedDate).getFullYear()}
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 line-clamp-2">
                        {temple.description}
                    </p>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                            <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50">
                            <Icons.Trash className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
