# Banking System API Documentation

**Base URL:** `http://localhost:3000`

All protected endpoints require a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <Firebase ID Token>
```

---

## Authentication

### Get Firebase Token (External — Firebase REST API)

**Sign Up:**

```
POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY
```

| Field              | Type    | Required | Description                      |
| ------------------ | ------- | -------- | -------------------------------- |
| `email`            | string  | Yes      | User email                       |
| `password`         | string  | Yes      | Password (min 6 characters)      |
| `returnSecureToken`| boolean | Yes      | Must be `true`                   |

**Sign In:**

```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY
```

Same body as sign up. Returns `idToken` (expires in 1 hour).

---

## User Endpoints

### 1. Register User

```
POST /api/users/register
```

**Headers:**

| Header          | Value                        |
| --------------- | ---------------------------- |
| `Authorization` | `Bearer <idToken>`           |
| `Content-Type`  | `application/json`           |

**Request Body:**

| Field                  | Type   | Required | Validation                                          |
| ---------------------- | ------ | -------- | --------------------------------------------------- |
| `email`                | string | Yes      | Valid email format                                   |
| `transactionPin`       | string | Yes      | 4-6 digits (`/^\d{4,6}$/`)                          |
| `legalName.firstName`  | string | Yes      | Non-empty                                            |
| `legalName.lastName`   | string | Yes      | Non-empty                                            |
| `dateOfBirth`          | string | Yes      | `YYYY-MM-DD` format, must be 18+ years old           |
| `address.street`       | string | Yes      | Non-empty                                            |
| `address.city`         | string | Yes      | Non-empty                                            |
| `address.state`        | string | Yes      | Non-empty                                            |
| `address.postalCode`   | string | Yes      | Non-empty                                            |
| `address.country`      | string | Yes      | Non-empty                                            |
| `panId`                | string | Yes      | PAN format: `ABCDE1234F` (`/^[A-Z]{5}[0-9]{4}[A-Z]$/`) |

**Example Request Body:**

```json
{
  "email": "test@gmail.com",
  "transactionPin": "1234",
  "legalName": {
    "firstName": "Test",
    "lastName": "User"
  },
  "dateOfBirth": "2000-01-15",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "panId": "ABCDE1234F"
}
```

**Success Response — `201 Created`:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "665f1a...",
    "email": "test@gmail.com",
    "legalName": { "firstName": "Test", "lastName": "User" },
    "isActive": true,
    "createdAt": "2026-03-10T..."
  }
}
```

**Error Responses:**

| Status | Error                      |
| ------ | -------------------------- |
| 400    | Validation failed          |
| 401    | Unauthorized               |
| 409    | User already registered    |

---

### 2. Login

```
POST /api/users/login
```

**Headers:**

| Header          | Value                        |
| --------------- | ---------------------------- |
| `Authorization` | `Bearer <idToken>`           |
| `Content-Type`  | `application/json`           |

**Request Body:**

| Field   | Type   | Required | Validation         |
| ------- | ------ | -------- | ------------------ |
| `email` | string | Yes      | Valid email format  |

**Example Request Body:**

```json
{
  "email": "test@gmail.com"
}
```

