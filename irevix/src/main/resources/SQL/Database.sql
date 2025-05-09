-- Create database if not exists
CREATE DATABASE IF NOT EXISTS repair_shop_db;
USE repair_shop_db;

-- Create technician table first (since it's referenced by repair_order)
CREATE TABLE IF NOT EXISTS technician (
                                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                          name VARCHAR(255) NOT NULL,
                                          email VARCHAR(255) UNIQUE,
                                          specialization VARCHAR(100),
                                          active BOOLEAN DEFAULT TRUE
);

-- RepairOrder table for tracking repair requests
CREATE TABLE IF NOT EXISTS repair_order (
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
CREATE TABLE IF NOT EXISTS appointment (
                                           id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                           customer VARCHAR(255) NOT NULL,
                                           device VARCHAR(100) NOT NULL,
                                           issue TEXT,
                                           date DATE NOT NULL,
                                           time TIME NOT NULL,
                                           phone VARCHAR(20)
);

-- Knowledge base articles for repair guides
CREATE TABLE IF NOT EXISTS knowledge_base_article (
                                                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                      title VARCHAR(255) NOT NULL,
                                                      content TEXT,
                                                      category VARCHAR(50) NOT NULL,
                                                      date DATE NOT NULL,
                                                      popular BOOLEAN DEFAULT FALSE
);

-- Repair notes for tracking repair progress
CREATE TABLE IF NOT EXISTS repair_note (
                                           id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                           repair_id BIGINT NOT NULL,
                                           content TEXT NOT NULL,
                                           timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                           technician_id BIGINT,
                                           FOREIGN KEY (repair_id) REFERENCES repair_order(id) ON DELETE CASCADE,
                                           FOREIGN KEY (technician_id) REFERENCES technician(id)
);

-- Images for repair documentation
CREATE TABLE IF NOT EXISTS image (
                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                     image_url VARCHAR(255) NOT NULL,
                                     description VARCHAR(255),
                                     repair_order_id BIGINT,
                                     FOREIGN KEY (repair_order_id) REFERENCES repair_order(id) ON DELETE CASCADE
);

-- Service reports for completed repairs
CREATE TABLE IF NOT EXISTS service_report (
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

-- Create devices table (important for parts lookup)
CREATE TABLE IF NOT EXISTS devices (
                                       id INT NOT NULL AUTO_INCREMENT,
                                       name VARCHAR(255) NOT NULL,
                                       icon VARCHAR(255) DEFAULT NULL,
                                       PRIMARY KEY (id)
);

-- Create device_models table (important for parts lookup)
CREATE TABLE IF NOT EXISTS device_models (
                                             id BIGINT NOT NULL AUTO_INCREMENT,
                                             device_id INT DEFAULT NULL,
                                             name VARCHAR(255) NOT NULL,
                                             is_premium TINYINT(1) DEFAULT '0',
                                             release_order INT DEFAULT '0',
                                             PRIMARY KEY (id),
                                             KEY device_id (device_id),
                                             CONSTRAINT device_models_ibfk_1 FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
                                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                         name VARCHAR(255) NOT NULL,
                                         part_number VARCHAR(255) NOT NULL,
                                         description TEXT,
                                         stock_level INT NOT NULL DEFAULT 0,
                                         reorder_point INT NOT NULL DEFAULT 5,
                                         price DOUBLE NOT NULL,
                                         supplier VARCHAR(255) DEFAULT NULL,
                                         device_type VARCHAR(255) NOT NULL,
                                         model_type VARCHAR(255) NOT NULL,
                                         last_restocked VARCHAR(255) DEFAULT NULL,
                                         created_at DATE DEFAULT NULL,
                                         updated_at DATE DEFAULT NULL
);

-- Device compatibility for inventory items
CREATE TABLE IF NOT EXISTS compatible_device (
                                                 inventory_id BIGINT,
                                                 device_model VARCHAR(100),
                                                 PRIMARY KEY (inventory_id, device_model),
                                                 FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Parts used in repairs for inventory tracking
CREATE TABLE IF NOT EXISTS parts_used (
                                          repair_id BIGINT NOT NULL,
                                          inventory_id BIGINT NOT NULL,
                                          quantity INT NOT NULL DEFAULT 1,
                                          PRIMARY KEY (repair_id, inventory_id),
                                          FOREIGN KEY (repair_id) REFERENCES repair_order(id),
                                          FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- Inventory transactions for stock movements
CREATE TABLE IF NOT EXISTS inventory_transaction (
                                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                     inventory_id BIGINT NOT NULL,
                                                     quantity INT NOT NULL,
                                                     type ENUM('IN', 'OUT') NOT NULL,
                                                     reference_id BIGINT,
                                                     transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                     notes TEXT,
                                                     FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- Appointments table (as seen in the data)
CREATE TABLE IF NOT EXISTS appointments (
                                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                            customer_name VARCHAR(255) NOT NULL,
                                            customer_phone VARCHAR(20),
                                            customer_email VARCHAR(255),
                                            device_type VARCHAR(100) NOT NULL,
                                            device_model VARCHAR(100),
                                            issue_description TEXT,
                                            appointment_date_time DATETIME NOT NULL,
                                            status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING'
);

-- Create KB steps and tips tables
CREATE TABLE IF NOT EXISTS kb_step (
                                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                       kb_id BIGINT NOT NULL,
                                       step_order INT NOT NULL,
                                       content TEXT NOT NULL,
                                       image_path VARCHAR(255),
                                       FOREIGN KEY (kb_id) REFERENCES knowledge_base_article(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_tip (
                                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                      kb_id BIGINT NOT NULL,
                                      content TEXT NOT NULL,
                                      FOREIGN KEY (kb_id) REFERENCES knowledge_base_article(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
                                     id INT NOT NULL AUTO_INCREMENT,
                                     username VARCHAR(255) NOT NULL,
                                     password VARCHAR(255) NOT NULL,
                                     email VARCHAR(255) DEFAULT NULL,
                                     role VARCHAR(50) NOT NULL,
                                     created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                                     PRIMARY KEY (id),
                                     UNIQUE KEY username (username),
                                     UNIQUE KEY email (email)
);
CREATE TABLE IF NOT EXISTS cart_item (
                                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                         cart_id BIGINT NOT NULL,
                                         part_id BIGINT DEFAULT -1,
                                         quantity INT NOT NULL DEFAULT 1,
                                         type VARCHAR(20) NOT NULL,
                                         name VARCHAR(255) NOT NULL,
                                         price DECIMAL(10,2) NOT NULL,
                                         description TEXT,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                         FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
                                         CONSTRAINT fk_part FOREIGN KEY (part_id) REFERENCES inventory(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS revenue (
                                       id INT NOT NULL AUTO_INCREMENT,
                                       period VARCHAR(255) DEFAULT NULL,
                                       today DOUBLE NOT NULL,
                                       this_week DOUBLE NOT NULL,
                                       this_month DOUBLE DEFAULT NULL,
                                       last_month DOUBLE DEFAULT NULL,
                                       period_label VARCHAR(255) DEFAULT NULL,
                                       today_change VARCHAR(255) DEFAULT NULL,
                                       week_change VARCHAR(255) DEFAULT NULL,
                                       month_change VARCHAR(255) DEFAULT NULL,
                                       repair_sales_ratio VARCHAR(255) DEFAULT NULL,
                                       ratio_change VARCHAR(255) DEFAULT NULL,
                                       date DATETIME(6) DEFAULT NULL,
                                       PRIMARY KEY (id),
                                       UNIQUE KEY period (period)
);

CREATE TABLE IF NOT EXISTS daily_revenue (
                                             id BIGINT NOT NULL AUTO_INCREMENT,
                                             revenue_id INT DEFAULT NULL,
                                             date VARCHAR(255) NOT NULL,
                                             sales DOUBLE NOT NULL,
                                             repairs DOUBLE NOT NULL,
                                             total DOUBLE NOT NULL,
                                             PRIMARY KEY (id),
                                             KEY revenue_id (revenue_id),
                                             CONSTRAINT daily_revenue_ibfk_1 FOREIGN KEY (revenue_id) REFERENCES revenue (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS device_revenue (
                                              id BIGINT NOT NULL AUTO_INCREMENT,
                                              revenue_id INT DEFAULT NULL,
                                              device VARCHAR(255) DEFAULT NULL,
                                              revenue DOUBLE DEFAULT NULL,
                                              percentage DOUBLE NOT NULL,
                                              revenue_amount DOUBLE NOT NULL,
                                              PRIMARY KEY (id),
                                              KEY revenue_id (revenue_id),
                                              CONSTRAINT device_revenue_ibfk_1 FOREIGN KEY (revenue_id) REFERENCES revenue (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repair_types (
                                            id BIGINT NOT NULL AUTO_INCREMENT,
                                            revenue_id INT DEFAULT NULL,
                                            type VARCHAR(255) DEFAULT NULL,
                                            count INT NOT NULL,
                                            revenue DOUBLE DEFAULT NULL,
                                            revenue_amount DOUBLE NOT NULL,
                                            PRIMARY KEY (id),
                                            KEY revenue_id (revenue_id),
                                            CONSTRAINT repair_types_ibfk_1 FOREIGN KEY (revenue_id) REFERENCES revenue (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS part_categories (
                                               id BIGINT NOT NULL AUTO_INCREMENT,
                                               base_price DOUBLE DEFAULT NULL,
                                               category VARCHAR(255) NOT NULL,
                                               icon VARCHAR(255) DEFAULT NULL,
                                               prefix VARCHAR(255) DEFAULT NULL,
                                               device_id BIGINT NOT NULL,
                                               PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS notifications (
                                             id BIGINT NOT NULL AUTO_INCREMENT,
                                             type VARCHAR(255) NOT NULL,
                                             message TEXT NOT NULL,
                                             time VARCHAR(255) DEFAULT NULL,
                                             is_read TINYINT(1) DEFAULT '0',
                                             created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                                             read_at DATETIME(6) DEFAULT NULL,
                                             PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS traffic (
                                       id BIGINT NOT NULL AUTO_INCREMENT,
                                       date DATE NOT NULL,
                                       visitors INT NOT NULL,
                                       page_views INT NOT NULL,
                                       conversions INT NOT NULL,
                                       period VARCHAR(255) DEFAULT NULL,
                                       PRIMARY KEY (id)
);

CREATE TABLE orders (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        clerk_user_id VARCHAR(255),
                        customer_name VARCHAR(255),
                        device_type VARCHAR(255),
                        issue TEXT,
                        status VARCHAR(50),
                        order_date DATE,
                        completion_date DATE,
                        estimated_completion DATE,
                        cost DECIMAL(10,2),
                        invoice_no VARCHAR(50),

                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_requests (
                                                id INT NOT NULL AUTO_INCREMENT,
                                                support_id INT DEFAULT NULL,
                                                title VARCHAR(255) NOT NULL,
                                                status VARCHAR(255) NOT NULL,
                                                priority VARCHAR(255) NOT NULL,
                                                category VARCHAR(255) DEFAULT NULL,
                                                date VARCHAR(255) DEFAULT NULL,
                                                customer VARCHAR(255) NOT NULL,
                                                email VARCHAR(255) DEFAULT NULL,
                                                is_read TINYINT(1) DEFAULT '0',
                                                description TEXT,
                                                PRIMARY KEY (id),
                                                UNIQUE KEY support_id (support_id)
);

CREATE TABLE IF NOT EXISTS support_messages (
                                                id BIGINT NOT NULL AUTO_INCREMENT,
                                                support_id INT DEFAULT NULL,
                                                message_id INT DEFAULT NULL,
                                                sender VARCHAR(255) NOT NULL,
                                                message TEXT NOT NULL,
                                                agent_name VARCHAR(255) DEFAULT NULL,
                                                date VARCHAR(255) DEFAULT NULL,
                                                PRIMARY KEY (id),
                                                KEY support_id (support_id),
                                                CONSTRAINT support_messages_ibfk_1 FOREIGN KEY (support_id) REFERENCES support_requests (id) ON DELETE CASCADE
);

-- Repair service types and options tables (from repairservice.sql)
CREATE TABLE IF NOT EXISTS repair_service_types (
                                                    id BIGINT NOT NULL AUTO_INCREMENT,
                                                    title VARCHAR(255) NOT NULL,
                                                    device_type VARCHAR(255) NOT NULL,
                                                    base_price DOUBLE NOT NULL DEFAULT 0,
                                                    description TEXT,
                                                    image_url VARCHAR(255),
                                                    is_active BOOLEAN DEFAULT TRUE,
                                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                                    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS repair_service_options (
                                                      id BIGINT NOT NULL AUTO_INCREMENT,
                                                      service_type_id BIGINT NOT NULL,
                                                      name VARCHAR(255) NOT NULL,
                                                      price DOUBLE NOT NULL DEFAULT 0,
                                                      description TEXT,
                                                      is_active BOOLEAN DEFAULT TRUE,
                                                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                                      PRIMARY KEY (id),
                                                      FOREIGN KEY (service_type_id) REFERENCES repair_service_types(id) ON DELETE CASCADE
);

INSERT INTO technician (name, email, specialization, active) VALUES
                                                                 ('Ahmet Yılmaz', 'ahmet@example.com', 'iPhone Repair', true),
                                                                 ('Ayşe Demir', 'ayse@example.com', 'MacBook Repair', true),
                                                                 ('Mehmet Kaya', 'mehmet@example.com', 'iPad Repair', true),
                                                                 ('Zeynep Şahin', 'zeynep@example.com', 'Apple Watch Repair', true);

-- Insert repair orders
INSERT INTO repair_order (customer, device, model, issue, status, priority, date, technician_id) VALUES
                                                                                                     ('Travis Pearson', 'MacBook Air', 'M1 2020', 'Screen broken', 'PENDING', 'High', '2023-07-15', 2),
                                                                                                     ('Ahmet Yılmaz', 'iPhone', '13 Pro', 'Battery drain', 'COMPLETED', 'Medium', '2023-07-14', 1),
                                                                                                     ('Ayşe Kaya', 'iPad', 'Pro 12.9 2021', 'Not charging', 'WAITING_FOR_PARTS', 'High', '2023-07-10', 3),
                                                                                                     ('Mehmet Demir', 'Apple Watch', 'Series 7', 'Screen cracked', 'COMPLETED', 'Low', '2023-07-05', 4),
                                                                                                     ('Zeynep Öztürk', 'iPhone', '12 Mini', 'Speaker not working', 'RECEIVED', 'Medium', '2023-07-18', null),
                                                                                                     ('Ali Can', 'MacBook Pro', '16 2021', 'Keyboard issues', 'DIAGNOSING', 'High', '2023-07-17', 2),
                                                                                                     ('Fatma Yıldız', 'AirPods', 'Pro', 'Left pod not charging', 'IN_REPAIR', 'Low', '2023-07-16', 1);

-- Insert appointments
INSERT INTO appointments (customer_name, customer_phone, customer_email, device_type, device_model, issue_description, appointment_date_time, status) VALUES
                                                                                                                                                          ('Kemal Aydın', '555-123-4567', 'kemal@example.com', 'iPhone', '14 Pro', 'Screen replacement', '2025-05-08 10:00:00', 'PENDING'),
                                                                                                                                                          ('Seda Demir', '555-234-5678', 'seda@example.com', 'MacBook', 'Air', 'Battery replacement', '2025-05-25 11:30:00', 'PENDING'),
                                                                                                                                                          ('Emre Yılmaz', '555-345-6789', 'emre@example.com', 'iPad', 'Pro', 'Not turning on', '2025-05-25 14:00:00', 'PENDING');

-- Insert knowledge base articles
INSERT INTO knowledge_base_article (title, content, category, date, popular) VALUES
                                                                                 ('iPhone 13 Battery Replacement Guide', 'Complete step-by-step guide for replacing the battery in iPhone 13 models.', 'iphone', '2023-05-10', true),
                                                                                 ('MacBook M1 Display Assembly Repair', 'How to safely replace the display assembly in M1 MacBooks.', 'macbook', '2023-04-22', true),
                                                                                 ('iPad Charging Port Diagnosis', 'Diagnose and fix common charging issues in iPad models.', 'ipad', '2023-06-15', false),
                                                                                 ('Apple Watch Screen Replacement', 'Guide for replacing broken screens on Apple Watch Series 6 and 7.', 'watch', '2023-03-30', true),
                                                                                 ('AirPods Pro Charging Case Repair', 'How to fix charging issues with AirPods Pro cases.', 'airpods', '2023-05-25', false),
                                                                                 ('Common iPhone Water Damage Solutions', 'Steps to diagnose and repair water-damaged iPhones.', 'iphone', '2023-02-18', true);

-- Insert tips for knowledge base articles
INSERT INTO kb_tip (kb_id, content) VALUES
                                        (1, 'Always use a battery with the same specifications as the original.'),
                                        (1, 'Calibrate the new battery by fully charging and then draining it.'),
                                        (2, 'Use a dust-free environment when replacing the display.'),
                                        (2, 'Mark each screw location as they vary in size and length.'),
                                        (3, 'Check for lint and debris in the charging port first.'),
                                        (4, 'Apply heat slowly and evenly to prevent damage to internal components.'),
                                        (5, 'Reset the AirPods by holding the button on the case for 15 seconds.');

-- Insert steps for knowledge base articles
INSERT INTO kb_step (kb_id, step_order, content, image_path) VALUES
                                                                 (1, 1, 'Power off the iPhone and remove the bottom screws.', 'images/kb/iphone-battery-1.jpg'),
                                                                 (1, 2, 'Use a suction cup to gently lift the screen.', 'images/kb/iphone-battery-2.jpg'),
                                                                 (1, 3, 'Disconnect the battery connector first.', 'images/kb/iphone-battery-3.jpg'),
                                                                 (1, 4, 'Remove the battery adhesive strips carefully.', 'images/kb/iphone-battery-4.jpg'),
                                                                 (2, 1, 'Remove the bottom case screws and separate the case.', 'images/kb/macbook-display-1.jpg'),
                                                                 (2, 2, 'Disconnect all display cables from the logic board.', 'images/kb/macbook-display-2.jpg'),
                                                                 (2, 3, 'Remove the display hinge screws.', 'images/kb/macbook-display-3.jpg'),
                                                                 (4, 1, 'Power off the watch and heat the perimeter of the screen.', 'images/kb/watch-screen-1.jpg'),
                                                                 (4, 2, 'Carefully insert a blade to separate the screen.', 'images/kb/watch-screen-2.jpg'),
                                                                 (4, 3, 'Disconnect the display cable and remove the screen.', 'images/kb/watch-screen-3.jpg');

-- Insert service reports for completed repairs
INSERT INTO service_report (repair_id, technician, parts_used, work_performed, recommendations, cost, completion_date) VALUES
    (4, 'Zeynep Şahin', 'Apple Watch Series 7 Screen', 'Screen replacement and digitizer calibration', 'Consider screen protector to prevent future damage', 650.00, '2023-07-08 14:30:00');

-- Insert repair notes
INSERT INTO repair_note (repair_id, content, technician_id) VALUES
                                                                (2, 'Initial diagnosis complete. Battery health at 65%. Replacement required.', 1),
                                                                (2, 'New battery installed. Device testing in progress.', 1),
                                                                (3, 'Charging IC appears damaged. Waiting for replacement part.', 3),
                                                                (4, 'Screen replaced successfully. Calibration complete.', 4),
                                                                (6, 'Multiple keys not responding. Possible liquid damage.', 2);

-- Insert devices with correct icon names
INSERT INTO devices (id, name, icon) VALUES
                                         (1, 'iPhone', 'faMobileAlt'),
                                         (2, 'iPad', 'faTabletScreenButton'),
                                         (3, 'MacBook', 'faLaptop'),
                                         (4, 'AirPods', 'faHeadphones'),
                                         (5, 'Apple Watch', 'faClock');

-- Insert device models (linked to devices)
INSERT INTO device_models (device_id, name, is_premium, release_order) VALUES
                                                                           (1, 'iPhone 13 Pro', 1, 1),
                                                                           (1, 'iPhone 13', 0, 2),
                                                                           (1, 'iPhone 12 Pro', 1, 3),
                                                                           (1, 'iPhone 12', 0, 4),
                                                                           (1, 'iPhone 11 Pro', 1, 5),
                                                                           (1, 'iPhone 11', 0, 6),
                                                                           (1, 'iPhone XS', 1, 7),
                                                                           (1, 'iPhone X', 0, 8),
                                                                           (2, 'iPad Pro 12.9"', 1, 1),
                                                                           (2, 'iPad Pro 11"', 1, 2),
                                                                           (2, 'iPad Air', 0, 3),
                                                                           (2, 'iPad Mini', 0, 4),
                                                                           (2, 'iPad', 0, 5),
                                                                           (3, 'MacBook Pro 16"', 1, 1),
                                                                           (3, 'MacBook Pro 14"', 1, 2),
                                                                           (3, 'MacBook Pro 13"', 0, 3),
                                                                           (3, 'MacBook Air', 0, 4),
                                                                           (4, 'AirPods Pro', 1, 1),
                                                                           (4, 'AirPods 3rd Gen', 0, 2),
                                                                           (4, 'AirPods 2nd Gen', 0, 3),
                                                                           (4, 'AirPods Max', 1, 4),
                                                                           (5, 'Apple Watch Series 7', 1, 1),
                                                                           (5, 'Apple Watch Series 6', 1, 2),
                                                                           (5, 'Apple Watch SE', 0, 3),
                                                                           (5, 'Apple Watch Series 5', 0, 4);

-- Insert revenue data
INSERT INTO revenue (id, period, today, this_week, this_month, last_month, period_label, today_change, week_change, month_change, repair_sales_ratio) VALUES
                                                                                                                                                          (7, 'today', 2450, 15680, 68450, 62340, 'Today', '+5.2%', '+3.6%', '+9.8%', '65:35'),
                                                                                                                                                          (8, '7days', 2450, 15680, 68450, 62340, 'Last 7 Days', '+5.2%', '+3.6%', '+9.8%', '65:35');

-- Insert daily revenue data
INSERT INTO daily_revenue (revenue_id, date, sales, repairs, total) VALUES
                                                                        (8, '2025-05-01', 1938, 1480, 3410),
                                                                        (8, '2025-05-02', 2100, 1950, 4050),
                                                                        (8, '2025-05-03', 1828, 1350, 3170),
                                                                        (8, '2025-05-04', 1756, 1290, 3046),
                                                                        (8, '2025-05-05', 2032, 1575, 3607),
                                                                        (8, '2025-05-06', 1895, 1605, 3500),
                                                                        (8, '2025-05-07', 1598, 852, 2450),
                                                                        (7, '2025-05-07', 1598, 852, 2450);

-- Insert device revenue data
INSERT INTO device_revenue (revenue_id, device, revenue, percentage, revenue_amount) VALUES
                                                                                         (7, 'iPhone', 1225, 50, 1225),
                                                                                         (7, 'iPad', 490, 20, 490),
                                                                                         (7, 'MacBook', 612.5, 25, 612.5),
                                                                                         (7, 'AirPods', 122.5, 5, 122.5),
                                                                                         (8, 'iPhone', 7840, 50, 7840),
                                                                                         (8, 'iPad', 3136, 20, 3136),
                                                                                         (8, 'MacBook', 3920, 25, 3920),
                                                                                         (8, 'AirPods', 784, 5, 784);

-- Insert repair types data
INSERT INTO repair_types (revenue_id, type, count, revenue, revenue_amount) VALUES
                                                                                (7, 'Screen Replacement', 5, 450, 450),
                                                                                (7, 'Battery Replacement', 3, 210, 210),
                                                                                (7, 'Water Damage', 1, 180, 180),
                                                                                (7, 'Charging Port', 2, 120, 120),
                                                                                (8, 'Screen Replacement', 25, 2250, 2250),
                                                                                (8, 'Battery Replacement', 18, 1260, 1260),
                                                                                (8, 'Water Damage', 7, 1260, 1260),
                                                                                (8, 'Charging Port', 12, 720, 720);
-- Insert traffic data
INSERT INTO traffic (date, visitors, page_views, conversions, period) VALUES
                                                                          ('2025-05-01', 425, 1456, 32, '7days'),
                                                                          ('2025-05-02', 398, 1345, 28, '7days'),
                                                                          ('2025-05-03', 412, 1390, 29, '7days'),
                                                                          ('2025-05-04', 385, 1298, 26, '7days'),
                                                                          ('2025-05-05', 367, 1245, 25, '7days');

-- Insert a sample notification
INSERT INTO notifications (type, message, time, is_read, created_at, read_at) VALUES
                                                                                  ('order', 'Repair order for Emma Johnson\'s MacBook Pro status changed from "In Progress" to "Awaiting Parts".', 'just now', 1, '2025-05-07 14:18:06', '2025-05-07 16:07:25.804000'),
                                                                                  ('alert', 'CRITICAL: MacBook Pro 14" Logic Board for MacBook Pro 14" is critically low (2 units remaining).', 'just now', 1, '2025-05-07 14:18:06', '2025-05-07 16:07:27.383000'),
                                                                                  ('alert', 'CRITICAL: iPhone 13 Battery for iPhone 13 is critically low (4 units remaining).', 'just now', 1, '2025-05-08 04:22:04', '2025-05-08 07:22:32.669000');

-- Insert sample repair service data for iPhone repairs
INSERT INTO repair_service_types (title, device_type, base_price, description, is_active)
VALUES
    ('Screen Repair', 'iphone', 89.99, 'Professional iPhone screen replacement service with genuine parts and 90-day warranty.', TRUE),
    ('Battery Replacement', 'iphone', 49.99, 'Restore your iPhone battery life with our expert replacement service. All batteries come with 6-month warranty.', TRUE),
    ('Charging Port Repair', 'iphone', 39.99, 'Fix charging issues with professional iPhone charging port repair or replacement.', TRUE);

-- Insert sample iPhone repair service options
INSERT INTO repair_service_options (service_type_id, name, price, description, is_active)
VALUES
    (1, 'Front Screen Replacement', 99.99, 'Complete front screen assembly replacement with genuine parts.', TRUE),
    (1, 'Back Glass Replacement', 79.99, 'Professional back glass replacement for your iPhone.', TRUE),
    (2, 'Battery Replacement', 49.99, 'New battery installation for improved battery life.', TRUE),
    (2, 'Battery Health Diagnostics', 19.99, 'Comprehensive battery health check and diagnostics.', TRUE),
    (3, 'Charging Port Cleaning', 29.99, 'Professional cleaning of charging port without parts replacement.', TRUE),
    (3, 'Charging Port Replacement', 59.99, 'Complete charging port assembly replacement.', TRUE);

-- Insert sample data for MacBook repairs
INSERT INTO repair_service_types (title, device_type, base_price, description, is_active)
VALUES
    ('Screen Repair', 'macbook', 149.99, 'Expert MacBook screen repair service with high-quality replacement parts.', TRUE),
    ('Battery Service', 'macbook', 129.99, 'Professional MacBook battery replacement service to restore performance.', TRUE),
    ('Logic Board Repair', 'macbook', 249.99, 'Specialized MacBook logic board diagnostics and repair service.', TRUE);

-- Insert sample MacBook repair service options
INSERT INTO repair_service_options (service_type_id, name, price, description, is_active)
VALUES
    (4, 'Screen Replacement', 299.99, 'Complete screen assembly replacement for your MacBook.', TRUE),
    (4, 'Screen Hinge Repair', 89.99, 'Fix loose or broken screen hinges on your MacBook.', TRUE),
    (5, 'Battery Replacement', 129.99, 'New battery installation to restore MacBook battery life.', TRUE),
    (5, 'Battery Connector Repair', 69.99, 'Fix loose or damaged battery connectors.', TRUE),
    (6, 'Logic Board Diagnostics', 79.99, 'Comprehensive diagnostics of MacBook logic board issues.', TRUE),
    (6, 'Logic Board Component Repair', 199.99, 'Component-level repair of MacBook logic board.', TRUE);

-- Insert sample data for iPad repairs
INSERT INTO repair_service_types (title, device_type, base_price, description, is_active)
VALUES
    ('Screen Repair', 'ipad', 99.99, 'Professional iPad screen repair with premium replacement parts.', TRUE),
    ('Battery Service', 'ipad', 79.99, 'Restore your iPad battery performance with our expert service.', TRUE),
    ('Charging Port Repair', 'ipad', 69.99, 'Fix iPad charging issues with our professional repair service.', TRUE);

-- Insert sample iPad repair service options
INSERT INTO repair_service_options (service_type_id, name, price, description, is_active)
VALUES
    (7, 'Screen Replacement', 129.99, 'Complete screen assembly replacement for your iPad.', TRUE),
    (7, 'Digitizer Replacement', 99.99, 'Replace just the touch digitizer if the glass is broken but the display works.', TRUE),
    (8, 'Battery Replacement', 89.99, 'Professional iPad battery replacement.', TRUE),
    (8, 'Battery Health Diagnostics', 29.99, 'Full diagnostics of iPad battery health and performance.', TRUE),
    (9, 'Charging Port Cleaning', 39.99, 'Professional cleaning of charging port without replacement.', TRUE),
    (9, 'Charging Port Replacement', 69.99, 'Complete charging port assembly replacement for iPad.', TRUE);

-- Insert sample data for Apple Watch repairs
INSERT INTO repair_service_types (title, device_type, base_price, description, is_active)
VALUES
    ('Screen Repair', 'applewatch', 79.99, 'Expert Apple Watch screen repair and replacement service.', TRUE),
    ('Battery Service', 'applewatch', 69.99, 'Restore your Apple Watch battery life with our professional service.', TRUE),
    ('Water Damage Repair', 'applewatch', 99.99, 'Specialized repair service for water-damaged Apple Watches.', TRUE);

-- Insert sample Apple Watch repair service options
INSERT INTO repair_service_options (service_type_id, name, price, description, is_active)
VALUES
    (10, 'Screen Replacement', 129.99, 'Complete screen assembly replacement for your Apple Watch.', TRUE),
    (10, 'Glass Repair', 79.99, 'Repair cracked Apple Watch glass without full screen replacement.', TRUE),
    (11, 'Battery Replacement', 69.99, 'Professional Apple Watch battery replacement service.', TRUE),
    (11, 'Battery Performance Test', 19.99, 'Comprehensive testing of Apple Watch battery performance.', TRUE),
    (12, 'Water Damage Assessment', 49.99, 'Detailed assessment of water damage to your Apple Watch.', TRUE),
    (12, 'Complete Water Damage Repair', 149.99, 'Full repair service for water-damaged Apple Watch components.', TRUE);

-- Insert sample data for AirPods repairs
INSERT INTO repair_service_types (title, device_type, base_price, description, is_active)
VALUES
    ('Sound Issues', 'airpods', 49.99, 'Fix sound-related problems with your AirPods.', TRUE),
    ('Charging Case Repair', 'airpods', 39.99, 'Professional repair service for AirPods charging cases.', TRUE),
    ('Battery Service', 'airpods', 59.99, 'Improve your AirPods battery life with our expert service.', TRUE);

-- Insert sample AirPods repair service options
INSERT INTO repair_service_options (service_type_id, name, price, description, is_active)
VALUES
    (13, 'Speaker Cleaning', 29.99, 'Professional cleaning of AirPods speakers for improved sound.', TRUE),
    (13, 'Speaker Replacement', 69.99, 'Replace damaged AirPods speakers for optimal sound quality.', TRUE),
    (14, 'Charging Port Repair', 49.99, 'Fix charging issues with your AirPods case.', TRUE),
    (14, 'Case Replacement', 79.99, 'Complete replacement of your AirPods charging case.', TRUE),
    (15, 'Single AirPod Battery Replacement', 39.99, 'Replace the battery in one AirPod.', TRUE),
    (15, 'Full Set Battery Service', 69.99, 'Complete battery replacement for both AirPods.', TRUE);

INSERT INTO inventory (name, part_number, description, stock_level, reorder_point, price, supplier, device_type, model_type, last_restocked, created_at, updated_at) VALUES
                                                                                                                                                                         ('iPhone 11 Pro Camera Module', 'CAM-IP11P', 'Triple 12MP camera system for iPhone 11 Pro', 10, 6, 74.99, 'Tech Vision Supply', 'iphone', 'iPhone 11 Pro', '2023-08-15', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Pro 11" Logic Board', 'LOG-IPP11', 'M1 chip logic board for iPad Pro 11"', 3, 4, 269.99, 'Tech Logic Supply', 'ipad', 'iPad Pro 11"', '2023-08-20', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Air Speaker Assembly', 'SPK-MBA', 'Replacement stereo speaker system for MacBook Air', 2, 6, 59.99, 'Audio Components Inc', 'macbook', 'MacBook Air', '2023-08-29', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch SE Logic Board', 'LOG-AWSE', 'Replacement S5 SiP chip for Apple Watch SE', 6, 4, 69.99, 'Tech Logic Supply', 'applewatch', 'Apple Watch SE', '2023-08-22', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone XS Speaker Assembly', 'SPK-IPXS', 'Replacement speaker assembly for iPhone XS', 9, 8, 22.99, 'Audio Components Inc', 'iphone', 'iPhone XS', '2023-08-18', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Pro 12.9" Battery', 'BAT-IPP129', 'Replacement battery for iPad Pro 12.9"', 5, 7, 89.99, 'Power Solutions Ltd', 'ipad', 'iPad Pro 12.9"', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Logic Board', 'LOG-IPAD', 'A13 Bionic chip logic board for standard iPad', 5, 6, 179.99, 'Tech Logic Supply', 'ipad', 'iPad', '2023-08-25', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 14" Keyboard', 'KEY-MBP14', 'Replacement keyboard with Touch ID for MacBook Pro 14"', 9, 6, 179.99, 'Input Devices Co', 'macbook', 'MacBook Pro 14"', '2023-09-01', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 13" Keyboard', 'KEY-MBP13', 'Replacement keyboard with Touch Bar for MacBook Pro 13"', 6, 6, 159.99, 'Input Devices Co', 'macbook', 'MacBook Pro 13"', '2023-08-30', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Air Logic Board', 'LOG-MBA', 'M1 chip logic board for MacBook Air', 2, 5, 599.99, 'Tech Logic Supply', 'macbook', 'MacBook Air', '2023-08-26', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Screen Assembly', 'SCR-IP12', 'Complete screen assembly for iPhone 12 with OLED display', 11, 10, 119.99, 'Apple Parts Inc', 'iphone', 'iPhone 12', '2023-08-30', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Air Keyboard', 'KEY-MBA', 'Replacement keyboard with Touch ID for MacBook Air', 8, 7, 149.99, 'Input Devices Co', 'macbook', 'MacBook Air', '2023-09-01', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('AirPods Max Battery', 'BAT-APM', 'Replacement battery for AirPods Max', 2, 6, 59.99, 'Power Solutions Ltd', 'airpods', 'AirPods Max', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 7 Screen Assembly', 'SCR-AWS7', 'Complete Always-On Retina display for Apple Watch Series 7', 1, 6, 119.99, 'Apple Parts Inc', 'applewatch', 'Apple Watch Series 7', '2023-09-02', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 7 Battery', 'BAT-AWS7', 'Replacement battery for Apple Watch Series 7', 11, 10, 39.99, 'Power Solutions Ltd', 'applewatch', 'Apple Watch Series 7', '2023-09-05', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Pro Camera Module', 'CAM-IP12P', 'Pro camera system with triple 12MP cameras for iPhone 12 Pro', 3, 6, 79.99, 'Tech Vision Supply', 'iphone', 'iPhone 12 Pro', '2023-08-25', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 16" Display Assembly', 'DISP-MBP16', 'Complete Liquid Retina XDR display assembly for MacBook Pro 16"', 4, 4, 599.99, 'Apple Parts Inc', 'macbook', 'MacBook Pro 16"', '2023-08-30', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 13" Battery', 'BAT-MBP13', 'Replacement battery for MacBook Pro 13"', 6, 7, 159.99, 'Power Solutions Ltd', 'macbook', 'MacBook Pro 13"', '2023-09-03', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 6 Logic Board', 'LOG-AWS6', 'Replacement S6 SiP chip for Apple Watch Series 6', 4, 4, 79.99, 'Tech Logic Supply', 'applewatch', 'Apple Watch Series 6', '2023-08-25', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Speaker Assembly', 'SPK-IP13', 'Replacement speaker assembly for iPhone 13', 8, 10, 26.99, 'Audio Components Inc', 'iphone', 'iPhone 13', '2025-03-13', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Camera Module', 'CAM-IP13', 'Dual 12MP camera system for iPhone 13', 2, 8, 69.99, 'Tech Vision Supply', 'iphone', 'iPhone 13', '2023-09-01', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Pro Speaker Assembly', 'SPK-IP12P', 'Replacement speaker assembly for iPhone 12 Pro', 11, 8, 28.99, 'Audio Components Inc', 'iphone', 'iPhone 12 Pro', '2023-08-27', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Camera Module', 'CAM-IP12', 'Dual 12MP camera system for iPhone 12', 2, 7, 65.99, 'Tech Vision Supply', 'iphone', 'iPhone 12', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 11 Camera Module', 'CAM-IP11', 'Dual 12MP camera system for iPhone 11', 4, 7, 59.99, 'Tech Vision Supply', 'iphone', 'iPhone 11', '2023-08-24', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone XS Logic Board', 'LOG-IPXS', 'A12 Bionic chip logic board for iPhone XS', 4, 4, 149.99, 'Tech Logic Supply', 'iphone', 'iPhone XS', '2023-08-12', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Air Battery', 'BAT-IPAIR', 'Replacement battery for iPad Air', 2, 10, 69.99, 'Power Solutions Ltd', 'ipad', 'iPad Air', '2023-09-01', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Screen Assembly', 'SCR-IPAD', 'Complete Retina display assembly for standard iPad', 18, 10, 119.99, 'Apple Parts Inc', 'ipad', 'iPad', '2023-09-03', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 7 Logic Board', 'LOG-AWS7', 'Replacement S7 SiP chip for Apple Watch Series 7', 4, 5, 89.99, 'Tech Logic Supply', 'applewatch', 'Apple Watch Series 7', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Pro Screen Assembly', 'SCR-IP12P', 'Complete screen assembly for iPhone 12 Pro with OLED display', 8, 10, 139.99, 'Apple Parts Inc', 'iphone', 'iPhone 12 Pro', '2025-03-13', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 11 Screen Assembly', 'SCR-IP11', 'Complete screen assembly for iPhone 11 with LCD display', 12, 10, 109.99, 'Apple Parts Inc', 'iphone', 'iPhone 11', '2023-08-25', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Mini Logic Board', 'LOG-IPMINI', 'A15 Bionic chip logic board for iPad Mini', 7, 4, 199.99, 'Tech Logic Supply', 'ipad', 'iPad Mini', '2023-08-20', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Speaker Assembly', 'SPK-IPAD', 'Replacement stereo speaker assembly for standard iPad', 12, 9, 29.99, 'Audio Components Inc', 'ipad', 'iPad', '2023-08-30', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 16" Logic Board', 'LOG-MBP16', 'M1 Pro/Max chip logic board for MacBook Pro 16"', 4, 3, 799.99, 'Tech Logic Supply', 'macbook', 'MacBook Pro 16"', '2023-08-25', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch SE Battery', 'BAT-AWSE', 'Replacement battery for Apple Watch SE', 11, 8, 29.99, 'Power Solutions Ltd', 'applewatch', 'Apple Watch SE', '2023-09-01', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 5 Logic Board', 'LOG-AWS5', 'Replacement S5 SiP chip for Apple Watch Series 5', 3, 4, 64.99, 'Tech Logic Supply', 'applewatch', 'Apple Watch Series 5', '2023-08-18', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Screen Assembly', 'SCR-IP13', 'Complete screen assembly for iPhone 13 with OLED display', 19, 12, 129.99, 'Apple Parts Inc', 'iphone', 'iPhone 13', '2023-09-04', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Battery', 'BAT-IP13', 'Replacement battery for iPhone 13', 21, 15, 44.99, 'Power Solutions Ltd', 'iphone', 'iPhone 13', '2023-09-03', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 11 Battery', 'BAT-IP11', 'Replacement battery for iPhone 11', 21, 12, 39.99, 'Power Solutions Ltd', 'iphone', 'iPhone 11', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone X Screen Assembly', 'SCR-IPX', 'Complete screen assembly for iPhone X with OLED display', 10, 6, 89.99, 'Apple Parts Inc', 'iphone', 'iPhone X', '2023-08-10', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 13" Speaker Assembly', 'SPK-MBP13', 'Replacement stereo speaker system for MacBook Pro 13"', 9, 6, 69.99, 'Audio Components Inc', 'macbook', 'MacBook Pro 13"', '2023-08-25', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Air Display Assembly', 'DISP-MBA', 'Complete Retina display assembly for MacBook Air', 11, 6, 399.99, 'Apple Parts Inc', 'macbook', 'MacBook Air', '2023-09-04', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 7 Heart Rate Sensor', 'HRT-AWS7', 'Replacement heart rate and blood oxygen sensor for Apple Watch Series 7', 3, 6, 49.99, 'Sensor Tech Ltd', 'applewatch', 'Apple Watch Series 7', '2023-08-30', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Pro Screen Assembly', 'SCR-IP13P', 'Complete screen assembly for iPhone 13 Pro with OLED display', 27, 10, 149.99, 'Apple Parts Inc', 'iphone', 'iPhone 13 Pro', '2025-03-13', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone XS Battery', 'BAT-IPXS', 'Replacement battery for iPhone XS', 2, 10, 34.99, 'Power Solutions Ltd', 'iphone', 'iPhone XS', '2023-08-20', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone XS Camera Module', 'CAM-IPXS', 'Dual camera system for iPhone XS', 1, 6, 54.99, 'Tech Vision Supply', 'iphone', 'iPhone XS', '2023-08-16', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Pro 12.9" Logic Board', 'LOG-IPP129', 'M1 chip logic board for iPad Pro 12.9"', 1, 3, 299.99, 'Tech Logic Supply', 'ipad', 'iPad Pro 12.9"', '2023-08-18', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Pro 11" Battery', 'BAT-IPP11', 'Replacement battery for iPad Pro 11"', 2, 8, 79.99, 'Power Solutions Ltd', 'ipad', 'iPad Pro 11"', '2023-08-30', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Air Speaker Assembly', 'SPK-IPAIR', 'Replacement stereo speaker assembly for iPad Air', 9, 7, 39.99, 'Audio Components Inc', 'ipad', 'iPad Air', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Air Logic Board', 'LOG-IPAIR', 'M1 chip logic board for iPad Air', 1, 5, 229.99, 'Tech Logic Supply', 'ipad', 'iPad Air', '2023-08-22', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 14" Display Assembly', 'DISP-MBP14', 'Complete Liquid Retina XDR display assembly for MacBook Pro 14"', 8, 5, 549.99, 'Apple Parts Inc', 'macbook', 'MacBook Pro 14"', '2023-08-29', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 6 Screen Assembly', 'SCR-AWS6', 'Complete Always-On Retina display for Apple Watch Series 6', 10, 6, 99.99, 'Apple Parts Inc', 'applewatch', 'Apple Watch Series 6', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch Series 6 Heart Rate Sensor', 'HRT-AWS6', 'Replacement heart rate and blood oxygen sensor for Apple Watch Series 6', 4, 5, 44.99, 'Sensor Tech Ltd', 'applewatch', 'Apple Watch Series 6', '2023-08-26', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Pro Speaker Assembly', 'SPK-IP13P', 'Replacement speaker assembly for iPhone 13 Pro', 9, 8, 29.99, 'Audio Components Inc', 'iphone', 'iPhone 13 Pro', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Logic Board', 'LOG-IP12', 'A14 Bionic chip logic board for iPhone 12', 1, 5, 169.99, 'Tech Logic Supply', 'iphone', 'iPhone 12', '2023-08-22', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone X Logic Board', 'LOG-IPX', 'A11 Bionic chip logic board for iPhone X', 3, 3, 139.99, 'Tech Logic Supply', 'iphone', 'iPhone X', '2023-08-08', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Pro 11" Camera Module', 'CAM-IPP11', 'Pro camera system with LiDAR Scanner for iPad Pro 11"', 7, 5, 74.99, 'Tech Vision Supply', 'ipad', 'iPad Pro 11"', '2023-08-24', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Mini Screen Assembly', 'SCR-IPMINI', 'Complete Liquid Retina display assembly for iPad Mini', 12, 7, 129.99, 'Apple Parts Inc', 'ipad', 'iPad Mini', '2023-08-29', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPad Battery', 'BAT-IPAD', 'Replacement battery for standard iPad', 8, 12, 54.99, 'Power Solutions Ltd', 'ipad', 'iPad', '2023-09-02', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Pro Camera Module', 'CAM-IP13P', 'Pro camera system with triple 12MP cameras for iPhone 13 Pro', 6, 7, 89.99, 'Tech Vision Supply', 'iphone', 'iPhone 13 Pro', '2025-03-13', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 11 Pro Screen Assembly', 'SCR-IP11P', 'Complete screen assembly for iPhone 11 Pro with OLED display', 7, 8, 129.99, 'Apple Parts Inc', 'iphone', 'iPhone 11 Pro', '2023-08-20', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 11 Pro Battery', 'BAT-IP11P', 'Replacement battery for iPhone 11 Pro', 17, 12, 42.99, 'Power Solutions Ltd', 'iphone', 'iPhone 11 Pro', '2023-08-25', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 11 Logic Board', 'LOG-IP11', 'A13 Bionic chip logic board for iPhone 11', 7, 5, 159.99, 'Tech Logic Supply', 'iphone', 'iPhone 11', '2023-08-20', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone X Battery', 'BAT-IPX', 'Replacement battery for iPhone X', 13, 8, 32.99, 'Power Solutions Ltd', 'iphone', 'iPhone X', '2023-08-15', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 16" Keyboard', 'KEY-MBP16', 'Replacement keyboard with Touch ID for MacBook Pro 16"', 9, 5, 199.99, 'Input Devices Co', 'macbook', 'MacBook Pro 16"', '2023-09-02', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 13" Display Assembly', 'DISP-MBP13', 'Complete Retina display assembly for MacBook Pro 13"', 7, 6, 499.99, 'Apple Parts Inc', 'macbook', 'MacBook Pro 13"', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('AirPods 3rd Gen Battery', 'BAT-AP3', 'Replacement internal batteries for AirPods 3rd Generation', 9, 10, 24.99, 'Power Solutions Ltd', 'airpods', 'AirPods 3rd Gen', '2023-09-02', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('AirPods 3rd Gen Speaker Driver', 'SPK-AP3', 'Replacement speaker drivers for AirPods 3rd Generation', 13, 9, 34.99, 'Audio Components Inc', 'airpods', 'AirPods 3rd Gen', '2023-08-30', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('AirPods 2nd Gen Speaker Driver', 'SPK-AP2', 'Replacement speaker drivers for AirPods 2nd Generation', 3, 10, 29.99, 'Audio Components Inc', 'airpods', 'AirPods 2nd Gen', '2023-08-29', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('Apple Watch SE Heart Rate Sensor', 'HRT-AWSE', 'Replacement heart rate sensor for Apple Watch SE', 9, 5, 39.99, 'Sensor Tech Ltd', 'applewatch', 'Apple Watch SE', '2023-08-24', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 13 Pro Battery', 'BAT-IP13P', 'Replacement battery for iPhone 13 Pro', 31, 15, 49.99, 'Power Solutions Ltd', 'iphone', 'iPhone 13 Pro', '2025-03-13', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Pro Battery', 'BAT-IP12P', 'Replacement battery for iPhone 12 Pro', 3, 12, 45.99, 'Power Solutions Ltd', 'iphone', 'iPhone 12 Pro', '2023-09-01', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('iPhone 12 Battery', 'BAT-IP12', 'Replacement battery for iPhone 12', 29, 15, 42.99, 'Power Solutions Ltd', 'iphone', 'iPhone 12', '2023-09-02', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('AirPods Pro Battery', 'BAT-APP', 'Replacement internal batteries for AirPods Pro', 12, 10, 29.99, 'Power Solutions Ltd', 'airpods', 'AirPods Pro', '2023-09-01', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('AirPods Pro Charging Case', 'CASE-APP', 'Replacement MagSafe charging case for AirPods Pro', 1, 7, 79.99, 'Apple Audio Parts', 'airpods', 'AirPods Pro', '2023-08-29', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('AirPods Pro Speaker Driver', 'SPK-APP', 'Replacement high-excursion speaker drivers for AirPods Pro', 7, 8, 39.99, 'Audio Components Inc', 'airpods', 'AirPods Pro', '2023-08-28', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 14" Logic Board', 'LOG-MBP14', 'M1 Pro/Max chip logic board for MacBook Pro 14"', 2, 4, 749.99, 'Tech Logic Supply', 'macbook', 'MacBook Pro 14"', '2025-03-13', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 14" Battery', 'BAT-MBP14', 'Replacement battery for MacBook Pro 14"', 4, 6, 179.99, 'Power Solutions Ltd', 'macbook', 'MacBook Pro 14"', '2025-03-13', CURRENT_DATE(), CURRENT_DATE()),
                                                                                                                                                                         ('MacBook Pro 14" Speaker Assembly', 'SPK-MBP14', 'Replacement high-fidelity 6-speaker sound system for MacBook Pro 14"', 2, 5, 79.99, 'Audio Components Inc', 'macbook', 'MacBook Pro 14"', '2023-08-26', CURRENT_DATE(), CURRENT_DATE());