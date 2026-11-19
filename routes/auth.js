const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { DEPARTMENTS } = require("../config/constants");
const { redirectIfLoggedIn } = require("../middleware/auth");
const { uploadPhoto, removeUpload } = require("../middleware/upload");
const { EMAIL_RE, clean, profileValues, validateProfile } = require("../utils/validate");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

// ---------- Register ----------
router.get("/register", redirectIfLoggedIn, (req, res) => {
    res.render("register", { title: "Register", errors: [], old: {}, departments: DEPARTMENTS });
});

router.post("/register", redirectIfLoggedIn, uploadPhoto, async (req, res) => {
    const values = profileValues(req.body);
    const email = (clean(req.body.email) || "").toLowerCase();
    const password = req.body.password || "";
    const errors = validateProfile(values);

    if (req.uploadError) errors.push(req.uploadError);
    if (!EMAIL_RE.test(email)) errors.push("Enter a valid email address.");
    if (password.length < 6) errors.push("Password must be at least 6 characters.");
    if (password !== req.body.confirm_password) errors.push("Passwords do not match.");

    if (!errors.length) {
        const [existing] = await db.query("SELECT id FROM alumni WHERE email = ?", [email]);
        if (existing.length) errors.push("An account with this email already exists.");
    }

    const fail = (list) => {
        if (req.file) removeUpload(req.file.filename);
        return res.status(400).render("register", {
            title: "Register", errors: list, old: { ...values, email }, departments: DEPARTMENTS
        });
    };
    if (errors.length) return fail(errors);

    try {
        const hash = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO alumni SET ?", {
            ...values,
            email,
            password: hash,
            profile_photo: req.file ? req.file.filename : null
        });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return fail(["An account with this email already exists."]);
        if (req.file) removeUpload(req.file.filename);
        throw err;
    }

    // ---------- Send Welcome SMTP Email ----------
    try {
        await sendMail({
            to: email,
            subject: "Welcome to the Alumni Management System!",
            html: `
                <h2>Welcome, ${values.full_name || "Alumni"}!</h2>
                <p>Thank you for registering with the Alumni Management System.</p>
                <p>You can now <a href="http://localhost:${process.env.PORT || 3000}/login">log in</a> to update your profile and connect with fellow alumni.</p>
            `
        });
        req.flash("success", "Registration successful! A welcome email has been sent. Please log in.");
    } catch (mailErr) {
        console.error("Registration email failed:", mailErr);
        req.flash("success", "Registration successful! (Welcome email could not be delivered.) Please log in.");
    }

    res.redirect("/login");
});

// ---------- Login ----------
router.get("/login", redirectIfLoggedIn, (req, res) => {
    res.render("login", { title: "Login", error: null, email: "" });
});

router.post("/login", redirectIfLoggedIn, async (req, res, next) => {
    const email = (clean(req.body.email) || "").toLowerCase();
    const password = req.body.password || "";

    const [rows] = await db.query(
        "SELECT id, full_name, password, profile_photo FROM alumni WHERE email = ?", [email]
    );
    const user = rows[0];
    const ok = user && await bcrypt.compare(password, user.password);

    if (!ok) {
        // same message for "no such email" and "wrong password" on purpose
        return res.status(401).render("login", { title: "Login", error: "Invalid email or password.", email });
    }

    // new session id on login (prevents session fixation)
    req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = { id: user.id, name: user.full_name, photo: user.profile_photo };
        req.flash("success", `Welcome back, ${user.full_name}!`);
        req.session.save(() => res.redirect("/dashboard"));
    });
});

// ---------- Logout ----------
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

module.exports = router;