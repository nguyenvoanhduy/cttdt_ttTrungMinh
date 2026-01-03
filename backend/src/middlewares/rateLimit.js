const userRequestMap = new Map();

export const rateLimit = (req, res, next) => {
  const userId = req.body.userId;
  const now = Date.now();

  if (!userRequestMap.has(userId)) {
    userRequestMap.set(userId, []);
  }

  const timestamps = userRequestMap.get(userId)
    .filter(t => now - t < 60000); // 1 phút

  if (timestamps.length >= 5) {
    return res.status(429).json({
      error: "Bạn gửi quá nhanh, vui lòng chờ."
    });
  }

  timestamps.push(now);
  userRequestMap.set(userId, timestamps);

  next();
};
