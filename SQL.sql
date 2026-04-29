CREATE DATABASE nirmalani_payroll_system;

USE nirmalani_payroll_system;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  position VARCHAR(100),
  basic_salary DECIMAL(10,2)
);

SELECT * FROM employees;

ALTER TABLE employees DROP COLUMN position;
ALTER TABLE employees ADD COLUMN memberid INT;

ALTER TABlE employees ADD COLUMN NIC VARCHAR(20);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  memberid INT,
  days_worked INT,
  overtime_hours INT DEFAULT 0,
  allowance DECIMAL(10,2) DEFAULT 0,
  month VARCHAR(20),
  FOREIGN KEY (memberid) REFERENCES employees(id)
);

SELECT * FROM attendance;

SELECT memberid FROM attendance;

SELECT id, name, memberid FROM employees;

DELETE FROM attendance;

ALTER TABLE attendance DROP COLUMN id;