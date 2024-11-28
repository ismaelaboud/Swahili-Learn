# LMS System API Documentation

## Base URL
- Development: `http://localhost:3001/api`
- Production: TBD

## Authentication
Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow this general format:
```json
{
  "data": <response_data>,
  "error": <error_message_if_any>
}
```

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Endpoints

### Authentication

#### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "STUDENT | INSTRUCTOR"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
  ```

#### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### Courses

#### Create Course
- **URL**: `/courses`
- **Method**: `POST`
- **Auth Required**: Yes (Instructor only)
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "category": "string"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "published": false,
    "instructor": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
  ```

#### Get All Published Courses
- **URL**: `/courses`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `category` (optional): Filter by category
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
- **Success Response**: `200 OK`
  ```json
  {
    "courses": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "string",
        "published": true,
        "instructor": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
  ```

#### Get Course Details
- **URL**: `/courses/:courseId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "published": "boolean",
    "instructor": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### Toggle Course Publish Status
- **URL**: `/courses/:courseId/publish`
- **Method**: `PATCH`
- **Auth Required**: Yes (Course instructor only)
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "published": "boolean",
    "instructor": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
  ```

#### Get Instructor Courses
- **URL**: `/courses/instructor`
- **Method**: `GET`
- **Auth Required**: Yes (Instructor only)
- **Query Parameters**:
  - `published` (optional): Filter by publish status
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
- **Success Response**: `200 OK`
  ```json
  {
    "courses": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "string",
        "published": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "total": "number",
    "page": "number",
    "totalPages": "number"
  }
  ```

### Sections

#### Create Section
- **URL**: `/sections/:courseId`
- **Method**: `POST`
- **Auth Required**: Yes (Course instructor only)
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "order": "number",
    "courseId": "string",
    "lessons": [],
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### Get Course Sections
- **URL**: `/sections/:courseId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "order": "number",
      "courseId": "string",
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "type": "string",
          "order": "number"
        }
      ]
    }
  ]
  ```

#### Update Section
- **URL**: `/sections/:sectionId`
- **Method**: `PATCH`
- **Auth Required**: Yes (Course instructor only)
- **Request Body**:
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "order": "number",
    "courseId": "string",
    "lessons": []
  }
  ```

#### Delete Section
- **URL**: `/sections/:sectionId`
- **Method**: `DELETE`
- **Auth Required**: Yes (Course instructor only)
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Section deleted successfully"
  }
  ```

#### Reorder Sections
- **URL**: `/sections/:courseId/reorder`
- **Method**: `PATCH`
- **Auth Required**: Yes (Course instructor only)
- **Request Body**:
  ```json
  {
    "sectionIds": ["string"]
  }
  ```
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "order": "number",
      "lessons": []
    }
  ]
  ```

### Lessons

#### Create Lesson
- **URL**: `/lessons/:sectionId`
- **Method**: `POST`
- **Auth Required**: Yes (Course instructor only)
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "type": "TEXT | VIDEO | QUIZ | EXERCISE"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "type": "string",
    "order": "number",
    "sectionId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### Get Lesson
- **URL**: `/lessons/:lessonId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "type": "string",
    "order": "number",
    "sectionId": "string",
    "section": {
      "title": "string",
      "course": {
        "id": "string",
        "title": "string",
        "instructorId": "string"
      }
    }
  }
  ```

#### Update Lesson
- **URL**: `/lessons/:lessonId`
- **Method**: `PATCH`
- **Auth Required**: Yes (Course instructor only)
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "type": "TEXT | VIDEO | QUIZ | EXERCISE"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "type": "string",
    "order": "number",
    "sectionId": "string"
  }
  ```

#### Delete Lesson
- **URL**: `/lessons/:lessonId`
- **Method**: `DELETE`
- **Auth Required**: Yes (Course instructor only)
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Lesson deleted successfully"
  }
  ```

#### Reorder Lessons
- **URL**: `/lessons/:sectionId/reorder`
- **Method**: `PATCH`
- **Auth Required**: Yes (Course instructor only)
- **Request Body**:
  ```json
  {
    "lessonIds": ["string"]
  }
  ```
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "order": "number"
    }
  ]
  ```

### Public Endpoints

#### GET `/api/courses/public`
Lists all published courses without requiring authentication.

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "imageUrl": "string | null",
    "isPublished": true,
    "createdAt": "string",
    "_count": {
      "sections": "number",
      "enrollments": "number"
    }
  }
]
```

#### GET `/api/courses/:courseId`
Get details of a specific course. Authentication optional - provides enrollment status if authenticated.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "isPublished": "boolean",
  "sections": [
    {
      "id": "string",
      "title": "string",
      "order": "number",
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "type": "string",
          "order": "number"
        }
      ]
    }
  ],
  "isEnrolled": "boolean"
}
```

### Protected Endpoints

#### POST `/api/courses/:courseId/enroll`
Enroll in a course. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "courseId": "string",
  "enrolledAt": "string"
}
```

**Error Responses:**
- 401: Unauthorized - Not authenticated
- 404: Course not found or not published
- 400: Already enrolled in course

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication token required"
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred"
}
```

## Rate Limiting
- Rate limiting is applied to all endpoints
- Default limit: 100 requests per IP per 15 minutes
- Authentication endpoints: 5 requests per IP per 15 minutes

## Notes
- All timestamps are in ISO 8601 format
- Course categories are predefined and cannot be created dynamically
- Pagination is 0-based (first page is 0)
- Default page size is 10 items
- Maximum page size is 50 items
