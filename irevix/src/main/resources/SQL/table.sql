-- Create database
CREATE DATABASE IF NOT EXISTS repair_shop_db;
USE repair_shop_db;

-- Create technician table first (since it's referenced by repair_order)
CREATE TABLE technician (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    specialization VARCHAR(100),
    active BOOLEAN DEFAULT TRUE
);

-- RepairOrder table for tracking repair requests
CREATE TABLE repair_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer VARCHAR(255) NOT NULL,
    device VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    issue TEXT NOT NULL,
    status ENUM('RECEIVED', 'IN_REPAIR', 'DIAGNOSING', 'WAITING_FOR_PARTS', 'COMPLETED', 'PENDING') DEFAULT 'RECEIVED',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    date DATE NOT NULL,
    technician_id BIGINT,
    FOREIGN KEY (technician_id) REFERENCES technician(id)
);

-- Appointment table for scheduling repairs
CREATE TABLE appointment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer VARCHAR(255) NOT NULL,
    device VARCHAR(100) NOT NULL,
    issue TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    phone VARCHAR(20)
);

-- Inventory table for parts stock management
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    location VARCHAR(50),
    reorder_level INT DEFAULT 5
);

-- Knowledge base articles for repair guides
CREATE TABLE knowledge_base_article (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    popular BOOLEAN DEFAULT FALSE
);


kullanlmyor şuan
-- Device compatibility for inventory items
CREATE TABLE compatible_device (
    inventory_id BIGINT,
    device_model VARCHAR(100),
    PRIMARY KEY (inventory_id, device_model),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Repair notes for tracking repair progress
CREATE TABLE repair_note (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    repair_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    technician_id BIGINT,
    FOREIGN KEY (repair_id) REFERENCES repair_order(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES technician(id)
);



-- Steps for knowledge base articles
CREATE TABLE kb_step (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    kb_id BIGINT NOT NULL,
    step_order INT NOT NULL,
    content TEXT NOT NULL,
    image_path VARCHAR(255),
    FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE
);

-- Tips for knowledge base articles
CREATE TABLE kb_tip (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    kb_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE
);

-- Images for repair documentation
CREATE TABLE repair_image (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    repair_id BIGINT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    type ENUM('before', 'during') NOT NULL,
    description VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repair_id) REFERENCES repair_order(id) ON DELETE CASCADE
);

-- Service reports for completed repairs
CREATE TABLE service_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    repair_id BIGINT NOT NULL UNIQUE,
    technician VARCHAR(255) NOT NULL,
    parts_used TEXT,
    work_performed TEXT NOT NULL,
    recommendations TEXT,
    cost DECIMAL(10,2),
    completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repair_id) REFERENCES repair_order(id) ON DELETE CASCADE
);

-- Parts used in repairs for inventory tracking
CREATE TABLE parts_used (
    repair_id BIGINT NOT NULL,
    inventory_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (repair_id, inventory_id),
    FOREIGN KEY (repair_id) REFERENCES repair_order(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- Inventory transactions for stock movements
CREATE TABLE inventory_transaction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    inventory_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    type ENUM('IN', 'OUT') NOT NULL,
    reference_id BIGINT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);