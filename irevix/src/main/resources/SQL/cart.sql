USE repair_shop_db;

CREATE TABLE IF NOT EXISTS cart (
                                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                    user_id VARCHAR(255) NOT NULL,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE cart
    MODIFY COLUMN user_id VARCHAR(255) NOT NULL;