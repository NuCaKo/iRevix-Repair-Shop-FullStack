CREATE DATABASE repair_shop_db;
USE repair_shop_db;

CREATE TABLE repairs (
                         id INT PRIMARY KEY AUTO_INCREMENT,
                         customer VARCHAR(100) NOT NULL,
                         device VARCHAR(50) NOT NULL,
                         model VARCHAR(50) NOT NULL,
                         issue VARCHAR(100) NOT NULL,
                         status ENUM('Pending', 'In Progress', 'Completed', 'Awaiting Parts') NOT NULL,
                         priority ENUM('Low', 'Medium', 'High') NOT NULL,
                         date DATE NOT NULL
);

CREATE TABLE inventory (
                           id INT PRIMARY KEY AUTO_INCREMENT,
                           name VARCHAR(100) NOT NULL,
                           brand VARCHAR(50) NOT NULL,
                           stock INT NOT NULL DEFAULT 0,
                           status ENUM('In Stock', 'Low Stock', 'Out of Stock') NOT NULL,
                           location VARCHAR(20),
                           category VARCHAR(50) NOT NULL,
                           quantity INT NOT NULL DEFAULT 0,
                           price DECIMAL(10,2) NOT NULL
);

CREATE TABLE compatible_devices (
                                    id INT PRIMARY KEY AUTO_INCREMENT,
                                    inventory_id INT NOT NULL,
                                    device_name VARCHAR(100) NOT NULL,
                                    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
                              id INT PRIMARY KEY AUTO_INCREMENT,
                              customer VARCHAR(100) NOT NULL,
                              device VARCHAR(50) NOT NULL,
                              issue VARCHAR(200) NOT NULL,
                              date DATE NOT NULL,
                              time TIME NOT NULL,
                              phone VARCHAR(20) NOT NULL
);

CREATE TABLE knowledge_base (
                                id INT PRIMARY KEY AUTO_INCREMENT,
                                title VARCHAR(200) NOT NULL,
                                category VARCHAR(50) NOT NULL,
                                content TEXT NOT NULL,
                                popular BOOLEAN DEFAULT FALSE,
                                date DATE NOT NULL
);

CREATE TABLE kb_steps (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          kb_id INT NOT NULL,
                          step_order INT NOT NULL,
                          step_text TEXT NOT NULL,
                          FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE
);

CREATE TABLE kb_tips (
                         id INT PRIMARY KEY AUTO_INCREMENT,
                         kb_id INT NOT NULL,
                         tip_order INT NOT NULL,
                         tip_text TEXT NOT NULL,
                         FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE
);

CREATE TABLE part_compatibility (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    part_id INT,
                                    device_name VARCHAR(100),
                                    FOREIGN KEY (part_id) REFERENCES inventory(id)
);

