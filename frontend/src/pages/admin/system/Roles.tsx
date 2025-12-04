import React from 'react';
//import * as Icons from '@/components/Icons';
import { MOCK_USERS, MOCK_PERSONALS } from '@/constants';

export const Roles = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Tài khoản & Phân quyền</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý quyền truy cập hệ thống</p>
         </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tên người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Số điện thoại</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vai trò (Role)</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {MOCK_USERS.map(user => {
                    const personal = MOCK_PERSONALS.find(p => p._id === user.personalId);
                    return (
                        <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs mr-3">
                                        {personal ? personal.fullname.charAt(0) : 'U'}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">{personal ? personal.fullname : 'Unknown'}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {user.phoneNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                    user.role === 'Trưởng Ban' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-4">Sửa</button>
                                <button className="text-gray-400 hover:text-red-600">Khóa</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};
