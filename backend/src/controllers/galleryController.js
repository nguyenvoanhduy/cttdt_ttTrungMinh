import Album from "../models/Album.js";
import MediaFile from "../models/MediaFile.js";
import { logActivity } from "./activityLogController.js";

// ===== ALBUM CRUD =====

// CREATE ALBUM
export const createAlbum = async (req, res) => {
    try {
        const { title, coverImage, date, location, description, eventId } = req.body;
        const userId = req.user._id;

        const album = new Album({
            title,
            coverImage,
            date,
            location,
            description,
            eventId: eventId || null,
            isEvent: !!eventId,
            createdBy: userId
        });

        await album.save();
        
        await logActivity(userId, 'CREATE_ALBUM', 'Album', album._id, req);
        
        res.status(201).json({ success: true, data: album });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET ALL ALBUMS
export const getAlbums = async (req, res) => {
    try {
        const albums = await Album.find()
            .populate("createdBy", "name email")
            .populate("eventId", "name startTime")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: albums });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET ALBUM BY ID
export const getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("eventId", "name startTime");

        if (!album) {
            return res.status(404).json({ success: false, message: "Album không tồn tại" });
        }

        res.json({ success: true, data: album });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE ALBUM
export const updateAlbum = async (req, res) => {
    try {
        const { title, coverImage, date, location, description } = req.body;

        const album = await Album.findByIdAndUpdate(
            req.params.id,
            {
                title,
                coverImage,
                date,
                location,
                description,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate("createdBy", "name email");

        if (!album) {
            return res.status(404).json({ success: false, message: "Album không tồn tại" });
        }

        res.json({ success: true, data: album });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE ALBUM (và tất cả media của nó)
export const deleteAlbum = async (req, res) => {
    try {
        const album = await Album.findByIdAndDelete(req.params.id);
        if (!album) {
            return res.status(404).json({ success: false, message: "Album không tồn tại" });
        }

        // Xóa tất cả media trong album
        await MediaFile.deleteMany({ albumId: req.params.id });

        if (req.user) {
            await logActivity(req.user._id, 'DELETE_ALBUM', 'Album', req.params.id, req);
        }

        res.json({ success: true, message: "Đã xóa album thành công" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===== MEDIA FILE CRUD =====

// UPLOAD MEDIA TO ALBUM
export const uploadMedia = async (req, res) => {
    try {
        const { albumId, fileUrl, caption, fileType, thumbnailUrl, altText } = req.body;
        const userId = req.user._id;

        // Check album exists
        const album = await Album.findById(albumId);
        if (!album) {
            return res.status(404).json({ success: false, message: "Album không tồn tại" });
        }

        const media = new MediaFile({
            albumId,
            fileUrl,
            caption,
            fileType: fileType || "image",
            thumbnailUrl,
            altText,
            uploadedBy: userId
        });

        await media.save();
        
        await logActivity(userId, 'UPLOAD_MEDIA', 'MediaFile', media._id, req);
        
        res.status(201).json({ success: true, data: media });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET MEDIA BY ALBUM
export const getMediaByAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;

        // Verify album exists
        const album = await Album.findById(albumId);
        if (!album) {
            return res.status(404).json({ success: false, message: "Album không tồn tại" });
        }

        const media = await MediaFile.find({ albumId })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: media, count: media.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET ALL MEDIA
export const getAllMedia = async (req, res) => {
    try {
        const media = await MediaFile.find()
            .populate("albumId", "title")
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE MEDIA
export const updateMedia = async (req, res) => {
    try {
        const { caption, altText } = req.body;

        const media = await MediaFile.findByIdAndUpdate(
            req.params.id,
            {
                caption,
                altText,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate("uploadedBy", "name email");

        if (!media) {
            return res.status(404).json({ success: false, message: "Media không tồn tại" });
        }

        res.json({ success: true, data: media });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE MEDIA
export const deleteMedia = async (req, res) => {
    try {
        const media = await MediaFile.findByIdAndDelete(req.params.id);

        if (!media) {
            return res.status(404).json({ success: false, message: "Media không tồn tại" });
        }

        res.json({ success: true, message: "Đã xóa media thành công" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// BULK UPLOAD MEDIA
export const bulkUploadMedia = async (req, res) => {
    try {
        const { albumId, files } = req.body;
        const userId = req.user._id;

        // Check album exists
        const album = await Album.findById(albumId);
        if (!album) {
            return res.status(404).json({ success: false, message: "Album không tồn tại" });
        }

        // Validate files array
        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ success: false, message: "Files không hợp lệ" });
        }

        // Create media records
        const mediaRecords = files.map(file => ({
            albumId,
            fileUrl: file.fileUrl,
            caption: file.caption,
            fileType: file.fileType || "image",
            thumbnailUrl: file.thumbnailUrl,
            altText: file.altText,
            uploadedBy: userId
        }));

        const createdMedia = await MediaFile.insertMany(mediaRecords);

        res.status(201).json({ success: true, data: createdMedia, count: createdMedia.length });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
