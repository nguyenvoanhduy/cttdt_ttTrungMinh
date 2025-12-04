
import React from 'react';
import * as Icons from '../components/Icons';

export const AboutPage = () => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-blue-900 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="font-serif text-4xl font-bold mb-4">Giới Thiệu</h1>
          <p className="text-blue-200 text-lg">Lịch sử hình thành và sứ mệnh của Thánh Thất Trung Minh</p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Section 1: History */}
        <div className="flex flex-col md:flex-row gap-12 mb-20 items-center">
            <div className="md:w-1/2">
                <div className="relative">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tay_Ninh_Holy_See.jpg/800px-Tay_Ninh_Holy_See.jpg" 
                        alt="Lịch sử" 
                        className="rounded-xl shadow-lg w-full"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-amber-400 p-6 rounded-lg shadow-lg text-amber-950">
                        <span className="block text-4xl font-bold">70</span>
                        <span className="block text-sm font-semibold uppercase">Năm Hình Thành</span>
                    </div>
                </div>
            </div>
            <div className="md:w-1/2">
                <h2 className="text-amber-600 font-bold uppercase tracking-widest text-sm mb-2">Lịch sử</h2>
                <h3 className="font-serif text-3xl font-bold text-gray-900 mb-6">Khởi Nguyên & Phát Triển</h3>
                <div className="prose prose-blue text-gray-600">
                    <p className="mb-4">
                        Thánh Thất Trung Minh được thành lập vào năm 1954, trong bối cảnh Đạo Cao Đài đang phát triển mạnh mẽ tại khu vực miền Tây Nam Bộ. 
                        Ban đầu, Thánh Thất chỉ là một ngôi thờ tạm bằng tre lá đơn sơ, là nơi quy tụ của một nhóm nhỏ tín đồ địa phương.
                    </p>
                    <p className="mb-4">
                        Trải qua bao thăng trầm của lịch sử đất nước, ngôi Thánh Thất đã nhiều lần được trùng tu và xây dựng lại. 
                        Năm 1970, với sự đóng góp công sức và tiền của của đông đảo Nhơn sanh, ngôi Thánh Thất kiên cố hiện nay đã được khánh thành 
                        với kiến trúc đặc trưng của Đạo: Hiệp Thiên Đài sừng sững, Cửu Trùng Đài uy nghiêm và Bát Quái Đài linh thiêng.
                    </p>
                    <p>
                        Ngày nay, Thánh Thất Trung Minh không chỉ là nơi sinh hoạt tôn giáo mà còn là trung tâm văn hóa, 
                        từ thiện của cộng đồng, luôn đi đầu trong các phong trào an sinh xã hội tại địa phương.
                    </p>
                </div>
            </div>
        </div>

        {/* Section 2: Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <Icons.Home className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Sứ Mệnh</h4>
                <p className="text-gray-600 leading-relaxed">
                    Hoằng khai Đại Đạo, phổ độ chúng sanh, hướng dẫn tín đồ tu hành theo tôn chỉ Chân - Thiện - Mỹ.
                </p>
            </div>
            <div className="bg-amber-50 p-8 rounded-xl border border-amber-100 text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                    <Icons.Users className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Cộng Đồng</h4>
                <p className="text-gray-600 leading-relaxed">
                    Xây dựng một cộng đồng tín đồ đoàn kết, thương yêu, giúp đỡ lẫn nhau và đóng góp tích cực cho xã hội.
                </p>
            </div>
             <div className="bg-green-50 p-8 rounded-xl border border-green-100 text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                    <Icons.Briefcase className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Phụng Sự</h4>
                <p className="text-gray-600 leading-relaxed">
                    Thực hành hạnh Phước Thiện, chia sẻ khó khăn với những mảnh đời bất hạnh, lan tỏa tình thương yêu đại đồng.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
