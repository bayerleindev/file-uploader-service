<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

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
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docs
```
All docs are accessible through http://localhost:3000/api
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
- [Error Handling](#error-handling)

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
  "message": "User successfully created",
  "userId": "unique_user_id"
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


