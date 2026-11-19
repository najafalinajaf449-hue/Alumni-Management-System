// Multer: profile photo upload (images only, max 2 MB)
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "..", "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const EXT_BY_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
};

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const unique = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
            cb(null, unique + EXT_BY_TYPE[file.mimetype]);
        }
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (EXT_BY_TYPE[file.mimetype]) return cb(null, true);
        cb(new Error("Profile photo must be a JPG, PNG, WEBP or GIF image."));
    }
});

// Wrapper: instead of crashing, store the upload problem on req so the route can show it
function uploadPhoto(req, res, next) {
    upload.single("profile_photo")(req, res, (err) => {
        if (err) {
            req.uploadError = err.code === "LIMIT_FILE_SIZE"
                ? "Profile photo must be smaller than 2 MB."
                : err.message;
        }
        next();
    });
}

// Delete a file from /public/uploads (ignore errors)
function removeUpload(filename) {
    if (!filename) return;
    fs.unlink(path.join(uploadDir, path.basename(filename)), () => {});
}

module.exports = { uploadPhoto, removeUpload };
