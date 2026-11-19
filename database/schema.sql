-- Run this ONCE as the MySQL root user:
--   mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS alumni_management
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Same user/password you used in Lab 5/6 (safe to run if it already exists)
CREATE USER IF NOT EXISTS 'alumni_node'@'localhost' IDENTIFIED BY 'Node@123';
GRANT ALL PRIVILEGES ON alumni_management.* TO 'alumni_node'@'localhost';
FLUSH PRIVILEGES;

USE alumni_management;

-- WARNING: this removes the old Lab 5/6 "alumni" table (its rows had no passwords,
-- so those accounts could not log in anyway). Delete this line to keep it.
DROP TABLE IF EXISTS alumni;

CREATE TABLE alumni (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(100),
    gender          VARCHAR(10),
    date_of_birth   DATE,
    student_id      VARCHAR(100),
    degree          VARCHAR(100),
    department      VARCHAR(100),
    graduation_year INT,
    current_job     VARCHAR(100),
    company         VARCHAR(100),
    city            VARCHAR(100),
    country         VARCHAR(100),
    address         TEXT,
    password        VARCHAR(255) NOT NULL,   -- stores a bcrypt hash, never plain text
    profile_photo   VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
