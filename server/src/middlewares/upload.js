import multer from "multer";
import path from "path";

// Files land in memory first; sharp processes them (resize + WebP conversion)
// before writing to disk, so we never store an unoptimized original.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024 },
});
