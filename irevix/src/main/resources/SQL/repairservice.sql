USE repair_shop_db;
-- Create repair service types table
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

-- Create repair service options table
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

-- Insert sample data for iPhone repairs
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