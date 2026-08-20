# Lost & Found - Project Context

## Project Overview

Lost & Found is a location-based web application that helps people recover lost belongings more efficiently.

Many lost items are never returned because there is no centralized and accessible way for people to report, discover, and match lost and found items within their communities.

The platform allows users to report lost items, report found items, and automatically discover potential matches based on item details and location proximity.

The primary goal is to increase the likelihood of recovering lost belongings through technology, community participation, and intelligent matching.

---

# Core Problem

Current lost-and-found processes are fragmented.

People typically:

* Post on social media
* Ask nearby communities
* Contact local authorities
* Rely on chance

There is no unified platform that helps connect lost-item owners with people who have found those items.

---

# Proposed Solution

A centralized web platform where users can:

1. Create Lost Item reports
2. Create Found Item reports
3. Upload photos
4. Specify locations
5. Describe items
6. Receive automatic match suggestions
7. Receive notifications when matches are found
8. Communicate with matching users
9. Mark items as recovered

---

# Target Users

* Students
* College communities
* Local communities
* Event attendees
* Public transportation users
* General public

---

# Core User Flow

User Registration/Login

↓

Home Feed

↓

Create Lost Item Post
OR
Create Found Item Post

↓

Matching System

↓

Notifications

↓

User Communication

↓

Item Recovered

↓

Mark Case Resolved

---

# MVP Features

## Authentication

Users have accounts.

Fields:

User:

* id
* username
* email
* password
* optional profile picture
* general location
* createdAt

Authentication is required because:

* Users own posts
* Notifications require accounts
* Communication requires identity

---

## Lost Item Post

Fields:

* type = lost
* image
* category
* description
* location
* dateLost
* status
* userId

---

## Found Item Post

Fields:

* type = found
* image
* category
* description
* location
* dateFound
* status
* userId

---

## Home Feed

The Home Feed acts as the main platform hub.

Feed displays:

* Lost Item posts
* Found Item posts

Users can:

* Search
* Browse
* Filter by category

Resolved posts should be visually deprioritized.

---

## Matching System

Matching is the core feature.

Compare:

### Category Match

Examples:

* Wallet ↔ Wallet
* Backpack ↔ Backpack

### Description Similarity

Compare:

* colors
* keywords
* identifying features

### Location Proximity

Compare:

* lost location
* found location

Items found nearby receive higher confidence.

### Date Validation

Important Rule:

Found Date MUST NOT be earlier than Lost Date.

If:

Found Date < Lost Date

then the match is invalid.

---

## Notifications

When a potential match is detected:

Notify:

* Lost item owner
* Found item reporter

Example:

"Possible match found for your lost wallet."

Users can view notifications from a dedicated notifications page.

---

## Resolution

After successful recovery:

Post status becomes:

FOUND
or
RESOLVED

Resolved items:

* remain in database
* are deprioritized in feed

---

# Future Features

Not required for MVP.

## Nearby User Notifications

Notify users in nearby locations when a found item is reported.

## Community Verification

Allow community members to verify potential matches.

## Advanced Matching

Use AI/ML in the future for image and description similarity.

---

# Features Removed From Scope

The original User Reports page was intentionally removed.

Reason:

Reduce MVP complexity.

Possible replacement:

Simple "My Posts" page.

---

# Admin Dashboard

Purpose:

Monitor platform health.

Metrics:

* Total Lost Reports
* Total Found Reports
* Total Resolved Cases
* Recovery Rate
* Average Resolution Time
* Most Common Categories

---

# Tech Stack

Frontend:

* React
* JavaScript
* React Router

Backend:

* Node.js
* Express.js

Database:

* MongoDB

Authentication:

* JWT / Session-based authentication

Hosting:

* TBD

---
