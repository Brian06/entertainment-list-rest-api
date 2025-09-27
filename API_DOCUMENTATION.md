# Entertainment List REST API Documentation

## Overview
A comprehensive REST API for managing users and entertainment items (movies, TV series, anime, games) with advanced features including unified watchlists, detailed reviews, ratings, and social features.

## Base URL
```
http://localhost:8080
```

## Authentication
All endpoints (except auth endpoints) require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Sign Up
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "user created!",
  "userId": "user_id_here"
}
```

### Login
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Logged in user!",
  "token": "jwt_token_here",
  "userId": "user_id_here"
}
```

---

## 🎬 Items Management

### Get Items (Enhanced)
**GET** `/items/items`

Retrieve items with advanced filtering, search, and sorting capabilities.

**Query Parameters:**
- `type` (optional): `movie`, `serie`, `anime`, `game`
- `search` (optional): Search in title and description
- `genre` (optional): Filter by genre
- `minRating` (optional): Minimum rating (0-10)
- `maxRating` (optional): Maximum rating (0-10)
- `status` (optional): `ongoing`, `completed`, `upcoming`, `cancelled`
- `sort` (optional): `title`, `rating`, `date`, `reviews`
- `order` (optional): `asc`, `desc`
- `currentPage` (optional): Page number for pagination

**Example:**
```
GET /items/items?type=anime&search=naruto&genre=action&sort=rating&order=desc&currentPage=1
```

**Response:**
```json
{
  "message": "Fetched items successfully",
  "items": [...],
  "totalItems": 25,
  "totalPages": 3,
  "currentPage": 1,
  "perPage": 12,
  "filters": {
    "type": "anime",
    "search": "naruto",
    "genre": "action",
    "sort": "rating",
    "order": "desc"
  }
}
```

### Create Item
**POST** `/items/item`

Add a new entertainment item.

**Request Body:**
```json
{
  "title": "Attack on Titan",
  "type": "anime",
  "description": "Humanity fights against giants...",
  "episodes": 75,
  "durationMinutes": 24,
  "genres": ["action", "drama"],
  "imgURL": "https://example.com/image.jpg",
  "releaseDate": "2013-04-07",
  "status": "completed",
  "studio": "Mappa",
  "contentRating": "TV-MA"
}
```

### Get Single Item
**GET** `/items/item/:itemId`

### Update Item
**PUT** `/items/item/:itemId`

### Delete Item
**DELETE** `/items/item/:itemId`

---

## 📋 Entertainment Lists (New Unified System)

### Add Item to List
**POST** `/entertainment/add-item`

Add an item to your personal entertainment list with enhanced tracking.

**Request Body:**
```json
{
  "itemId": "item_id_here",
  "status": "watching",
  "personalScore": 8,
  "personalReview": "Really enjoying this series!",
  "currentEpisode": 5,
  "isFavorite": true,
  "notes": "Recommended by friend"
}
```

**Response:**
```json
{
  "message": "Item added to your entertainment list",
  "listItem": {
    "item": "item_id_here",
    "status": "watching",
    "personalScore": 8,
    "personalReview": "Really enjoying this series!",
    "currentEpisode": 5,
    "startDate": "2024-01-15T10:30:00.000Z",
    "isFavorite": true,
    "notes": "Recommended by friend"
  }
}
```

### Get Entertainment List
**GET** `/entertainment/list`

Retrieve your entertainment list with filtering and sorting.

**Query Parameters:**
- `status` (optional): `watching`, `completed`, `plan to watch`, `dropped`, `on hold`
- `type` (optional): `movie`, `serie`, `anime`, `game`
- `isFavorite` (optional): `true`, `false`
- `sort` (optional): `score`, `date`, `title`, `rating`

**Example:**
```
GET /entertainment/list?status=watching&type=anime&sort=score
```

### Update List Item
**PUT** `/entertainment/update-item/:itemId`

Update an item in your entertainment list.

