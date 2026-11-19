const { DEPARTMENTS } = require("../config/constants");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// trim text; empty string -> null (so MySQL gets NULL instead of "")
function clean(v) {
    if (typeof v !== "string") return null;
    v = v.trim();
    return v === "" ? null : v;
}

// Pull the profile fields out of req.body
function profileValues(body) {
    const year = parseInt(body.graduation_year, 10);
    return {
        full_name: clean(body.full_name),
        phone: clean(body.phone),
        gender: ["Male", "Female"].includes(body.gender) ? body.gender : null,
        date_of_birth: clean(body.date_of_birth),
        student_id: clean(body.student_id),
        degree: clean(body.degree),
        department: clean(body.department),
        graduation_year: Number.isInteger(year) ? year : null,
        current_job: clean(body.current_job),
        company: clean(body.company),
        city: clean(body.city),
        country: clean(body.country),
        address: clean(body.address)
    };
}

// Returns an array of error messages (empty array = valid)
function validateProfile(v) {
    const errors = [];
    const maxYear = new Date().getFullYear() + 6;

    if (!v.full_name) errors.push("Full name is required.");
    if (!v.department || !DEPARTMENTS.includes(v.department)) errors.push("Please choose a department.");
    if (v.graduation_year === null || v.graduation_year < 1950 || v.graduation_year > maxYear)
        errors.push(`Graduation year must be between 1950 and ${maxYear}.`);
    if (v.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(v.date_of_birth))
        errors.push("Date of birth is not valid.");

    for (const [key, val] of Object.entries(v)) {
        const limit = key === "address" ? 500 : 100;
        if (typeof val === "string" && val.length > limit)
            errors.push(`"${key.replace(/_/g, " ")}" is too long (max ${limit} characters).`);
    }
    return errors;
}

module.exports = { EMAIL_RE, clean, profileValues, validateProfile };
