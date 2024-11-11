# API Documentation

## Table of Contents
- [API Documentation](#api-documentation)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Base URL](#base-url)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
    - [Hospitals](#hospitals)
      - [GET /hospitals](#get-hospitals)
      - [GET /hospitals/{id}](#get-hospitalsid)
      - [POST /hospitals](#post-hospitals)
  - [Error Handling](#error-handling)
  - [Rate Limiting](#rate-limiting)

## Overview

The Hospital Map API provides endpoints for managing hospital data, status updates, and map interactions.

### Base URL
```
Development: http://localhost:3000/api
Production: https://api.hospitalmap.com/v1
```

## Authentication

All API requests require authentication using Bearer tokens:

```http
Authorization: Bearer <your_token>
```

## Endpoints

### Hospitals

#### GET /hospitals
Returns a list of all hospitals.

Query Parameters:
- `status`: Filter by status (deployed, inProgress, signed)
- `country`: Filter by country
- `region`: Filter by region
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "lat": number,
      "lon": number,
      "address": "string",
      "website": "string",
      "imageUrl": "string"
    }
  ],
  "meta": {
    "total": number,
    "page": number,
    "totalPages": number
  }
}
```

#### GET /hospitals/{id}
Returns a specific hospital by ID.

#### POST /hospitals
Creates a new hospital entry.

Request Body:
```json
{
  "name": "string",
  "status": "string",
  "lat": number,
  "lon": number,
  "address": "string",
  "website": "string",
  "imageUrl": "string"
}
```

[Continue with other endpoints...]

## Error Handling

The API uses conventional HTTP response codes:
- 2xx: Success
- 4xx: Client Error
- 5xx: Server Error

Error Response Format:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## Rate Limiting

Rate limits are applied per IP address:
- 100 requests per minute
- Headers include rate limit information:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`