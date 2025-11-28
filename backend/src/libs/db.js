import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Kết nối đến MongoDB thành công');
    } catch (error) {
        console.error('Lỗi kết nối đến MongoDB:', error);
        process.exit(1);
    }
};