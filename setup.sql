-- Xóa bảng nếu đã tồn tại (CẢNH BÁO: Điều này sẽ xóa toàn bộ dữ liệu)
DROP TABLE IF EXISTS "Employees" CASCADE;
DROP TABLE IF EXISTS "Departments" CASCADE;
DROP TABLE IF EXISTS "Positions" CASCADE;
DROP TABLE IF EXISTS "Salaries" CASCADE;

-- Tạo bảng Departments (Phòng ban)
CREATE TABLE "Departments" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Positions (Chức vụ)
CREATE TABLE "Positions" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Employees (Nhân viên)
CREATE TABLE "Employees" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employeeCode VARCHAR(50) UNIQUE NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Nam', 'Nữ', 'Khác')),
    birthDate DATE,
    idCard VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    positionId INT REFERENCES "Positions"(id) ON DELETE SET NULL,
    departmentId INT REFERENCES "Departments"(id) ON DELETE SET NULL,
    contractStartDate DATE,
    contractEndDate DATE,
    bankAccount VARCHAR(50),
    bankName VARCHAR(255),
    taxCode VARCHAR(50),
    socialInsurance VARCHAR(50),
    baseSalary NUMERIC(15,2) DEFAULT 0,
    kpiSalary NUMERIC(15,2) DEFAULT 0,
    productSalary NUMERIC(15,2) DEFAULT 0,
    notes TEXT,
    portraitUrl VARCHAR(255),
    idFrontUrl VARCHAR(255),
    idBackUrl VARCHAR(255),
    contractFileUrl VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Salaries (Lương nhân viên)
CREATE TABLE "Salaries" (
    id SERIAL PRIMARY KEY,
    employeeId UUID REFERENCES "Employees"(id) ON DELETE CASCADE,
    baseSalary NUMERIC(15,2) DEFAULT 0,
    kpiSalary NUMERIC(15,2) DEFAULT 0,
    productSalary NUMERIC(15,2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để tăng tốc truy vấn
CREATE INDEX idx_employee_code ON "Employees"(employeeCode);
CREATE INDEX idx_email ON "Employees"(email);
CREATE INDEX idx_phone ON "Employees"(phone);
CREATE INDEX idx_department ON "Employees"(departmentId);
CREATE INDEX idx_position ON "Employees"(positionId);
