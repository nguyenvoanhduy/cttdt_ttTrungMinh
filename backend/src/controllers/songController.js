import Song from "../models/Song.js";
import { logActivity } from "./activityLogController.js";

// CREATE
export const createSong = async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();
    
    if (req.user) {
      await logActivity(req.user._id, 'CREATE_SONG', 'Song', song._id, req);
    }
    
    res.status(201).json(song);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!song) return res.status(404).json({ message: "Không tìm thấy" });
    
    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_SONG', 'Song', req.params.id, req);
    }
    
    res.json(song);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: "Không tìm thấy" });
    
    if (req.user) {
      await logActivity(req.user._id, 'DELETE_SONG', 'Song', req.params.id, req);
    }
    
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};