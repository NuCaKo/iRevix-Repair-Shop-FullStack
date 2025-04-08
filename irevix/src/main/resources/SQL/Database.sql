-- Create database if not exists
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

-- Knowledge base articles for repair guides
CREATE TABLE knowledge_base_article (
                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                        title VARCHAR(255) NOT NULL,
                                        content TEXT,
                                        category VARCHAR(50) NOT NULL,
                                        date DATE NOT NULL,
                                        popular BOOLEAN DEFAULT FALSE
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

-- Images for repair documentation
CREATE TABLE image (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       image_url VARCHAR(255) NOT NULL,
                       description VARCHAR(255),
                       repair_order_id BIGINT,
                       FOREIGN KEY (repair_order_id) REFERENCES repair_order(id) ON DELETE CASCADE
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

-- Create inventory table
CREATE TABLE inventory (
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
CREATE TABLE compatible_device (
                                   inventory_id BIGINT,
                                   device_model VARCHAR(100),
                                   PRIMARY KEY (inventory_id, device_model),
                                   FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
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

-- Appointments table (as seen in the data)
CREATE TABLE appointments (
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

-- Create Revenue tables from paste-3.txt
CREATE TABLE revenue (
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

CREATE TABLE daily_revenue (
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

CREATE TABLE device_revenue (
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

CREATE TABLE repair_types (
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

CREATE TABLE devices (
                         id INT NOT NULL AUTO_INCREMENT,
                         name VARCHAR(255) NOT NULL,
                         icon VARCHAR(255) DEFAULT NULL,
                         PRIMARY KEY (id)
);

CREATE TABLE device_models (
                               id BIGINT NOT NULL AUTO_INCREMENT,
                               device_id INT DEFAULT NULL,
                               name VARCHAR(255) NOT NULL,
                               is_premium TINYINT(1) DEFAULT '0',
                               release_order INT DEFAULT '0',
                               PRIMARY KEY (id),
                               KEY device_id (device_id),
                               CONSTRAINT device_models_ibfk_1 FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
);

CREATE TABLE part_categories (
                                 id BIGINT NOT NULL AUTO_INCREMENT,
                                 base_price DOUBLE DEFAULT NULL,
                                 category VARCHAR(255) NOT NULL,
                                 icon VARCHAR(255) DEFAULT NULL,
                                 prefix VARCHAR(255) DEFAULT NULL,
                                 device_id BIGINT NOT NULL,
                                 PRIMARY KEY (id)
);

CREATE TABLE repairs (
                         id BIGINT NOT NULL AUTO_INCREMENT,
                         repair_id VARCHAR(255) DEFAULT NULL,
                         customer VARCHAR(255) NOT NULL,
                         device VARCHAR(255) NOT NULL,
                         problem TEXT,
                         status VARCHAR(255) NOT NULL,
                         date VARCHAR(255) NOT NULL,
                         updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (id),
                         UNIQUE KEY repair_id (repair_id)
);

CREATE TABLE notifications (
                               id BIGINT NOT NULL AUTO_INCREMENT,
                               type VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               time VARCHAR(255) DEFAULT NULL,
                               is_read TINYINT(1) DEFAULT '0',
                               created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                               read_at DATETIME(6) DEFAULT NULL,
                               PRIMARY KEY (id)
);

CREATE TABLE traffic (
                         id BIGINT NOT NULL AUTO_INCREMENT,
                         date DATE NOT NULL,
                         visitors INT NOT NULL,
                         page_views INT NOT NULL,
                         conversions INT NOT NULL,
                         period VARCHAR(255) DEFAULT NULL,
                         PRIMARY KEY (id)
);

CREATE TABLE support_requests (
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

CREATE TABLE support_messages (
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

CREATE TABLE users (
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

-- KB steps and tips tables
CREATE TABLE kb_step (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                         kb_id BIGINT NOT NULL,
                         step_order INT NOT NULL,
                         content TEXT NOT NULL,
                         image_path VARCHAR(255),
                         FOREIGN KEY (kb_id) REFERENCES knowledge_base_article(id) ON DELETE CASCADE
);

CREATE TABLE kb_tip (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        kb_id BIGINT NOT NULL,
                        content TEXT NOT NULL,
                        FOREIGN KEY (kb_id) REFERENCES knowledge_base_article(id) ON DELETE CASCADE
);

-- Insert data into tables

-- Insert technicians
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
                                                                                                                                                          ('Kemal Aydın', '555-123-4567', 'kemal@example.com', 'iPhone', '14 Pro', 'Screen replacement', '2025-04-08 10:00:00', 'PENDING'),
                                                                                                                                                          ('Seda Demir', '555-234-5678', 'seda@example.com', 'MacBook', 'Air', 'Battery replacement', '2023-07-25 11:30:00', 'PENDING'),
                                                                                                                                                          ('Emre Yılmaz', '555-345-6789', 'emre@example.com', 'iPad', 'Pro', 'Not turning on', '2023-07-25 14:00:00', 'PENDING');

-- Insert knowledge base articles
INSERT INTO knowledge_base_article (title, content, category, date, popular) VALUES
                                                                                 ('iPhone 13 Battery Replacement Guide', 'Complete step-by-step guide for replacing the battery in iPhone 13 models.', 'iphone', '2023-05-10', true),
                                                                                 ('MacBook M1 Display Assembly Repair', 'How to safely replace the display assembly in M1 MacBooks.', 'macbook', '2023-04-22', true),
                                                                                 ('iPad Charging Port Diagnosis', 'Diagnose and fix common charging issues in iPad models.', 'ipad', '2023-06-15', false),
                                                                                 ('Apple Watch Screen Replacement', 'Guide for replacing broken screens on Apple Watch Series 6 and 7.', 'watch', '2023-03-30', true),
                                                                                 ('AirPods Pro Charging Case Repair', 'How to fix charging issues with AirPods Pro cases.', 'airpods', '2023-05-25', false),
                                                                                 ('Common iPhone Water Damage Solutions', 'Steps to diagnose and repair water-damaged iPhones.', 'iphone', '2023-02-18', true);

-- Insert images
INSERT INTO image (image_url, description, repair_order_id) VALUES
                                                                ('https://storage.googleapis.com/repair-images/iphone13-screen-before-1.jpg', 'iPhone 13 screen damage before repair', 1),
                                                                ('https://storage.googleapis.com/repair-images/iphone13-screen-during-1.jpg', 'iPhone 13 during screen replacement', 1),
                                                                ('https://storage.googleapis.com/repair-images/iphone13-screen-during-2.jpg', 'iPhone 13 screen connector detail', 1),
                                                                ('https://storage.googleapis.com/repair-images/macbook-battery-before-1.jpg', 'MacBook Pro swollen battery', 2),
                                                                ('https://storage.googleapis.com/repair-images/macbook-battery-during-1.jpg', 'MacBook Pro battery connector removal', 2),
                                                                ('https://storage.googleapis.com/repair-images/macbook-battery-during-2.jpg', 'MacBook Pro new battery installation', 2),
                                                                ('https://storage.googleapis.com/repair-images/ipad-charging-before-1.jpg', 'iPad Air charging port damage', 3),
                                                                ('https://storage.googleapis.com/repair-images/ipad-charging-during-1.jpg', 'iPad Air during charging port repair', 3),
                                                                ('https://storage.googleapis.com/repair-images/apple-watch-before-1.jpg', 'Apple Watch screen damage', 4),
                                                                ('https://storage.googleapis.com/repair-images/apple-watch-during-1.jpg', 'Apple Watch screen removal process', 4),
                                                                ('https://storage.googleapis.com/repair-images/apple-watch-during-2.jpg', 'Apple Watch new screen installation', 4),
                                                                ('https://storage.googleapis.com/repair-images/airpods-case-before-1.jpg', 'AirPods Pro case not charging', 5),
                                                                ('https://storage.googleapis.com/repair-images/airpods-case-during-1.jpg', 'AirPods Pro case internal components', 5),
                                                                ('https://storage.googleapis.com/repair-images/iphone-water-before-1.jpg', 'iPhone water damage assessment', 6),
                                                                ('https://storage.googleapis.com/repair-images/iphone-water-during-1.jpg', 'iPhone water damage component cleaning', 6);

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

-- Insert inventory data
INSERT INTO inventory (name, part_number, description, stock_level, reorder_point, price, supplier, device_type, model_type, last_restocked, created_at, updated_at) VALUES
                                                                                                                                                                         ('iPhone 13 Screen Assembly', 'SCR-IP13', 'Complete screen assembly for iPhone 13 with OLED display', 19, 12, 129.99, 'Apple Parts Inc', 'iPhone', 'iPhone 13', '2023-09-04', '2025-04-07', '2025-04-07'),
                                                                                                                                                                         ('iPhone 13 Battery', 'BAT-IP13', 'Replacement battery for iPhone 13', 4, 15, 44.99, 'Power Solutions Ltd', 'iPhone', 'iPhone 13', '2025-04-08', '2025-04-07', '2025-04-08'),
                                                                                                                                                                         ('MacBook Pro 14\" Logic Board', 'LOG-MBP14', 'M1 Pro chip logic board for MacBook Pro 14\"', 1, 4, 749.99, 'Tech Logic Supply', 'MacBook', 'MacBook Pro 14\"', '2025-04-08', '2025-04-07', '2025-04-08'),
                                                                                                                                                                         ('AirPods Pro Charging Case', 'CASE-APP', 'Replacement MagSafe charging case for AirPods Pro', 1, 7, 79.99, 'Apple Audio Parts', 'AirPods', 'AirPods Pro', '2025-04-08', '2025-04-07', '2025-04-08');

-- Insert revenue data
INSERT INTO revenue (id, period, today, this_week, this_month, last_month, period_label, today_change, week_change, month_change, repair_sales_ratio) VALUES
                                                                                                                                                          (7, 'today', 2450, 15680, 68450, 62340, 'Today', '+5.2%', '+3.6%', '+9.8%', '65:35'),
                                                                                                                                                          (8, '7days', 2450, 15680, 68450, 62340, 'Last 7 Days', '+5.2%', '+3.6%', '+9.8%', '65:35');

-- Insert daily revenue data
INSERT INTO daily_revenue (revenue_id, date, sales, repairs, total) VALUES
                                                                        (8, '2025-04-01', 1938, 1480, 3410),
                                                                        (8, '2025-04-02', 2100, 1950, 4050),
                                                                        (8, '2025-04-03', 1828, 1350, 3170),
                                                                        (8, '2025-04-04', 1756, 1290, 3046),
                                                                        (8, '2025-04-05', 2032, 1575, 3607),
                                                                        (8, '2025-04-06', 1895, 1605, 3500),
                                                                        (8, '2025-04-07', 1598, 852, 2450),
                                                                        (7, '2025-04-07', 1598, 852, 2450);

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

-- Insert repairs data
INSERT INTO repairs (repair_id, customer, device, problem, status, date, updated_at) VALUES
                                                                                         ('RPR1234', 'John Smith', 'iPhone 12', 'Screen Replacement', 'In Progress', '2025-03-01', '2025-04-08 04:21:38'),
                                                                                         ('RPR1235', 'Emma Johnson', 'MacBook Pro', 'Battery Iss', 'Pending', '2025-03-01', '2025-04-08 03:16:02'),
                                                                                         ('RPR1236', 'Michael Brown', 'Apple Watch', 'Not Turning On', 'In Progress', '2025-02-28', '2025-04-07 14:18:06');

-- Insert traffic data
INSERT INTO traffic (date, visitors, page_views, conversions, period) VALUES
                                                                          ('2025-03-01', 425, 1456, 32, '7days'),
                                                                          ('2025-03-02', 398, 1345, 28, '7days'),
                                                                          ('2025-03-03', 412, 1390, 29, '7days'),
                                                                          ('2025-03-04', 385, 1298, 26, '7days'),
                                                                          ('2025-03-05', 367, 1245, 25, '7days');

-- Insert a sample notification
INSERT INTO notifications (type, message, time, is_read, created_at, read_at) VALUES
                                                                                  ('order', 'Repair order for Emma Johnson\'s MacBook Pro status changed from \"In Progress\" to \"Awaiting Parts\".', 'just now', 1, '2025-04-07 14:18:06', '2025-04-07 16:07:25.804000'),
                                                                                  ('alert', 'CRITICAL: MacBook Pro 14\" Logic Board for MacBook Pro 14\" is critically low (2 units remaining).', 'just now', 1, '2025-04-07 14:18:06', '2025-04-07 16:07:27.383000'),
                                                                                  ('alert', 'CRITICAL: iPhone 13 Battery for iPhone iPhone 13 is critically low (4 units remaining).', 'just now', 1, '2025-04-08 04:22:04', '2025-04-08 07:22:32.669000');