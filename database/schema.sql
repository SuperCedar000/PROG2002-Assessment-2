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

-- Insert sample events with updated data
INSERT INTO events (name, description, event_date, event_time, location, category_id, organisation_id, goal_amount, current_amount, ticket_price, is_active) VALUES 
('AxX Summer Fun Run', '10km coastal run for ocean conservation', '2025-01-20', '07:00:00', 'Bondi Beach, Sydney', 1, 2, 40000.00, 25000.00, 30.00, TRUE),
('Winter Charity Gala 2025', 'Elegant formal ball for medical research', '2025-08-25', '19:30:00', 'Four Seasons Hotel', 5, 2, 60000.00, 35000.00, 120.00, TRUE),
('Art & Culture Silent Auction', 'Auction featuring local artist masterpieces', '2025-09-30', '18:30:00', 'Art Gallery of NSW', 3, 1, 20000.00, 12000.00, 0.00, TRUE),
('Hope Concert 2025', 'Live music festival for disaster relief', '2025-12-05', '20:00:00', 'Opera House, Sydney', 4, 1, 30000.00, 18000.00, 50.00, TRUE),
('AxX Sydney Marathon 2025', 'Annual city marathon for cancer research', '2025-10-15', '08:00:00', 'Sydney Park, NSW', 1, 2, 50000.00, 32500.00, 25.00, TRUE),
('Community Basketball Tournament', 'Youth sports event for education programs', '2025-10-10', '09:00:00', 'Sydney Sports Centre', 6, 1, 15000.00, 8000.00, 15.00, TRUE),
('Wildlife Conservation Gala', 'Exclusive dinner for wildlife protection', '2025-11-20', '19:00:00', 'Hilton Hotel, Sydney', 2, 3, 75000.00, 45000.00, 150.00, TRUE),
('Classical Music Festival', 'Symphony orchestra for education funds', '2025-11-15', '19:00:00', 'City Recital Hall', 4, 3, 25000.00, 15000.00, 45.00, TRUE),
('Spring Charity Walk', '5km walk through botanical gardens', '2025-03-15', '09:00:00', 'Royal Botanic Gardens', 1, 1, 18000.00, 9500.00, 10.00, TRUE),
('Tech for Good Hackathon', '48-hour coding marathon for social causes', '2025-06-10', '08:00:00', 'UTS Building 11', 6, 2, 35000.00, 22000.00, 0.00, TRUE),
('Vintage Car Show & Auction', 'Classic car exhibition and charity auction', '2025-07-22', '10:00:00', 'Olympic Park', 3, 3, 45000.00, 28000.00, 25.00, TRUE),
('Food & Wine Festival', 'Gourmet food tasting for hunger relief', '2025-05-18', '11:00:00', 'The Rocks, Sydney', 2, 1, 28000.00, 16500.00, 65.00, TRUE),
('Beach Volleyball Championship', 'Professional tournament for youth sports', '2025-02-08', '08:30:00', 'Manly Beach', 6, 2, 22000.00, 13000.00, 20.00, TRUE),
('Jazz Night Under the Stars', 'Open-air jazz concert for arts education', '2025-04-12', '18:00:00', 'Darling Harbour', 4, 3, 32000.00, 19500.00, 40.00, TRUE),
('Business Leaders Summit', 'Corporate networking for community projects', '2025-09-05', '08:30:00', 'International Convention Centre', 2, 1, 55000.00, 32000.00, 200.00, TRUE);