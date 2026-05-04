-- V11: Add default recipient info to users table
-- Allows users to save their preferred shipping info for faster checkout
-- All columns are nullable for backward compatibility

ALTER TABLE users
    ADD COLUMN default_recipient_name VARCHAR(100) NULL,
    ADD COLUMN default_phone          VARCHAR(20)  NULL,
    ADD COLUMN default_zip_code       VARCHAR(10)  NULL,
    ADD COLUMN default_address        VARCHAR(500) NULL,
    ADD COLUMN default_note           VARCHAR(500) NULL;
