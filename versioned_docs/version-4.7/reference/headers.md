---
title: Harper Headers
---

# Harper Headers

All Harper API responses include headers that are important for interoperability and debugging purposes. The following headers are returned with all Harper API responses:

| Key           | Example Value    | Description                                                                                                                                               |
| ------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| server-timing | db;dur=7.165     | This reports the duration of the operation, in milliseconds. This follows the standard for Server-Timing and can be consumed by network monitoring tools. |
| content-type  | application/json | This reports the MIME type of the returned content, which is negotiated based on the requested content type in the Accept header.                         |
