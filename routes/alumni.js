const express = require("express");
const db = require("../database/db");
const { DEPARTMENTS } = require("../config/constants");
const { requireLogin } = require("../middleware/auth");
const { uploadPhoto, removeUpload } = require("../middleware/upload");
const { profileValues, validateProfile } = require("../utils/validate");

const router = express.Router();
// ==========================================
// 1. READ: Alumni Directory & Single Profile
// ==========================================
router.get("/alumni", requireLogin, async (req, res) => {
    const q = (req.query.q || req.query.search || "").trim();
    const dept = (req.query.dept || req.query.department || "").trim();

    let sql = "SELECT id, full_name, email, degree, department, graduation_year, city, country, company, current_job, profile_photo FROM alumni WHERE 1=1";
    const params = [];

    if (q) {
        sql += " AND (full_name LIKE ? OR city LIKE ? OR company LIKE ?)";
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (dept) {
        sql += " AND department = ?";
        params.push(dept);
    }

    sql += " ORDER BY graduation_year DESC, full_name ASC";
    const [alumni] = await db.query(sql, params);

    res.render("directory", {
        title: "Alumni Directory",
        alumni,
        departments: DEPARTMENTS,
        q,
        dept,
        filters: { search: q, department: dept }
    });
});

// Read logged-in user's own profile
router.get("/profile", requireLogin, async (req, res) => {
    const [rows] = await db.query("SELECT * FROM alumni WHERE id = ?", [req.session.user.id]);
    const person = rows[0];

    if (!person) {
        req.flash("danger", "Profile not found.");
        return res.redirect("/dashboard");
    }

    res.render("profile", { title: "My Profile", person, isOwner: true });
});

// Read another alumni member's profile by ID
router.get("/alumni/:id", requireLogin, async (req, res) => {
    const [rows] = await db.query("SELECT * FROM alumni WHERE id = ?", [req.params.id]);
    const person = rows[0];

    if (!person) {
        return res.status(404).render("error", {
            title: "Not Found",
            status: 404,
            message: "Alumni profile not found."
        });
    }

    res.render("profile", {
        title: person.full_name,
        person,
        isOwner: person.id === req.session.user.id
    });
});

// ==========================================
// 2. UPDATE: Edit Logged-In User's Profile
// ==========================================
router.get("/profile/edit", requireLogin, async (req, res) => {
    const [rows] = await db.query("SELECT * FROM alumni WHERE id = ?", [req.session.user.id]);
    const person = rows[0];

    res.render("edit-profile", {
        title: "Edit Profile",
        errors: [],
        person,
        departments: DEPARTMENTS
    });
});

router.post("/profile/edit", requireLogin, uploadPhoto, async (req, res) => {
    const userId = req.session.user.id;
    const [rows] = await db.query("SELECT * FROM alumni WHERE id = ?", [userId]);
    const current = rows[0];

    const values = profileValues(req.body);
    const errors = validateProfile(values);
    if (req.uploadError) errors.push(req.uploadError);

    if (errors.length) {
        if (req.file) removeUpload(req.file.filename);
        return res.status(400).render("edit-profile", {
            title: "Edit Profile",
            errors,
            person: { ...current, ...values },
            departments: DEPARTMENTS
        });
    }

    const updatedPhoto = req.file ? req.file.filename : current.profile_photo;

    await db.query("UPDATE alumni SET ? WHERE id = ?", [
        { ...values, profile_photo: updatedPhoto },
        userId
    ]);

    if (req.file && current.profile_photo) {
        removeUpload(current.profile_photo);
    }

    req.session.user.name = values.full_name;
    req.session.user.photo = updatedPhoto;

    req.flash("success", "Profile updated successfully!");
    req.session.save(() => res.redirect("/profile"));
});

// ==========================================
// 3. DELETE: Delete Account from MariaDB
// ==========================================
router.post("/profile/delete", requireLogin, async (req, res) => {
    const userId = req.session.user.id;
    const [rows] = await db.query("SELECT profile_photo FROM alumni WHERE id = ?", [userId]);
    const user = rows[0];

    await db.query("DELETE FROM alumni WHERE id = ?", [userId]);

    if (user && user.profile_photo) {
        removeUpload(user.profile_photo);
    }

    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

module.exports = router;