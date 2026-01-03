import express from "express";
import {
    // Album routes
    createAlbum,
    getAlbums,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    // Media routes
    uploadMedia,
    getMediaByAlbum,
    getAllMedia,
    updateMedia,
    deleteMedia,
    bulkUploadMedia
} from "../controllers/galleryController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ===== ALBUM ROUTES =====

// Create album (Admin, Trưởng Ban, Thành Viên)
router.post(
    "/albums",
    protectedRoute,
    authorizeRoles(["Admin", "Trưởng Ban", "Thành Viên"]),
    createAlbum
);

// Get all albums (Public)
router.get("/albums", getAlbums);

// Get specific album (Public)
router.get("/albums/:id", getAlbumById);

// Update album (Admin, Trưởng Ban, Thành Viên)
router.put(
    "/albums/:id",
    protectedRoute,
    authorizeRoles(["Admin", "Trưởng Ban", "Thành Viên"]),
    updateAlbum
);

// Delete album (Admin only)
router.delete(
    "/albums/:id",
    protectedRoute,
    authorizeRoles(["Admin"]),
    deleteAlbum
);

// ===== MEDIA ROUTES =====

// Upload single media to album
router.post(
    "/albums/:albumId/media",
    protectedRoute,
    authorizeRoles(["Admin", "Trưởng Ban", "Thành Viên"]),
    uploadMedia
);

// Bulk upload media to album
router.post(
    "/albums/:albumId/media/bulk",
    protectedRoute,
    authorizeRoles(["Admin", "Trưởng Ban", "Thành Viên"]),
    bulkUploadMedia
);

// Get all media in an album
router.get("/albums/:albumId/media", getMediaByAlbum);

// Get all media (across all albums)
router.get("/media", getAllMedia);

// Update media (Admin, Trưởng Ban, Thành Viên)
router.put(
    "/media/:id",
    protectedRoute,
    authorizeRoles(["Admin", "Trưởng Ban", "Thành Viên"]),
    updateMedia
);

// Delete media (Admin, Trưởng Ban, Thành Viên)
router.delete(
    "/media/:id",
    protectedRoute,
    authorizeRoles(["Admin", "Trưởng Ban", "Thành Viên"]),
    deleteMedia
);

export default router;
