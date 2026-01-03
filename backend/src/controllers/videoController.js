import Video from "../models/Video.js";
import { logActivity } from "./activityLogController.js";

// CREATE
export const createVideo = async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    
    if (req.user) {
      await logActivity(req.user._id, 'CREATE_VIDEO', 'Video', video._id, req);
    }
    
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!video) return res.status(404).json({ message: "Không tìm thấy" });
    
    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_VIDEO', 'Video', req.params.id, req);
    }
    
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: "Không tìm thấy" });
    
    if (req.user) {
      await logActivity(req.user._id, 'DELETE_VIDEO', 'Video', req.params.id, req);
    }
    
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