**Success Response — `200 OK`:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "665f1a...",
    "email": "test@gmail.com",
    "legalName": { "firstName": "Test", "lastName": "User" },
    "isActive": true,
    "createdAt": "2026-03-10T..."
  }
}
```

**Error Responses:**

| Status | Error                                    |
| ------ | ---------------------------------------- |
| 400    | Validation failed                        |
| 401    | Unauthorized / Email does not match      |
| 403    | Account is deactivated                   |
| 404    | User not found. Please register first.   |

---

### 3. Logout

```
POST /api/users/logout
```

**Headers:**

| Header          | Value                        |
| --------------- | ---------------------------- |
| `Authorization` | `Bearer <idToken>`           |

**Request Body:** None

**Success Response — `200 OK`:**

```json
{
  "message": "Logged out successfully. All sessions revoked."
}
```

**Error Responses:**

| Status | Error          |
| ------ | -------------- |
| 401    | Unauthorized   |
| 404    | User not found |

---

## Account Endpoints

### 4. Create Account

```
POST /api/accounts/
```

**Headers:**

| Header          | Value              |
| --------------- | ------------------ |
| `Authorization` | `Bearer <idToken>` |

**Request Body:** None

**Success Response — `201 Created`:**

```json
{
  "message": "Account created successfully",
  "account": {
    "id": "665f2b...",
    "accountNumber": "123456789012",
    "status": "ACTIVE",
    "createdAt": "2026-03-10T..."
  }
}
```

**Error Responses:**

| Status | Error                                |
| ------ | ------------------------------------ |
| 401    | Unauthorized                         |
| 404    | User not found                       |
| 409    | User already has an active account   |

---

### 5. List User Accounts

```
GET /api/accounts/
```

**Headers:**

| Header          | Value              |
| --------------- | ------------------ |
| `Authorization` | `Bearer <idToken>` |

**Success Response — `200 OK`:**

```json
{
  "message": "Accounts retrieved successfully",
  "accounts": [
    {
      "id": "665f2b...",
      "accountNumber": "123456789012",
      "status": "ACTIVE",
      "balance": 50000,
      "createdAt": "2026-03-10T..."
    }
  ]
}
```

**Error Responses:**

| Status | Error          |
| ------ | -------------- |
| 401    | Unauthorized   |
| 404    | User not found |

---

### 6. Get Account Balance

```
GET /api/accounts/:accountId/balance
```

**Headers:**

| Header          | Value              |
| --------------- | ------------------ |
| `Authorization` | `Bearer <idToken>` |

**Path Parameters:**

| Param       | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| `accountId` | string | MongoDB ObjectId of account  |

**Success Response — `200 OK`:**

```json
{
  "message": "Balance retrieved successfully",
  "accountNumber": "123456789012",
  "balance": 50000,
  "totalCredits": 75000,
  "totalDebits": -25000,
  "transactionCount": 10
}
```

**Error Responses:**

| Status | Error              |
| ------ | ------------------ |
| 400    | Invalid account ID |
| 401    | Unauthorized       |
| 404    | Account not found  |

---

### 7. Get Account Details

```
GET /api/accounts/:accountId
```

**Headers:**

| Header          | Value              |
| --------------- | ------------------ |
| `Authorization` | `Bearer <idToken>` |

**Path Parameters:**

| Param       | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| `accountId` | string | MongoDB ObjectId of account  |

**Success Response — `200 OK`:**

```json
{
  "message": "Account details retrieved successfully",
  "account": {
    "_id": "665f2b...",
    "userId": "665f1a...",
    "accountNumber": "123456789012",
    "status": "ACTIVE",
    "balance": 50000,
    "recentTransactions": [
      {
        "_id": "665f3c...",
        "sourceAccountId": "665f2b...",
        "destinationAccountId": "665f4d...",
        "amount": 5000,
        "type": "TRANSFER",
        "status": "SETTLED",
        "createdAt": "2026-03-10T..."
      }
    ],
    "createdAt": "2026-03-10T...",
    "updatedAt": "2026-03-10T..."
  }
}
```

**Error Responses:**

| Status | Error              |
| ------ | ------------------ |
| 400    | Invalid account ID |
| 401    | Unauthorized       |
| 404    | Account not found  |

---

### 8. Get Transaction History

```
GET /api/accounts/:accountId/transactions
```

**Headers:**

| Header          | Value              |
| --------------- | ------------------ |
| `Authorization` | `Bearer <idToken>` |

**Path Parameters:**

| Param       | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| `accountId` | string | MongoDB ObjectId of account  |

**Query Parameters:**

| Param       | Type   | Default | Options                        | Description                                  |
| ----------- | ------ | ------- | ------------------------------ | -------------------------------------------- |
| `page`      | number | `1`     | Any positive integer           | Page number for pagination                   |
| `limit`     | number | `20`    | `1` — `100`                    | Results per page                             |
| `range`     | string | `30d`   | `7d`, `30d`, `custom`          | Time range filter                            |
| `startDate` | string | —       | ISO 8601 datetime              | Required when `range=custom`                 |
| `endDate`   | string | —       | ISO 8601 datetime              | Required when `range=custom`                 |

**Example Requests:**

```
GET /api/accounts/665f2b.../transactions?range=7d&page=1&limit=10
GET /api/accounts/665f2b.../transactions?range=custom&startDate=2026-03-01T00:00:00.000Z&endDate=2026-03-10T23:59:59.000Z
```

**Success Response — `200 OK`:**

```json
{
  "message": "Transaction history retrieved successfully",
  "transactions": [
    {
      "_id": "665f3c...",
      "sourceAccountId": "665f2b...",
      "destinationAccountId": "665f4d...",
      "amount": 5000,
      "type": "TRANSFER",
      "status": "SETTLED",
      "direction": "OUTGOING",
      "note": "Rent payment",
      "createdAt": "2026-03-09T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Error Responses:**

| Status | Error              |
| ------ | ------------------ |
| 400    | Validation failed / Invalid account ID |
| 401    | Unauthorized       |
| 404    | Account not found  |

---

## Common Error Format

All error responses follow this format:

```json
{
  "error": "Error message here"
}
```

Validation errors include field-level details:

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email address"],
    "transactionPin": ["Transaction PIN must be 4-6 digits"]
  }
}
```

---

## Enums

### Account Status

| Value    | Description         |
| -------- | ------------------- |
| `ACTIVE` | Account is active   |
| `FROZEN` | Account is frozen   |
| `CLOSED` | Account is closed   |

### Transaction Type

| Value        | Description              |
| ------------ | ------------------------ |
| `TRANSFER`   | Transfer between accounts|
| `DEPOSIT`    | Deposit into account     |
| `WITHDRAWAL` | Withdrawal from account  |

### Transaction Status

| Value        | Description              |
| ------------ | ------------------------ |
| `PENDING`    | Transaction initiated    |
| `PROCESSING` | Transaction in progress  |
| `SETTLED`    | Transaction completed    |
| `FAILED`     | Transaction failed       |

### Transaction Direction (computed)

| Value      | Description                            |
| ---------- | -------------------------------------- |
| `INCOMING` | Money received into queried account    |
| `OUTGOING` | Money sent from queried account        |
