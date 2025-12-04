import React from 'react';
import * as Icons from '@/components/Icons';
import { MOCK_DEPARTMENTS, MOCK_PERSONALS } from '@/constants';

export const Department = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Ban Chuyên Môn</h1>
           <p className="text-gray-500 text-sm mt-1">Danh sách các ban bộ và nhân sự phụ trách</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Icons.Plus className="w-4 h-4 mr-2" />
            Tạo Ban Mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Ban</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trưởng Ban (Manager)</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_DEPARTMENTS.map((dept) => {
                const manager = MOCK_PERSONALS.find(p => p._id === dept.managerId);
                return (
                  <tr key={dept._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            <Icons.Briefcase className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                          <div className="text-xs text-gray-500">ID: {dept._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md">{dept.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       {manager ? (
                         <div className="flex items-center">
                           <img className="h-8 w-8 rounded-full object-cover mr-2" src={manager.avatarUrl || `https://ui-avatars.com/api/?name=${manager.fullname}`} alt="" />
                           <span className="text-sm text-gray-700">{manager.fullname}</span>
                         </div>
                       ) : (
                         <span className="text-sm text-gray-400 italic">Chưa bổ nhiệm</span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Sửa</button>
                      <button className="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
