/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: allowances
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `allowances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memberid` int DEFAULT NULL,
  `month` varchar(20) DEFAULT NULL,
  `amount` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `memberid` (`memberid`, `month`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: attendance
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `attendance` (
  `memberid` int DEFAULT NULL,
  `month` varchar(20) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `present` tinyint(1) DEFAULT NULL,
  KEY `fk_memberid` (`memberid`),
  CONSTRAINT `fk_memberid` FOREIGN KEY (`memberid`) REFERENCES `employees` (`memberid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: employees
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `employees` (
  `name` varchar(100) DEFAULT NULL,
  `basic_salary` decimal(10, 2) DEFAULT NULL,
  `memberid` int NOT NULL,
  `NIC` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`memberid`),
  UNIQUE KEY `memberid` (`memberid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: plantation_attendance
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `plantation_attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `worker_id` int DEFAULT NULL,
  `days_worked` int DEFAULT NULL,
  `month` varchar(20) DEFAULT NULL,
  `allowance` decimal(10, 2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_worker_month` (`worker_id`, `month`),
  CONSTRAINT `plantation_attendance_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `plantation_workers` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: plantation_daily_attendance
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `plantation_daily_attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `worker_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` varchar(10) DEFAULT 'present',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_worker_date` (`worker_id`, `date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: plantation_workers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `plantation_workers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `rate_per_day` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: rubber_tappers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `rubber_tappers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `rate_per_day` decimal(10, 2) DEFAULT NULL,
  `liters` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: allowances
# ------------------------------------------------------------

INSERT INTO
  `allowances` (`id`, `memberid`, `month`, `amount`)
VALUES
  (4, 1, 'April', 1000.00);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: attendance
# ------------------------------------------------------------

INSERT INTO
  `attendance` (`memberid`, `month`, `date`, `present`)
VALUES
  (1, 'April', '2026-04-28', 1);
INSERT INTO
  `attendance` (`memberid`, `month`, `date`, `present`)
VALUES
  (1, 'April', '2026-04-20', 1);
INSERT INTO
  `attendance` (`memberid`, `month`, `date`, `present`)
VALUES
  (1, 'April', '2026-04-30', 1);
INSERT INTO
  `attendance` (`memberid`, `month`, `date`, `present`)
VALUES
  (1, 'April', '2026-04-29', 0);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: employees
# ------------------------------------------------------------

INSERT INTO
  `employees` (`name`, `basic_salary`, `memberid`, `NIC`)
VALUES
  ('Chandana Wijesinghe', 50000.00, 1, '690802678V');
INSERT INTO
  `employees` (`name`, `basic_salary`, `memberid`, `NIC`)
VALUES
  ('Gayan', 5700.00, 2, '223434555');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: plantation_attendance
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: plantation_daily_attendance
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: plantation_workers
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: rubber_tappers
# ------------------------------------------------------------


/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
