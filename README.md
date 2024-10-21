# API Middleware Documentation

## Middleware

### How It Works

1. **Authorization Header Extraction**: The middleware extracts the `Authorization` header from the incoming request.
2. **Header Validation**: It checks if the `Authorization` header is present and starts with the prefix `"eVoyze"`.
3. **Token Validation**: It then extracts the token from the header and compares it to the server's API key.
4. **Response Handling**: If the token is missing, invalid, or incorrect, it responds with a `401 Unauthorized` status and a relevant message. If the token is valid, it allows the request to proceed to the next middleware or route handler.

### Request Header

-   **`Authorization`**: A header that should contain the API key in the format `eVoyze <token>`.

### Responses

-   **Error Response (Missing or Invalid Authorization Header)**

    ```json
    {
    	"msg": "Authorization header missing or invalid."
    }
    ```

    -   **`msg`**: Indicates that the `Authorization` header is either missing or does not start with the required prefix `"eVoyze"`.

-   **Error Response (Incorrect Token)**

    ```json
    {
    	"msg": "Incorrect token"
    }
    ```

    -   **`msg`**: Indicates that the provided token does not match the expected API key.

-   **Success Response**

    ```json
    {
    	"msg": "success"
    }
    ```

    -   **`msg`**: Indicates that the token is valid and the request is authorized.

### Example Requests

#### Example Request with Valid API Key

**Request:**

```http
GET /validate
Authorization: eVoyze valid-api-key
```

**Response:**

-   If the key is correct, it returns a success message.

    ```json
    {
    	"msg": "success"
    }
    ```

#### Example Request with Missing or Invalid Authorization Header

**Request:**

```http
GET /some-endpoint
Authorization: invalid-header
```

**Response:**

```json
{
	"msg": "Authorization header missing or invalid."
}
```

#### Example Request with Incorrect Token

**Request:**

```http
GET /some-endpoint
Authorization: eVoyze incorrect-token
```

**Response:**

```json
{
	"msg": "Incorrect token"
}
```

### Error Handling

-   **401 Unauthorized**: The middleware responds with a `401` status code and a relevant message if the `Authorization` header is missing, invalid, or if the token is incorrect.

### Notes

-   Ensure the `Authorization` header is included in the request and is properly formatted with the prefix `"eVoyze"`.
-   The token should match the server's API key for the request to be authorized.
-   To obtain a valid API token, please contact the eVoyze support team.

---

# API Validation Rules

### 1. Device Group Authentication Failure / Unauthorized Access Response

**Description**: If authentication fails (e.g., due to an incorrect passcode) or if unauthorized access is detected (e.g., if the device is not registered), the response will include:

#### Response

-   **Error Response (Authentication Failure)**

    ```json
    {
    	"msg": "Authentication failed."
    }
    ```

    -   **`msg`**: Indicates that authentication failed due to an incorrect passcode.

-   **Error Response (Unauthorized Access)**

    ```json
    {
    	"msg": "Unauthorized access."
    }
    ```

    -   **`msg`**: Indicates that the device is not registered in the database.

### 2. Device Log Response

**Endpoint**: `POST /att-log`

**Description**: This endpoint accepts data related to device logs. The data must conform to the following schema.

#### Request Body Schema

```json
{
  "dev_group": "string",
  "dev_passcode": "string",
  "dev_id": "string",
  "ip_addr": "string",
  "dev_log": [
    {
      "dev_user_id": "string",
      "clock_on": "YYYYMMDD HH:MM:SS",
      "state": "CI" or "CO"
    }
  ]
}
```

#### Fields

-   **`dev_group`** (string, required): The group to which the device belongs.
-   **`dev_passcode`** (string, required): The passcode for device group authentication.
-   **`dev_id`** (string, required): The unique identifier for the device.
-   **`ip_addr`** (string, required): The IPv4 address of the device.
-   **`dev_log`** (array of objects, required): An array of log entries, where each entry must conform to the following:
    -   **`dev_user_id`** (string, required): The ID of the user associated with the log entry.
    -   **`clock_on`** (string, required): Timestamp of the log entry in the format `YYYYMMDD HH:MM:SS`.
    -   **`state`** (string, required): The state of the log entry. Must be either `"CI"` (Clock-In) or `"CO"` (Clock-Out).

#### Responses

-   **Success Response (Logs Processed Successfully)**

    If logs are processed successfully, the response will include:

    ```json
    {
      "msg": "success",
      "processedCount": <number_of_processed_logs>
    }
    ```

    -   **`msg`**: Confirmation message that the import was completed successfully.
    -   **`processedCount`**: Number of logs that were successfully processed.

-   **Success Response (No Logs Processed)**

    If no logs are processed, the response will include:

    ```json
    {
    	"msg": "nolog",
    	"processedCount": 0
    }
    ```

    -   **`msg`**: Message indicating no logs were processed.
    -   **`processedCount`**: 0, indicating no logs were processed.

-   **Error Response**

    If there is an error with the request, such as invalid data or processing issues, the response will include:

    ```json
    {
    	"error": "Invalid request data."
    }
    ```

    -   **`error`**: Message indicating that the request data is invalid.

### 3. Device Response

**Endpoint**: `POST /att-dev`

**Description**: This endpoint accepts data related to device configuration. The data must conform to the following schema.

#### Request Body Schema

```json
{
	"dev_group": "string",
	"dev_passcode": "string",
	"dev_id": "string",
	"ip_addr": "IPv4 address"
}
```

#### Fields

-   **`dev_group`** (string, required): The group to which the device belongs.
-   **`dev_passcode`** (string, required): The passcode for device authentication.
-   **`dev_id`** (string, required): The unique identifier for the device.
-   **`ip_addr`** (string, required): The IPv4 address of the device.

#### Responses

-   **Success Response**

    If the device configuration is successfully saved, the response will include:

    ```json
    {
    	"msg": "success"
    }
    ```

    -   **`msg`**: Confirmation message that the device configuration was saved successfully.

-   **Error Response**

    If there is an error with the request data or processing, the response will include:

    ```json
    {
    	"error": "Invalid request data."
    }
    ```

    -   **`error`**: Message indicating that the request data is invalid.

### Error Handling

Errors in the request data will result in a `400 Bad Request` response with a message indicating the nature of the validation error. Internal server errors will result in a `500 Internal Server Error` response.

### Notes

-   Ensure that all fields are provided and match the specified format.
-   The timestamp format for `clock_on` should be strictly adhered to as `YYYYMMDD HH:MM:SS`.
-   The IP address should be a valid IPv4 address.

## Reminder

### SQL Server Browser Service

Make sure the SQL Server Browser service is **running**. This is a Windows service that allows clients to connect and retrieve the IP address of the SQL Server instance they are looking for. Enabling this service may resolve connection issues.

**To manage the SQL Server Browser service:**

1. On the Start menu, right-click **My Computer**, and then click **Manage**.
2. In **Computer Management**, expand **Services and Applications**, and then click **Services**.
3. In the list of services, double-click **SQL Server Browser**.
4. In the SQL Server Browser Properties window, click **Start**.
5. When the service starts, click **OK**.
