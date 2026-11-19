const express = require("express");
const db = require("../database/db");
const { EMAIL_RE, clean } = require("../utils/validate");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

// Home page (public) - Lab 1/2/3 landing page, now with live data
router.get("/", async (req, res) => {
    const [recent] = await db.query(
        "SELECT id, full_name, degree, department, graduation_year FROM alumni ORDER BY created_at DESC, id DESC LIMIT 5"
    );
    res.render("home", { title: "Home", recent });
});

// Contact form submission (SMTP Email Integration)
router.post("/contact", async (req, res) => {
    const name = clean(req.body.name) || "";
    const email = (clean(req.body.email) || "").toLowerCase();
    const subject = clean(req.body.subject) || "New Alumni Portal Inquiry";
    const message = clean(req.body.message) || "";

    if (!name || !EMAIL_RE.test(email) || !message) {
        req.flash("danger", "Please provide your name, a valid email address, and a message.");
        return res.redirect("/#contact");
    }

    try {
        // 1. Send inquiry email to the site administrator
        await sendMail({
            to: process.env.SMTP_USER,
            subject: `Contact Form: ${subject} (from ${name})`,
            html: `
                <h3>New Contact Form Message</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, "<br>")}</p>
            `
        });

        // 2. Send confirmation copy to the sender
        await sendMail({
            to: email,
            subject: "We received your message - Alumni Management System",
            html: `
                <p>Hello ${name},</p>
                <p>Thank you for reaching out to AlumniConnect. We have received your message and will respond shortly.</p>
                <hr>
                <p><strong>Your Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
            `
        });

        req.flash("success", "Your message has been sent! A confirmation email is on its way.");
    } catch (err) {
        console.error("Contact form SMTP error:", err);
        req.flash("danger", "Failed to send your message. Please check SMTP configuration and try again.");
    }

    res.redirect("/");
});

module.exports = router;