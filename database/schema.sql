CREATE DATABASE IF NOT EXISTS dental_prescription
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dental_prescription;

CREATE TABLE IF NOT EXISTS prescription_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('complaint','examination','diagnosis','investigation','advice') NOT NULL,
  label VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_label (category, label)
);

CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) DEFAULT '',
  strength VARCHAR(120) DEFAULT '',
  form VARCHAR(100) DEFAULT '',
  route VARCHAR(100) DEFAULT '',
  default_dose VARCHAR(255) DEFAULT '',
  default_frequency VARCHAR(255) DEFAULT '',
  default_duration VARCHAR(255) DEFAULT '',
  notes TEXT,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinic_settings (
  id INT PRIMARY KEY,
  clinic_name VARCHAR(255) DEFAULT 'Dental Clinic',
  doctor_name VARCHAR(255) DEFAULT '',
  qualifications VARCHAR(255) DEFAULT '',
  registration_no VARCHAR(120) DEFAULT '',
  address TEXT,
  phone VARCHAR(100) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  footer_text VARCHAR(500) DEFAULT ''
);

INSERT IGNORE INTO clinic_settings (id, clinic_name) VALUES (1, 'Dental Clinic');

INSERT IGNORE INTO prescription_options (category, label, sort_order) VALUES
('complaint','Toothache',1),
('complaint','Tooth sensitivity',2),
('complaint','Gum bleeding',3),
('complaint','Gum swelling',4),
('complaint','Facial swelling',5),
('examination','Dental caries observed',1),
('examination','Gingival swelling',2),
('examination','Calculus present',3),
('examination','Tenderness on percussion',4),
('diagnosis','Dental caries',1),
('diagnosis','Pulpitis (confirm clinical subtype)',2),
('diagnosis','Periapical condition (specify)',3),
('investigation','CBC',1),
('investigation','Dental X-ray',2),
('advice','Maintain oral hygiene',1),
('advice','Brush twice daily',2),
('advice','Return for follow-up as advised',3);

-- Deliberately no medication samples: a clinician should populate and verify this catalogue.
