INSERT INTO repairs (customer, device, model, issue, status, priority, date) VALUES
                                                                                 ('Travis Pearson', 'MacBook Air', 'M1 2020', 'Screen broken', 'PENDING', 'High', '2023-07-15'),
                                                                                 ('Ahmet Yılmaz', 'iPhone', '13 Pro', 'Battery drain', 'IN REPAIR', 'Medium', '2023-07-14'),
                                                                                 ('Ayşe Kaya', 'iPad', 'Pro 12.9 2021', 'Not charging', 'AWAITING PARTS', 'High', '2023-07-10'),
                                                                                 ('Mehmet Demir', 'Apple Watch', 'Series 7', 'Screen cracked', 'COMPLETED', 'Low', '2023-07-05');

-- Sample inventory
INSERT INTO inventory (name, category, brand, quantity, price, location, status) VALUES
                                                                                     ('MacBook LCD Screen 13.3 inch', 'macbook', 'Apple', 5, 289.99, 'A3-12', 'In Stock'),
                                                                                     ('iPhone 13 Battery', 'iphone', 'Apple', 2, 89.99, 'B2-05', 'Low Stock'),
                                                                                     ('iPad Pro Charging Port', 'ipad', 'Apple', 0, 45.50, 'C1-08', 'Out of Stock'),
                                                                                     ('Apple Watch Screen Glass', 'watch', 'Apple', 10, 75.25, 'D4-01', 'In Stock');

-- Sample part compatibility
INSERT INTO part_compatibility (part_id, device_name) VALUES
                                                          (1, 'MacBook Air 2018-2020'),
                                                          (1, 'MacBook Pro 2016-2019'),
                                                          (2, 'iPhone 13'),
                                                          (2, 'iPhone 13 Pro'),
                                                          (3, 'iPad Pro 11 2021'),
                                                          (3, 'iPad Pro 12.9 2021'),
                                                          (4, 'Apple Watch Series 7');

-- Sample appointments
INSERT INTO appointments (customer, device, issue, date, time, phone) VALUES
                                                                          ('Mauro Icardi', 'MacBook Air', 'Keyboard replacement', '2023-07-16', '10:00:00', '555-1234'),
                                                                          ('Fatma Şahin', 'iPhone', 'Screen replacement', '2023-07-16', '14:30:00', '555-5678'),
                                                                          ('Ali Yıldız', 'iPad', 'Software issues', '2023-07-17', '09:15:00', '555-9012');

-- Sample knowledge base article
INSERT INTO knowledge_base (title, category, content, popular, date) VALUES
                                                                         ('iPhone Screen Replacement Guide', 'iphone', 'A step-by-step guide for iPhone screen replacement. This process will take approximately 30-45 minutes and requires intermediate technical skills.', TRUE, '2023-05-12'),
                                                                         ('MacBook Battery Replacement', 'macbook', 'How to safely replace a MacBook battery without damaging components.', TRUE, '2023-06-05');

-- Sample steps for knowledge base articles
INSERT INTO kb_steps (kb_id, step_order, step_text) VALUES
                                                        (1, 1, 'Prepare necessary tools: Pentalobe screwdriver, Phillips screwdriver, plastic separator'),
                                                        (1, 2, 'Remove the screws at the bottom edge of the phone'),
                                                        (1, 3, 'Carefully lift the screen and pay attention to the connection cables'),
                                                        (1, 4, 'Transfer the camera and sensor assembly from the old screen to the new one'),
                                                        (1, 5, 'Connect the new screen and test it'),
                                                        (1, 6, 'Secure the screen in place and insert the screws');

-- Sample tips for knowledge base articles
INSERT INTO kb_tips (kb_id, tip_order, tip_text) VALUES
                                                     (1, 1, 'Always take precautions against static electricity'),
                                                     (1, 2, 'Use a magnetic surface to avoid losing screws'),
                                                     (1, 3, 'Reduce the phone''s battery level to below 25% before the procedure');