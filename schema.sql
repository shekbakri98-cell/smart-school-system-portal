CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Teacher', 'Student') DEFAULT 'Student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
    studentId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    test1 INT DEFAULT 0,
    test2 INT DEFAULT 0,
    assignment INT DEFAULT 0,
    finalExam INT DEFAULT 0,
    totalScore INT GENERATED ALWAYS AS (test1 + test2 + assignment + finalExam) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(50) NOT NULL,
    trackingDate DATE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL,
    notes TEXT NULL,
    recordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(studentId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default administrator access parameters safely avoiding duplication rules
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@hub.edu', 'S3cure_M0dern_Pa55w0rd_2026!', 'Admin')
ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    password = VALUES(password);
