-- Charity Events Database Schema
-- PROG2002 Assessment 2

CREATE DATABASE IF NOT EXISTS charityevents_db;
USE charityevents_db;

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organisations table
CREATE TABLE organisations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(500) NOT NULL,
    category_id INT,
    organisation_id INT,
    goal_amount DECIMAL(10,2) DEFAULT 0.00,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    ticket_price DECIMAL(8,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (organisation_id) REFERENCES organisations(id)
);

-- Insert sample categories
INSERT INTO categories (name) VALUES 
('Fun Run'),
('Gala Dinner'),
('Silent Auction'),
('Concert'),
('Charity Ball'),
('Sports Tournament');

-- Insert sample organisations
INSERT INTO organisations (name, description, contact_email, phone, website) VALUES 
('Red Cross Australia', 'Helping people in crisis', 'contact@redcross.org.au', '1800 733 276', 'https://www.redcross.org.au'),
('Cancer Council', 'Leading cancer charity', 'info@cancer.org.au', '13 11 20', 'https://www.cancer.org.au'),
('World Wildlife Fund', 'Conserving nature and wildlife', 'enquiries@wwf.org.au', '1800 032 551', 'https://www.wwf.org.au');

-- Insert sample events (at least 8 events as required)
INSERT INTO events (name, description, event_date, event_time, location, category_id, organisation_id, goal_amount, current_amount, ticket_price, is_active) VALUES 
('Sydney Fun Run 2025', 'Annual 5km fun run for cancer research', '2025-10-15', '08:00:00', 'Sydney Park, NSW', 1, 2, 50000.00, 32500.00, 25.00, TRUE),
('Charity Gala Dinner', 'Elegant dinner to support wildlife conservation', '2025-11-20', '19:00:00', 'Hilton Hotel, Sydney', 2, 3, 75000.00, 45000.00, 150.00, TRUE),
('Art Silent Auction', 'Auction of local artist works', '2025-09-30', '18:30:00', 'Art Gallery of NSW', 3, 1, 20000.00, 12000.00, 0.00, TRUE),
('Hope Concert', 'Live music event for disaster relief', '2025-12-05', '20:00:00', 'Opera House, Sydney', 4, 1, 30000.00, 18000.00, 50.00, TRUE),
('Winter Charity Ball', 'Formal ball supporting medical research', '2025-08-25', '19:30:00', 'Four Seasons Hotel', 5, 2, 60000.00, 35000.00, 120.00, TRUE),
('Basketball Tournament', 'Community sports event for youth programs', '2025-10-10', '09:00:00', 'Sydney Sports Centre', 6, 1, 15000.00, 8000.00, 15.00, TRUE),
('Summer Fun Run', '10km run along the coastline', '2025-01-20', '07:00:00', 'Bondi Beach, Sydney', 1, 2, 40000.00, 25000.00, 30.00, TRUE),
('Classical Music Night', 'Orchestra performance for education funds', '2025-11-15', '19:00:00', 'City Recital Hall', 4, 3, 25000.00, 15000.00, 45.00, TRUE);