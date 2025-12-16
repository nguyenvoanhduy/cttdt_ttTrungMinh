
import * as Icons from '../components/Icons';

export const ContactPage = () => {
  return (
    <div className="animate-in fade-in duration-500">
        {/* Banner */}
       <div className="bg-blue-900 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="font-serif text-4xl font-bold mb-4">Liên Hệ</h1>
          <p className="text-blue-200 text-lg">Gửi ý kiến đóng góp hoặc liên hệ với Ban Cai Quản</p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Contact Info */}
            <div className="lg:w-1/3">
                <h3 className="font-bold text-2xl text-gray-900 mb-6">Thông Tin Liên Lạc</h3>
                <div className="space-y-6">
                    <div className="flex items-start">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
                            <Icons.MapPin className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                            <h4 className="font-bold text-gray-900">Địa chỉ</h4>
                            <p className="text-gray-600 mt-1">Ấp An Thuận A, Xã Mỹ Thạnh An, TP. Bến Tre, Tỉnh Bến Tre</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-1">
                            <Icons.Phone className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                            <h4 className="font-bold text-gray-900">Điện thoại</h4>
                            <p className="text-gray-600 mt-1">0275 3822 xxx</p>
                            <p className="text-sm text-gray-500">Thứ 2 - Thứ 6: 7h - 17h</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                         <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
                            <Icons.Mail className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                            <h4 className="font-bold text-gray-900">Email</h4>
                            <p className="text-gray-600 mt-1">vanphong@thanhthattrungminh.org</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2">Ghi chú cho khách viếng thăm</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Quý khách đến viếng vui lòng ăn mặc lịch sự, kín đáo. Giữ trật tự trong khuôn viên Nội ô và tuân thủ các quy định của Thánh Thất.
                    </p>
                </div>
            </div>

            {/* Form & Map */}
            <div className="lg:w-2/3">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
                    <h3 className="font-bold text-2xl text-gray-900 mb-6">Gửi Tin Nhắn</h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Nguyễn Văn A" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="email@example.com" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                             <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                                <option>Hỏi đáp giáo lý</option>
                                <option>Đăng ký công quả</option>
                                <option>Xin thỉnh kinh sách</option>
                                <option>Khác</option>
                             </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                            <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Nội dung tin nhắn..."></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <button type="button" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                Gửi Tin Nhắn
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
