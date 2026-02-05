---
title: HarperDB Headers
---

# HarperDB Headers

All HarperDB API responses include headers that are important for interoperability and debugging purposes. The following headers are returned with all HarperDB API responses:

| Key               | Example Value    | Description                                                                                                                                               |
| ----------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| server-timing     | db;dur=7.165     | This reports the duration of the operation, in milliseconds. This follows the standard for Server-Timing and can be consumed by network monitoring tools. |
| hdb-response-time | 7.165            | This is the legacy header for reporting response time. It is deprecated and will be removed in 4.2.                                                       |
| content-type      | application/json | This reports the MIME type of the returned content, which is negotiated based on the requested content type in the Accept header.                         |
