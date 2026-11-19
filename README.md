# Alumni Management System - Lab 7 (combined)

| Lab | Concept | Where it lives now |
|-----|---------|--------------------|
| 1 | HTML pages (home, login, register) | `views/home.ejs`, `login.ejs`, `register.ejs` |
| 2 | CSS styling (header, nav, cards, tables, footer) | `public/css/style.css` |
| 3 | Bootstrap 5 (navbar, cards, grid, forms) | all views, loaded via CDN in `partials/header.ejs` |
| 4 | Dashboard, directory + search, profile card, responsive layout | `dashboard.ejs`, `directory.ejs`, `profile.ejs` |
| 5/6 | Node + Express + EJS + MySQL + Multer | `app.js`, `routes/`, `database/`, `middleware/upload.js` |
| 7 | Sessions (login / logout / protected pages) + everything combined | `middleware/auth.js`, `routes/auth.js` |

## Run it
1. Install Node.js (v20+) and MySQL.
2. `mysql -u root -p < database/schema.sql`
3. `npm install`
4. `npm start`
5. Open http://localhost:3000

DB settings (default = same as Lab 5/6) are in `database/db.js`; they can be overridden with
env vars `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SESSION_SECRET`, `PORT`.
