
import * as Icons from '../components/Icons';

export const ContactPage = () => {
  return (
    <div className="animate-in fade-in duration-500 bg-gray-50 min-h-screen">
        {/* Banner */}
       <div className="bg-blue-900 py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="font-serif text-5xl font-bold mb-4">Liên Hệ</h1>
          <div className="w-24 h-1 bg-amber-400 mx-auto mb-6"></div>
          <p className="text-blue-200 text-xl max-w-2xl mx-auto">Thông tin kết nối dành cho quý đạo hữu và khách viếng thăm</p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <Icons.MapPin className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">Địa Chỉ</h4>
                    <p className="text-gray-600 leading-relaxed">
                        609-611 Đ. Bình Thới, Phường 10 <br/>
                        Quận 11, Thành phố Hồ Chí Minh
                    </p>
                    <a 
                        href="https://maps.app.goo.gl/JANc5qLwaXKRdYhn6" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-6 text-blue-600 font-bold text-sm hover:underline flex items-center justify-center"
                    >
                        Xem trên Google Maps <Icons.ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                        <Icons.Phone className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">Điện Thoại</h4>
                    <p className="text-gray-600 mb-1 font-bold text-lg">0966 967 440</p>
                    <p className="text-gray-500 text-sm">(Nguyễn Võ Anh Duy)</p>
                    <p className="text-gray-400 text-xs mt-4">Hỗ trợ: 07:00 - 17:00 (Thứ 2 - Thứ 6)</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                        <Icons.Mail className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-xl text-gray-900 mb-3">Email</h4>
                    <p className="text-gray-600 mb-2">thuha20042804@gmail.com</p>
                    <p className="text-gray-600">nguyenvoanhduy1@gmail.com</p>
                </div>
            </div>

            {/* Map & Visitation Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* Google Maps Embed */}
                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-[400px] lg:h-auto relative group">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6323986978045!2d106.6426436!3d10.762787999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752e90f2d93c39%3A0x1eaf6c265af3057c!2zVGjDoW5oIHRo4bqldCBUcnVuZyBNaW5o!5e0!3m2!1svi!2s!4v1767340380668!5m2!1svi!2s"
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Bản đồ Thánh Thất Trung Minh"
                        className="w-full h-full"
                    />
                    <a 
                        href="https://maps.app.goo.gl/JANc5qLwaXKRdYhn6" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Icons.MapPin className="w-4 h-4" />
                        Mở trong Google Maps
                    </a>
                </div>

                {/* Visitation Rules */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                        <Icons.Info className="w-6 h-6 mr-3 text-blue-600" />
                        Thông Tin Viếng Thăm
                    </h3>
                    
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">1</div>
                            <div>
                                <h5 className="font-bold text-gray-900 mb-1">Trang phục khi vào Chánh điện</h5>
                                <p className="text-gray-600 text-sm leading-relaxed">Quý đạo hữu mặc đạo phục (áo dài trắng), quý khách viếng thăm vui lòng mặc trang phục lịch sự, kín đáo (quần dài, áo có tay).</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">2</div>
                            <div>
                                <h5 className="font-bold text-gray-900 mb-1">Giờ mở cửa tham quan</h5>
                                <p className="text-gray-600 text-sm leading-relaxed">Khuôn viên Thánh Thất mở cửa từ 07:00 đến 17:00 hằng ngày. Quý khách vui lòng giữ trật tự chung.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">3</div>
                            <div>
                                <h5 className="font-bold text-gray-900 mb-1">Quay phim & Chụp ảnh</h5>
                                <p className="text-gray-600 text-sm leading-relaxed">Được phép chụp ảnh lưu niệm ở khuôn viên ngoài. Hạn chế quay phim chụp ảnh trong lúc đang diễn ra các thời cúng chính lễ.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-4">
                        <Icons.Phone className="w-8 h-8 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-amber-900 font-bold">Cần hỗ trợ đón tiếp đoàn?</p>
                            <p className="text-amber-800 text-sm">Vui lòng liên hệ hotline trước 24h để được sắp xếp chu đáo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