**Request Body:**
```json
{
  "status": "completed",
  "personalScore": 9,
  "currentEpisode": 75,
  "personalReview": "Amazing series! Highly recommend."
}
```

### Remove from List
**DELETE** `/entertainment/remove-item/:itemId`

### Get User Statistics
**GET** `/entertainment/stats`

Get comprehensive statistics about your entertainment consumption.

**Response:**
```json
{
  "message": "User statistics retrieved successfully",
  "stats": {
    "totalItems": 150,
    "byStatus": {
      "completed": 80,
      "watching": 15,
      "plan to watch": 45,
      "dropped": 8,
      "on hold": 2
    },
    "byType": {
      "anime": 60,
      "movie": 40,
      "serie": 35,
      "game": 15
    },
    "favorites": 25,
    "averagePersonalScore": 7.8,
    "totalWatchTime": 12480
  }
}
```

---

## ⭐ Reviews System (Enhanced)

### Add Review
**POST** `/reviews/add/:itemId`

Write a comprehensive review for an item.

**Request Body:**
```json
{
  "score": 9,
  "reviewText": "This anime is absolutely incredible. The storytelling, animation, and character development are all top-notch...",
  "title": "A Masterpiece of Animation",
  "pros": ["Amazing animation", "Complex characters", "Great plot twists"],
  "cons": ["Can be quite dark", "Slow start"],
  "wouldRecommend": true,
  "containsSpoilers": false
}
```

**Response:**
```json
{
  "message": "Review added successfully",
  "review": {
    "_id": "review_id_here",
    "userId": "user_id_here",
    "username": "reviewer_username",
    "score": 9,
    "reviewText": "This anime is absolutely incredible...",
    "title": "A Masterpiece of Animation",
    "pros": ["Amazing animation", "Complex characters", "Great plot twists"],
    "cons": ["Can be quite dark", "Slow start"],
    "wouldRecommend": true,
    "containsSpoilers": false,
    "date": "2024-01-15T10:30:00.000Z",
    "helpfulVotes": []
  },
  "itemStats": {
    "averageReviewScore": 8.5,
    "totalReviews": 12,
    "recommendationPercentage": 85
  }
}
```

### Get Item Reviews
**GET** `/reviews/item/:itemId`

Get all reviews for a specific item.

**Query Parameters:**
- `sort` (optional): `date`, `score`, `helpful`
- `spoilers` (optional): `include`, `exclude`

**Example:**
```
GET /reviews/item/item_id_here?sort=helpful&spoilers=exclude
```

### Update Review
**PUT** `/reviews/update/:itemId/:reviewId`

Update your existing review.

### Delete Review
**DELETE** `/reviews/delete/:itemId/:reviewId`

Delete your review.

### Vote on Review Helpfulness
**POST** `/reviews/vote/:itemId/:reviewId`

Vote whether a review is helpful or not.

**Request Body:**
```json
{
  "isHelpful": true
}
```

### Get My Reviews
**GET** `/reviews/my-reviews`

Get all reviews you've written.

**Query Parameters:**
- `sort` (optional): `date`, `score`

---

## 🎯 Legacy Endpoints (Backward Compatibility)

The following endpoints are maintained for backward compatibility but are deprecated in favor of the new unified system:

### Legacy User List Management
- **PUT** `/user/add-item` - Add item to legacy lists
- **GET** `/user/get-items` - Get items from legacy lists
- **PUT** `/user/remove-item/:itemId` - Remove from legacy lists
- **PUT** `/user/update-item-status/:itemId` - Update status in legacy lists

### Legacy Rating & Comments
- **PUT** `/items/rate/:itemId` - Rate an item (legacy)
- **PUT** `/items/likes/:itemId` - Like/dislike an item
- **GET** `/items/comments/:itemId` - Get comments
- **PUT** `/items/comments/:itemId` - Add comment
- **PUT** `/items/comments/:itemId/:commentId` - Edit comment
- **DELETE** `/items/comments/:itemId/:commentId` - Delete comment

---

## 📊 Data Models

