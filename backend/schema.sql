-- =========================================================================
-- Agriculture Supporter — MySQL Schema
-- -------------------------------------------------------------------------
-- This schema mirrors the mock data structures used in assets/js/data.js
-- so the frontend can be pointed at a real API with minimal changes.
-- Import with:  mysql -u root -p agriculture_supporter < schema.sql
-- =========================================================================

CREATE DATABASE IF NOT EXISTS agriculture_supporter
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agriculture_supporter;

-- ---------------------------------------------------------------------
-- USERS  (backs auth.html / assets/js/auth.js)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,      -- store bcrypt/argon2 hash, never plain text
  farm_type     VARCHAR(60)   DEFAULT 'General',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- ANIMAL HUSBANDRY
-- ---------------------------------------------------------------------
CREATE TABLE animal_categories (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  slug    VARCHAR(60)  NOT NULL UNIQUE,
  name    VARCHAR(120) NOT NULL,
  icon    VARCHAR(20)  NOT NULL,   -- emoji or icon class used by the card
  color_a VARCHAR(10)  NOT NULL,   -- gradient start (hex)
  color_b VARCHAR(10)  NOT NULL,   -- gradient end (hex)
  blurb   VARCHAR(255)
);

CREATE TABLE animals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NOT NULL,
  slug          VARCHAR(80)  NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  icon          VARCHAR(20)  NOT NULL,
  care          TEXT,
  feeding       TEXT,
  diseases      TEXT,
  housing       TEXT,
  breeding      TEXT,
  management    TEXT,
  FOREIGN KEY (category_id) REFERENCES animal_categories(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- CROP PRODUCTION
-- ---------------------------------------------------------------------
CREATE TABLE crop_categories (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  slug    VARCHAR(60)  NOT NULL UNIQUE,
  name    VARCHAR(120) NOT NULL,
  icon    VARCHAR(20)  NOT NULL,
  color_a VARCHAR(10)  NOT NULL,
  color_b VARCHAR(10)  NOT NULL,
  blurb   VARCHAR(255)
);

CREATE TABLE crops (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NOT NULL,
  slug          VARCHAR(80)  NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  icon          VARCHAR(20)  NOT NULL,
  growth        TEXT,
  climate       TEXT,
  soil          TEXT,
  fertilizers   TEXT,
  irrigation    TEXT,
  pests         TEXT,
  harvesting    TEXT,
  season        TEXT,
  FOREIGN KEY (category_id) REFERENCES crop_categories(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- SEARCH BY LOCATION
-- ---------------------------------------------------------------------
CREATE TABLE states (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE location_recommendations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  state_id        INT NOT NULL,
  climate         VARCHAR(120),
  tip             TEXT,
  top_crops       JSON,   -- e.g. ["Rice", "Coconut", "Spices"]
  top_animals     JSON,   -- e.g. ["Dairy", "Poultry"]
  FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Sample seed row (repeat this pattern per category/animal/crop/state)
-- ---------------------------------------------------------------------
INSERT INTO animal_categories (slug, name, icon, color_a, color_b, blurb) VALUES
  ('poultry', 'Poultry', '🐔', '#F0CD94', '#E3A857', 'Chickens, ducks & turkeys for eggs and meat.');

INSERT INTO crop_categories (slug, name, icon, color_a, color_b, blurb) VALUES
  ('cereals', 'Cereals', '🌾', '#F0CD94', '#E3A857', 'Staple grain crops like rice, wheat & maize.');

INSERT INTO states (name) VALUES ('Kerala'), ('Punjab'), ('Maharashtra');
