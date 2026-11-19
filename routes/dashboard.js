const express = require("express");
const db = require("../database/db");
const { requireLogin } = require("../middleware/auth");
const router = express.Router();

// Dashboard (Lab 4 stat cards, now calculated from MySQL)
router.get("/dashboard", requireLogin, async (req, res) => {
    const [[stats]] = await db.query(`
        SELECT
            COUNT(*)                                        AS total,
            COUNT(DISTINCT department)                      AS departments,
            COUNT(DISTINCT city)                            AS cities,
            COALESCE(SUM(created_at >= NOW() - INTERVAL 30 DAY), 0) AS newMembers
        FROM alumni
    `);

    const [recent] = await db.query(
        `SELECT id, full_name, graduation_year, department, profile_photo
         FROM alumni ORDER BY created_at DESC, id DESC LIMIT 5`
    );

    res.render("dashboard", { title: "Dashboard", stats, recent });
});

module.exports = router;
