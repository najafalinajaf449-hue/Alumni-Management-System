function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash("warning", "Please log in to access that page.");
    res.redirect("/login");
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect("/dashboard");
    }
    next();
}

module.exports = {
    requireLogin,
    redirectIfLoggedIn,
    isAuthenticated: requireLogin,
    isGuest: redirectIfLoggedIn
};