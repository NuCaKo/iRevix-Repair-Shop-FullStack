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


INSERT INTO appointments (customer_name, customer_phone, customer_email, device_type, device_model, issue_description, appointment_date_time, status) VALUES
('Kemal Aydın', '555-123-4567', 'kemal@example.com', 'iPhone', '14 Pro', 'Screen replacement', '2025-04-08 10:00:00', 'PENDING'),
('Seda Demir', '555-234-5678', 'seda@example.com', 'MacBook', 'Air', 'Battery replacement', '2023-07-25 11:30:00', 'PENDING'),
('Emre Yılmaz', '555-345-6789', 'emre@example.com', 'iPad', 'Pro', 'Not turning on', '2023-07-25 14:00:00', 'PENDING');


-- Insert inventory items
INSERT INTO inventory (name, category, quantity, price, location, reorder_level) VALUES
('iPhone 13 Pro Screen', 'iphone', 5, 1200.00, 'Shelf A1', 3),
('MacBook M1 Battery', 'macbook', 2, 950.00, 'Shelf B2', 2),
('iPad Pro 12.9 Digitizer', 'ipad', 3, 850.00, 'Shelf C1', 2),
('Apple Watch S7 Screen', 'watch', 1, 500.00, 'Shelf D1', 2),
('iPhone 12 Battery', 'iphone', 8, 250.00, 'Shelf A2', 4),
('MacBook Pro 16 Keyboard', 'macbook', 0, 1100.00, 'Shelf B3', 1),
('AirPods Pro Case', 'airpods', 4, 350.00, 'Shelf E1', 3),
('Lightning Cable', 'accessories', 15, 50.00, 'Drawer F1', 5),
('USB-C Charging Port', 'macbook', 3, 180.00, 'Shelf B1', 2),
('iPhone Camera Module', 'iphone', 2, 450.00, 'Shelf A3', 2);

-- Insert knowledge base articles
INSERT INTO knowledge_base_article (title, content, category, date, popular) VALUES
('iPhone 13 Battery Replacement Guide', 'Complete step-by-step guide for replacing the battery in iPhone 13 models.', 'iphone', '2023-05-10', true),
('MacBook M1 Display Assembly Repair', 'How to safely replace the display assembly in M1 MacBooks.', 'macbook', '2023-04-22', true),
('iPad Charging Port Diagnosis', 'Diagnose and fix common charging issues in iPad models.', 'ipad', '2023-06-15', false),
('Apple Watch Screen Replacement', 'Guide for replacing broken screens on Apple Watch Series 6 and 7.', 'watch', '2023-03-30', true),
('AirPods Pro Charging Case Repair', 'How to fix charging issues with AirPods Pro cases.', 'airpods', '2023-05-25', false),
('Common iPhone Water Damage Solutions', 'Steps to diagnose and repair water-damaged iPhones.', 'iphone', '2023-02-18', true);

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

kullanlmyor şuan
-- Insert compatible devices for inventory items
INSERT INTO compatible_device (inventory_id, device_model) VALUES
(1, 'iPhone 13 Pro'),
(1, 'iPhone 13 Pro Max'),
(2, 'MacBook Air M1 2020'),
(2, 'MacBook Pro M1 2020'),
(3, 'iPad Pro 12.9 2021'),
(3, 'iPad Pro 12.9 2022'),
(4, 'Apple Watch Series 7 41mm'),
(4, 'Apple Watch Series 7 45mm'),
(5, 'iPhone 12'),
(5, 'iPhone 12 Mini'),
(6, 'MacBook Pro 16 2021'),
(7, 'AirPods Pro'),
(9, 'MacBook Pro 13 2020'),
(9, 'MacBook Air M1 2020'),
(10, 'iPhone 12'),
(10, 'iPhone 13');



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

-- Insert tips for knowledge base articles
INSERT INTO kb_tip (kb_id, content) VALUES
(1, 'Always use a battery with the same specifications as the original.'),
(1, 'Calibrate the new battery by fully charging and then draining it.'),
(2, 'Use a dust-free environment when replacing the display.'),
(2, 'Mark each screw location as they vary in size and length.'),
(3, 'Check for lint and debris in the charging port first.'),
(4, 'Apply heat slowly and evenly to prevent damage to internal components.'),
(5, 'Reset the AirPods by holding the button on the case for 15 seconds.');

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