import React from 'react';
//import * as Icons from '@/components/Icons';
import { MOCK_LOGS } from '@/constants';

export const ActivityLogs = () => {
  return (
    <div className="p-8">
       <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nhật ký hoạt động</h1>
        <p className="text-gray-500 text-sm">Theo dõi các thay đổi trong hệ thống</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thực hiện</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đối tượng (Target)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_LOGS.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200 font-mono">
                                {log.action}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {log.targetCollection} : <span className="text-blue-600 font-mono text-xs">{log.targetId}</span>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                            {log.ip}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
