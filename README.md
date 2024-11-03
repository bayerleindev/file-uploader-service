  <a href="https://github.com/bayerleindev/file-uploader-service/actions/workflows/ci.yml/badge.svg" target="_blank"><img src="https://github.com/bayerleindev/file-uploader-service/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>

## Description

The **File Uploader API** is designed to provide secure, scalable file upload and user management services for applications requiring Basic Auth authentication and robust file handling capabilities. The API supports efficient file uploads in CSV format. It’s engineered to adapt to varying load conditions, ensuring reliability and stability by dynamically adjusting rate limits based on the server's available resources. 

Key features of the API include:
- **User Registration and Authentication**: Uses Basic Auth to authenticate users, enabling secure access to protected endpoints.
- **File Upload**: Supports multipart file uploads, designed to handle large files reliably.
- **Dynamic Rate-Limiting**: Adapts rate limits in response to server resources, allowing higher request throughput when system capacity permits.
- **Error Handling and Stability**: Follows standardized error responses for easy troubleshooting and resilient operations under high load.

This API is ideal for applications that require flexible, performant file upload capabilities with a focus on scalability, security, and resource-aware load management.


## Installation

```bash
$ npm install
```

## Running the app

```bash
# before all
$ docker compose up -d postgres
$ npm run migration:run

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ docker compose up -d postgres
$ npm run migration:run
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docs
```
All documentation is accessible through resource /api.
```

# API Documentation

This document provides an overview of the main API endpoints, usage guidelines, expected behavior under load, and error handling conventions.

---
## Table of Contents
- [Introduction](#introduction)
- [Endpoints](#endpoints)
  - [Authentication](#authentication)
  - [File Upload](#file-upload)
- [Expected Load Behavior](#expected-load-behavior)
---

## Introduction

This API enables file uploads and basic user creation. Below, you will find usage instructions for each endpoint, expectations for behavior under load, and guidelines for error handling.

---

## Endpoints

### Authentication

This API uses **Basic Auth** for authentication. To access protected endpoints, provide the username and password in the Basic Auth header of your request.

- **Method**: `POST`
- **URL**: `/users`
- **Description**: Endpoint to register new users.

#### Request Example

```
POST /users
Content-Type: application/json

{
  "username": "example_user",
  "password": "example_password"
}
```
Successful Response Example
```
Status: 201 Created
{
  "id": "unique_user_id"
}
```

### File Upload
Allows file uploads in CSV format. This endpoint requires authentication.
- **Method**: `POST`
- **URL**: `/upload`
- **Description**: Uploads a file to the server for processing.

| Field  | Type       | Required | Description
| ------ | ---------- | -------- | ----------
|  File  |  text/csv  |    yes   | The CSV file to be uploaded

#### Request Example
Request Format:
```
POST /upload
Authorization: Basic {credentials}
Content-Type: multipart/form-data
```

Successful Response Example
```
Status: 201 Created
{
  "message": "File successfully uploaded",
}
```

## Expected Load Behavior

This system dynamically adjusts its rate limits based on available system resources. The following behavior is expected under load:

- **Dynamic Rate-Limiting**: The rate limit adjusts in response to the machine's available resources. When more CPU and memory are available, the server can handle more requests, ensuring optimal performance. During lower resource availability, the rate limit reduces to prevent overload and maintain stability.
- **Scalability**: The API remains stable with up to 5 concurrent requests by default.
- **Recovery**: In high-load scenarios, the API reclaims idle connections and redistributes resources to manage the load effectively.

These adaptive rate-limiting and resource management strategies help ensure reliable performance under varying load conditions.

### TTL
- Low CPU (20%) and Low Memory (30%): TTL might reduce to around 6-7 seconds.
- High CPU (85%) and Medium Memory (60%): TTL could increase to around 15-20 seconds.
- Medium CPU and Memory (both around 50%): TTL would remain near the default (10 seconds).

### Request/sec allowed
- Low CPU (0-25%) and Low Memory (0-25%): Requests Allowed: 20-40 requests per second
- Low CPU (0-25%) and Medium Memory (26-50%): Requests Allowed: 15-35 requests per second
- Medium CPU (26-50%) and Low Memory (0-25%): Requests Allowed: 15-35 requests per second
- Medium CPU (26-50%) and Medium Memory (26-50%): Requests Allowed: 10-30 requests per second
- High CPU (51-75%) and Medium Memory (26-50%): Requests Allowed: 8-20 requests per second
- High CPU (51-75%) and High Memory (51-75%): Requests Allowed: 5-15 requests per second
- Very High CPU (76-100%) and Very High Memory (76-100%): Requests Allowed: 1-5 requests per second