### User Model (Enhanced)
```javascript
{
  email: String,
  password: String,
  username: String,
  entertainmentList: [{
    item: ObjectId,
    status: String, // 'watching', 'completed', 'plan to watch', 'dropped', 'on hold'
    personalScore: Number, // 1-10
    personalReview: String,
    currentEpisode: Number,
    startDate: Date,
    completedDate: Date,
    isFavorite: Boolean,
    notes: String
  }],
  // Legacy lists maintained for backward compatibility
  movieList: [...],
  serieList: [...],
  animeList: [...],
  gameList: [...]
}
```

### Item Model (Enhanced)
```javascript
{
  title: String,
  type: String, // 'movie', 'serie', 'anime', 'game'
  description: String,
  episodes: Number,
  durationMinutes: Number,
  releaseDate: Date,
  status: String, // 'ongoing', 'completed', 'upcoming', 'cancelled'
  season: Number,
  platforms: [String],
  studio: String,
  developer: String,
  publisher: String,
  contentRating: String,
  genres: [String],
  imgURL: String,
  
  // Enhanced review system
  reviews: [{
    userId: ObjectId,
    username: String,
    score: Number, // 1-10
    reviewText: String,
    title: String,
    pros: [String],
    cons: [String],
    wouldRecommend: Boolean,
    containsSpoilers: Boolean,
    date: Date,
    helpfulVotes: [{
      userId: ObjectId,
      isHelpful: Boolean
    }]
  }],
  
  // Legacy systems
  rates: [...],
  likes: [...],
  comments: [...]
}
```

---

## 🚀 New Features Summary

### ✅ Enhanced Entertainment Lists
- **Unified System**: Single list for all entertainment types
- **Progress Tracking**: Track current episode/progress
- **Personal Reviews**: Write personal notes and reviews
- **Favorites**: Mark items as favorites
- **Enhanced Status**: Added "on hold" status
- **Date Tracking**: Track start and completion dates

### ✅ Advanced Review System
- **Comprehensive Reviews**: Score + detailed text + title
- **Pros & Cons**: Structured feedback
- **Recommendation System**: Would you recommend this?
- **Spoiler Management**: Mark reviews containing spoilers
- **Helpfulness Voting**: Community-driven review quality
- **Review Statistics**: Average scores, recommendation percentages

### ✅ Enhanced Search & Filtering
- **Text Search**: Search in titles and descriptions
- **Multiple Filters**: Type, genre, rating range, status
- **Advanced Sorting**: By title, rating, date, review count
- **Pagination**: Efficient browsing of large datasets

### ✅ User Statistics
- **Consumption Analytics**: Total watch time, completion rates
- **Category Breakdown**: Statistics by type and status
- **Personal Insights**: Average scores, favorites count

---

## 🔄 Migration Guide

If you're using the legacy endpoints, here's how to migrate:

### Legacy → New Entertainment Lists
```javascript
// Old way
POST /user/add-item
{
  "itemId": "123",
  "status": "watching",
  "type": "anime"
}

// New way
POST /entertainment/add-item
{
  "itemId": "123",
  "status": "watching",
  "personalScore": 8,
  "currentEpisode": 5,
  "isFavorite": true
}
```

### Legacy → New Reviews
```javascript
// Old way
PUT /items/rate/123
{
  "rate": 8,
  "remove": false
}

// New way
POST /reviews/add/123
{
  "score": 8,
  "reviewText": "Great anime with amazing animation...",
  "wouldRecommend": true
}
```

---

## 📝 Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate entry)
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🎯 Best Practices

1. **Use the new unified entertainment system** for new integrations
2. **Include meaningful review text** when adding reviews
3. **Use pagination** for large datasets
4. **Filter spoilers** when displaying reviews to users
5. **Cache frequently accessed data** like user statistics
6. **Validate user input** on the client side before sending requests

---

This API provides a comprehensive solution for managing entertainment lists with modern features like detailed reviews, advanced search, and user analytics while maintaining backward compatibility with existing implementations.
