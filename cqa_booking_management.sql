-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 20, 2026 at 08:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cqa_booking_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `resource_type` varchar(100) DEFAULT NULL,
  `resource_id` char(36) DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `availability_rules`
--

CREATE TABLE `availability_rules` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `day_of_week` int(11) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `capacity_available` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `special_date` date DEFAULT NULL,
  `special_event_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `table_id` char(36) DEFAULT NULL,
  `daybed_id` char(36) DEFAULT NULL,
  `customer_id` char(36) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `customer_special_requests` text DEFAULT NULL,
  `booking_date` date NOT NULL,
  `booking_start_time` time NOT NULL,
  `booking_end_time` time NOT NULL,
  `num_guests` int(11) NOT NULL,
  `num_adults` int(11) DEFAULT NULL,
  `num_children` int(11) DEFAULT NULL,
  `booking_status` varchar(20) NOT NULL DEFAULT 'pending',
  `confirmation_status` varchar(20) NOT NULL DEFAULT 'unconfirmed',
  `cancellation_reason` text DEFAULT NULL,
  `cancellation_by` varchar(20) DEFAULT NULL,
  `cancellation_date` timestamp NULL DEFAULT NULL,
  `cancellation_refund_amount` decimal(10,2) DEFAULT NULL,
  `no_show` tinyint(1) NOT NULL DEFAULT 0,
  `check_in_time` timestamp NULL DEFAULT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `actual_guest_count` int(11) DEFAULT NULL,
  `source` varchar(50) NOT NULL DEFAULT 'website',
  `notes` text DEFAULT NULL,
  `internal_notes` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `deposit_required` decimal(10,2) NOT NULL DEFAULT 0.00,
  `deposit_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `deposit_payment_status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_modifications`
--

CREATE TABLE `booking_modifications` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `modified_by` char(36) DEFAULT NULL,
  `modification_type` varchar(50) DEFAULT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_notifications`
--

CREATE TABLE `booking_notifications` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `notification_type` varchar(50) DEFAULT NULL,
  `notification_channel` varchar(50) DEFAULT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `recipient_phone` varchar(20) DEFAULT NULL,
  `message_template_id` char(36) DEFAULT NULL,
  `scheduled_time` timestamp NULL DEFAULT NULL,
  `sent_time` timestamp NULL DEFAULT NULL,
  `delivery_status` varchar(20) NOT NULL DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_rules`
--

CREATE TABLE `booking_rules` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `rule_name` varchar(255) NOT NULL,
  `rule_type` varchar(50) DEFAULT NULL,
  `condition` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`condition`)),
  `action` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`action`)),
  `priority` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `customer_type` varchar(50) DEFAULT 'regular',
  `total_bookings` int(11) DEFAULT 0,
  `total_spent` decimal(10,2) DEFAULT 0.00,
  `average_spending` decimal(10,2) DEFAULT 0.00,
  `last_booking_date` date DEFAULT NULL,
  `preferred_contact_method` varchar(20) DEFAULT NULL,
  `marketing_consent` tinyint(1) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_preferences`
--

CREATE TABLE `customer_preferences` (
  `id` char(36) NOT NULL,
  `customer_id` char(36) NOT NULL,
  `venue_id` char(36) DEFAULT NULL,
  `preferred_table_type` varchar(50) DEFAULT NULL,
  `preferred_seating_area` varchar(100) DEFAULT NULL,
  `dietary_restrictions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dietary_restrictions`)),
  `allergies` text DEFAULT NULL,
  `special_preferences` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_segments`
--

CREATE TABLE `customer_segments` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `segment_name` varchar(255) NOT NULL,
  `segment_type` varchar(50) DEFAULT NULL,
  `criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`criteria`)),
  `customer_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_segment_membership`
--

CREATE TABLE `customer_segment_membership` (
  `id` char(36) NOT NULL,
  `customer_id` char(36) NOT NULL,
  `segment_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daybeds`
--

CREATE TABLE `daybeds` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `section_id` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `daybed_number` varchar(50) DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `price_per_daybed` decimal(10,2) DEFAULT NULL,
  `minimum_spend` decimal(10,2) DEFAULT NULL,
  `setup_time_minutes` int(11) DEFAULT 60,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_templates`
--

CREATE TABLE `email_templates` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `template_type` varchar(50) DEFAULT NULL,
  `subject_template` text DEFAULT NULL,
  `body_template` text DEFAULT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC',
  `subscription_status` varchar(20) NOT NULL DEFAULT 'active',
  `subscription_plan` varchar(50) NOT NULL DEFAULT 'starter',
  `subscription_start_date` timestamp NULL DEFAULT NULL,
  `subscription_end_date` timestamp NULL DEFAULT NULL,
  `max_venues` int(11) NOT NULL DEFAULT 1,
  `max_staff` int(11) NOT NULL DEFAULT 5,
  `max_bookings_per_day` int(11) NOT NULL DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `slug`, `description`, `logo_url`, `website`, `country`, `city`, `timezone`, `subscription_status`, `subscription_plan`, `subscription_start_date`, `subscription_end_date`, `max_venues`, `max_staff`, `max_bookings_per_day`, `created_at`, `updated_at`, `deleted_at`) VALUES
('47cb2e54-02ef-4641-9720-b14973a0a6e4', 'Pubs & Clubs in United States', 'pubs-clubs-in-united-states', NULL, NULL, NULL, NULL, NULL, 'UTC', 'active', 'starter', NULL, NULL, 1, 5, 100, '2026-08-19 13:18:35', '2026-08-19 13:18:35', NULL),
('89831381-bf5a-4f49-98b1-ffed676f22f6', 'Pizza Palace', 'pizza-palace', NULL, NULL, NULL, NULL, NULL, 'Europe/London', 'active', 'starter', NULL, NULL, 1, 5, 100, '2026-08-18 08:59:50', '2026-08-19 07:04:39', NULL),
('c37a97bc-95a2-4e50-a8bb-927e8b795539', 'CQA Admin', 'cqa-admin', NULL, NULL, NULL, NULL, NULL, 'UTC', 'active', 'starter', NULL, NULL, 999, 5, 100, '2026-08-18 11:21:49', '2026-08-19 07:04:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `booking_id` char(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'INR',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refunds`
--

CREATE TABLE `refunds` (
  `id` char(36) NOT NULL,
  `payment_id` char(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `refund_reason` varchar(255) DEFAULT NULL,
  `refund_status` varchar(20) DEFAULT 'pending',
  `stripe_refund_id` varchar(255) DEFAULT NULL,
  `refund_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' CHECK (json_valid(`permissions`)),
  `is_system_role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_assignments`
--

CREATE TABLE `role_assignments` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role_id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `section_type` varchar(50) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `floor_number` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_templates`
--

CREATE TABLE `sms_templates` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `template_type` varchar(50) DEFAULT NULL,
  `message_template` text DEFAULT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `employment_type` varchar(20) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` varchar(36) NOT NULL,
  `organization_id` varchar(36) NOT NULL,
  `plan` enum('starter','professional','enterprise') DEFAULT 'starter',
  `monthly_price` decimal(10,2) NOT NULL,
  `max_venues` int(11) DEFAULT 1,
  `max_staff` int(11) DEFAULT 5,
  `max_bookings_per_day` int(11) DEFAULT 50,
  `status` enum('active','paused','cancelled') DEFAULT 'active',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `auto_renew` tinyint(1) DEFAULT 1,
  `cancellation_date` datetime DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `organization_id`, `plan`, `monthly_price`, `max_venues`, `max_staff`, `max_bookings_per_day`, `status`, `start_date`, `end_date`, `auto_renew`, `cancellation_date`, `cancellation_reason`, `created_at`, `updated_at`) VALUES
('ef8e52cd-74df-4c3d-bffd-243a29228f83', 'c37a97bc-95a2-4e50-a8bb-927e8b795539', 'enterprise', 0.00, 999, 999, 9999, 'active', '2026-08-18 11:21:49', '2027-08-18 11:21:49', 1, NULL, NULL, '2026-08-18 11:21:49', '2026-08-19 05:55:53');

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

CREATE TABLE `tables` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `section_id` char(36) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `table_number` varchar(50) DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `min_capacity` int(11) DEFAULT 1,
  `table_type` varchar(50) DEFAULT NULL,
  `table_shape` varchar(50) DEFAULT NULL,
  `high_chairs` int(11) DEFAULT 0,
  `wheelchair_accessible` tinyint(1) DEFAULT 0,
  `price_per_person` decimal(10,2) DEFAULT 0.00,
  `setup_time_minutes` int(11) DEFAULT 30,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `venue_id`, `section_id`, `name`, `table_number`, `capacity`, `min_capacity`, `table_type`, `table_shape`, `high_chairs`, `wheelchair_accessible`, `price_per_person`, `setup_time_minutes`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('ce25241e-b3b7-4dfa-913f-b12da910fa2b', '32346213-39a2-4cbd-bc91-5e271aeeb83a', NULL, 'Table 1', 'T901', 4, 1, 'standard', NULL, 0, 0, 50.00, 30, 'active', '2026-08-18 09:18:33', '2026-08-18 09:18:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `time_slots`
--

CREATE TABLE `time_slots` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `slot_start_time` time NOT NULL,
  `slot_end_time` time NOT NULL,
  `slot_duration_minutes` int(11) DEFAULT 120,
  `break_between_slots_minutes` int(11) DEFAULT 0,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(500) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'staff',
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_super_admin` tinyint(1) DEFAULT 0,
  `phone_verified` tinyint(1) NOT NULL DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `organization_id`, `email`, `phone`, `first_name`, `last_name`, `password_hash`, `role`, `status`, `email_verified`, `is_super_admin`, `phone_verified`, `last_login`, `profile_picture_url`, `created_at`, `updated_at`, `deleted_at`) VALUES
('5876e49f-486c-4dd0-b9fe-dfb09307830f', '47cb2e54-02ef-4641-9720-b14973a0a6e4', 'ap2043504@gmail.com', NULL, 'Abhishek', 'Prajapati', '$2b$10$iELGMw3qJFZt3UWALVKQ9uyZRzjkuLmUG1PEzpyAwkFs16VjZBMRW', 'admin', 'active', 0, 0, 0, NULL, NULL, '2026-08-19 13:18:36', '2026-08-19 13:18:36', NULL),
('87fbe7f1-2479-4487-a866-81601a690699', '89831381-bf5a-4f49-98b1-ffed676f22f6', 'owner@pizzapalace.com', NULL, 'Raj', 'Sharma', '$2b$10$CKcZrGn50pOiKyHJm2mZAONuC7SW/pcYPkb40EyG54BFGX3tk6Bxu', 'admin', 'active', 0, 0, 0, NULL, NULL, '2026-08-18 08:59:50', '2026-08-18 08:59:50', NULL),
('d197865c-e04d-4389-a123-80a9d143db15', 'c37a97bc-95a2-4e50-a8bb-927e8b795539', 'superadmin@cqabooking.com', NULL, 'Super', 'Admin', '$2b$10$E13yrObrwDTpoyJBrOzSHuKlmYPyjqW9nbuXWUu5u1ZtoWqP7RRl6', 'superadmin', 'active', 1, 1, 0, NULL, NULL, '2026-08-18 11:21:49', '2026-08-18 11:21:49', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `venues`
--

CREATE TABLE `venues` (
  `id` char(36) NOT NULL,
  `organization_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `venue_type` varchar(50) DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `average_rating` decimal(3,2) DEFAULT NULL,
  `total_reviews` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `capacity` int(11) DEFAULT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'INR',
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `venues`
--

INSERT INTO `venues` (`id`, `organization_id`, `name`, `slug`, `description`, `address`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `phone`, `email`, `website`, `logo_url`, `cover_image_url`, `venue_type`, `opening_time`, `closing_time`, `average_rating`, `total_reviews`, `status`, `capacity`, `currency`, `timezone`, `created_at`, `updated_at`, `deleted_at`) VALUES
('32346213-39a2-4cbd-bc91-5e271aeeb83a', '89831381-bf5a-4f49-98b1-ffed676f22f6', 'Canggu Beach Club', 'canggu-beach-club', NULL, 'Bali', 'Canggu', NULL, NULL, NULL, NULL, NULL, '081234567890', NULL, NULL, NULL, NULL, 'beach_club', '09:00:00', '23:00:00', NULL, 0, 'active', 100, 'INR', 'UTC', '2026-08-18 09:09:42', '2026-08-18 09:09:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `venue_settings`
--

CREATE TABLE `venue_settings` (
  `id` char(36) NOT NULL,
  `venue_id` char(36) NOT NULL,
  `allow_online_booking` tinyint(1) DEFAULT 1,
  `require_deposit` tinyint(1) DEFAULT 0,
  `deposit_percentage` int(11) DEFAULT 0,
  `max_advance_booking_days` int(11) DEFAULT 90,
  `min_advance_booking_hours` int(11) DEFAULT 2,
  `allow_group_bookings` tinyint(1) DEFAULT 1,
  `min_group_size` int(11) DEFAULT 1,
  `max_group_size` int(11) DEFAULT 50,
  `cancellation_policy` varchar(20) DEFAULT 'flexible',
  `cancellation_hours_required` int(11) DEFAULT 24,
  `no_show_penalty` decimal(10,2) DEFAULT NULL,
  `enable_auto_confirmation` tinyint(1) DEFAULT 1,
  `auto_confirmation_minutes` int(11) DEFAULT 15,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_logs_user_id` (`user_id`),
  ADD KEY `idx_audit_logs_organization` (`organization_id`,`created_at`);

--
-- Indexes for table `availability_rules`
--
ALTER TABLE `availability_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_availability_venue_date` (`venue_id`,`special_date`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_booking_table_slot` (`venue_id`,`table_id`,`booking_date`,`booking_start_time`),
  ADD KEY `booking_date_idx` (`booking_date`),
  ADD KEY `venue_date_idx` (`venue_id`,`booking_date`),
  ADD KEY `fk_bookings_organization_id` (`organization_id`),
  ADD KEY `fk_bookings_table_id` (`table_id`),
  ADD KEY `fk_bookings_daybed_id` (`daybed_id`),
  ADD KEY `fk_bookings_created_by` (`created_by`),
  ADD KEY `idx_bookings_venue_date` (`venue_id`,`booking_date`),
  ADD KEY `idx_bookings_customer` (`customer_id`),
  ADD KEY `idx_bookings_status` (`booking_status`);

--
-- Indexes for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_booking_modifications_booking_id` (`booking_id`),
  ADD KEY `fk_booking_modifications_modified_by` (`modified_by`);

--
-- Indexes for table `booking_notifications`
--
ALTER TABLE `booking_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_booking_notifications_booking_id` (`booking_id`);

--
-- Indexes for table `booking_rules`
--
ALTER TABLE `booking_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_booking_rules_venue_id` (`venue_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_id` (`organization_id`,`email`),
  ADD KEY `fk_customers_user_id` (`user_id`),
  ADD KEY `idx_customers_organization` (`organization_id`);

--
-- Indexes for table `customer_preferences`
--
ALTER TABLE `customer_preferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_customer_preferences_customer_id` (`customer_id`),
  ADD KEY `fk_customer_preferences_venue_id` (`venue_id`);

--
-- Indexes for table `customer_segments`
--
ALTER TABLE `customer_segments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_id` (`organization_id`,`segment_name`);

--
-- Indexes for table `customer_segment_membership`
--
ALTER TABLE `customer_segment_membership`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`,`segment_id`),
  ADD KEY `fk_customer_segment_membership_segment_id` (`segment_id`);

--
-- Indexes for table `daybeds`
--
ALTER TABLE `daybeds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `venue_id` (`venue_id`,`daybed_number`),
  ADD KEY `fk_daybeds_section_id` (`section_id`);

--
-- Indexes for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_organization_template_name` (`organization_id`,`template_name`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payments_booking_id` (`booking_id`);

--
-- Indexes for table `refunds`
--
ALTER TABLE `refunds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_refunds_payment_id` (`payment_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_id` (`organization_id`,`name`);

--
-- Indexes for table `role_assignments`
--
ALTER TABLE `role_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`role_id`),
  ADD KEY `fk_role_assignments_role_id` (`role_id`),
  ADD KEY `fk_role_assignments_organization_id` (`organization_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_venue_section_name` (`venue_id`,`name`);

--
-- Indexes for table `sms_templates`
--
ALTER TABLE `sms_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_id` (`organization_id`,`template_name`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_staff_venue_id` (`venue_id`),
  ADD KEY `fk_staff_user_id` (`user_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_id` (`organization_id`),
  ADD KEY `idx_org_id` (`organization_id`);

--
-- Indexes for table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `venue_id` (`venue_id`,`table_number`),
  ADD KEY `fk_tables_section_id` (`section_id`);

--
-- Indexes for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `venue_id` (`venue_id`,`slot_start_time`,`slot_end_time`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_organization_email` (`organization_id`,`email`),
  ADD KEY `idx_users_organization` (`organization_id`);

--
-- Indexes for table `venues`
--
ALTER TABLE `venues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_organization_slug` (`organization_id`,`slug`);

--
-- Indexes for table `venue_settings`
--
ALTER TABLE `venue_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `venue_id` (`venue_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_audit_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `availability_rules`
--
ALTER TABLE `availability_rules`
  ADD CONSTRAINT `fk_availability_rules_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bookings_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bookings_daybed_id` FOREIGN KEY (`daybed_id`) REFERENCES `daybeds` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bookings_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bookings_table_id` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bookings_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD CONSTRAINT `fk_booking_modifications_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_modifications_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `booking_notifications`
--
ALTER TABLE `booking_notifications`
  ADD CONSTRAINT `fk_booking_notifications_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_rules`
--
ALTER TABLE `booking_rules`
  ADD CONSTRAINT `fk_booking_rules_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customers_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_customers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_preferences`
--
ALTER TABLE `customer_preferences`
  ADD CONSTRAINT `fk_customer_preferences_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_customer_preferences_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customer_segments`
--
ALTER TABLE `customer_segments`
  ADD CONSTRAINT `fk_customer_segments_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_segment_membership`
--
ALTER TABLE `customer_segment_membership`
  ADD CONSTRAINT `fk_customer_segment_membership_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_customer_segment_membership_segment_id` FOREIGN KEY (`segment_id`) REFERENCES `customer_segments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daybeds`
--
ALTER TABLE `daybeds`
  ADD CONSTRAINT `fk_daybeds_section_id` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_daybeds_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD CONSTRAINT `fk_email_templates_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refunds`
--
ALTER TABLE `refunds`
  ADD CONSTRAINT `fk_refunds_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `fk_roles_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_assignments`
--
ALTER TABLE `role_assignments`
  ADD CONSTRAINT `fk_role_assignments_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_assignments_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_assignments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `fk_sections_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sms_templates`
--
ALTER TABLE `sms_templates`
  ADD CONSTRAINT `fk_sms_templates_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `fk_staff_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_staff_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tables`
--
ALTER TABLE `tables`
  ADD CONSTRAINT `fk_tables_section_id` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tables_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD CONSTRAINT `fk_time_slots_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `venues`
--
ALTER TABLE `venues`
  ADD CONSTRAINT `fk_venues_organization_id` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `venue_settings`
--
ALTER TABLE `venue_settings`
  ADD CONSTRAINT `fk_venue_settings_venue_id` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
