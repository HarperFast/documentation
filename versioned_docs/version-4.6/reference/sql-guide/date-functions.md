---
title: SQL Date Functions
---

:::warning
Harper encourages developers to utilize other querying tools over SQL for performance purposes. Harper SQL is intended for data investigation purposes and uses cases where performance is not a priority. SQL optimizations are on our roadmap for the future.
:::

# SQL Date Functions

Harper utilizes [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) in all internal SQL operations. This means that date values passed into any of the functions below will be assumed to be in UTC or in a format that can be translated to UTC.

When parsing date values passed to SQL date functions in HDB, we first check for [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formats, then for [RFC 2822](https://tools.ietf.org/html/rfc2822#section-3.3) date-time format and then fall back to new Date(date_string)if a known format is not found.

### CURRENT_DATE()

Returns the current date in UTC in `YYYY-MM-DD` String format.

```
"SELECT CURRENT_DATE() AS current_date_result" returns
    {
      "current_date_result": "2020-04-22"
    }
```

### CURRENT_TIME()

Returns the current time in UTC in `HH:mm:ss.SSS` String format.

```
"SELECT CURRENT_TIME() AS current_time_result" returns
    {
      "current_time_result": "15:18:14.639"
    }
```

### CURRENT_TIMESTAMP

Referencing this variable will evaluate as the current Unix Timestamp in milliseconds.

```
"SELECT CURRENT_TIMESTAMP AS current_timestamp_result" returns
    {
      "current_timestamp_result": 1587568845765
    }
```

### DATE([date_string])

Formats and returns the date_string argument in UTC in `YYYY-MM-DDTHH:mm:ss.SSSZZ` String format.

If a date_string is not provided, the function will return the current UTC date/time value in the return format defined above.

```
"SELECT DATE(1587568845765) AS date_result" returns
    {
      "date_result": "2020-04-22T15:20:45.765+0000"
    }
```

```
"SELECT DATE(CURRENT_TIMESTAMP) AS date_result2" returns
    {
      "date_result2": "2020-04-22T15:20:45.765+0000"
    }
```

### DATE_ADD(date, value, interval)

Adds the defined amount of time to the date provided in UTC and returns the resulting Unix Timestamp in milliseconds. Accepted interval values: Either string value (key or shorthand) can be passed as the interval argument.

| Key          | Shorthand |
| ------------ | --------- |
| years        | y         |
| quarters     | Q         |
| months       | M         |
| weeks        | w         |
| days         | d         |
| hours        | h         |
| minutes      | m         |
| seconds      | s         |
| milliseconds | ms        |

```
"SELECT DATE_ADD(1587568845765, 1, 'days') AS date_add_result" AND
"SELECT DATE_ADD(1587568845765, 1, 'd') AS date_add_result" both return
    {
      "date_add_result": 1587655245765
    }
```

```
"SELECT DATE_ADD(CURRENT_TIMESTAMP, 2, 'years')
AS date_add_result2" returns
    {
      "date_add_result2": 1650643129017
    }
```

### DATE_DIFF(date_1, date_2[, interval])

Returns the difference between the two date values passed based on the interval as a Number. If an interval is not provided, the function will return the difference value in milliseconds.

Accepted interval values:

- years
- months
- weeks
- days
- hours
- minutes
- seconds

```
"SELECT DATE_DIFF(CURRENT_TIMESTAMP, 1650643129017, 'hours')
AS date_diff_result" returns
    {
      "date_diff_result": -17519.753333333334
    }
```

### DATE_FORMAT(date, format)

Formats and returns a date value in the String format provided. Find more details on accepted format values in the [moment.js docs](https://momentjs.com/docs/#/displaying/format/).

```
"SELECT DATE_FORMAT(1524412627973, 'YYYY-MM-DD HH:mm:ss')
AS date_format_result" returns
    {
      "date_format_result": "2018-04-22 15:57:07"
    }
```

### DATE_SUB(date, value, interval)

Subtracts the defined amount of time from the date provided in UTC and returns the resulting Unix Timestamp in milliseconds. Accepted date_sub interval values- Either string value (key or shorthand) can be passed as the interval argument.

| Key          | Shorthand |
| ------------ | --------- |
| years        | y         |
| quarters     | Q         |
| months       | M         |
| weeks        | w         |
| days         | d         |
| hours        | h         |
| minutes      | m         |
| seconds      | s         |
| milliseconds | ms        |

```
"SELECT DATE_SUB(1587568845765, 2, 'years') AS date_sub_result" returns
    {
      "date_sub_result": 1524410445765
    }
```

### EXTRACT(date, date_part)

Extracts and returns the date_part requested as a String value. Accepted date_part values below show value returned for date = "2020-03-26T15:13:02.041+000"

| date_part   | Example return value\* |
| ----------- | ---------------------- |
| year        | "2020"                 |
| month       | "3"                    |
| day         | "26"                   |
| hour        | "15"                   |
| minute      | "13"                   |
| second      | "2"                    |
| millisecond | "41"                   |

```
"SELECT EXTRACT(1587568845765, 'year') AS extract_result" returns
    {
      "extract_result": "2020"
    }
```

### GETDATE()

Returns the current Unix Timestamp in milliseconds.

```
"SELECT GETDATE() AS getdate_result" returns
    {
      "getdate_result": 1587568845765
    }
```

### GET_SERVER_TIME()

Returns the current date/time value based on the server’s timezone in `YYYY-MM-DDTHH:mm:ss.SSSZZ` String format.

```
"SELECT GET_SERVER_TIME() AS get_server_time_result" returns
    {
      "get_server_time_result": "2020-04-22T15:20:45.765+0000"
    }
```

### OFFSET_UTC(date, offset)

Returns the UTC date time value with the offset provided included in the return String value formatted as `YYYY-MM-DDTHH:mm:ss.SSSZZ`. The offset argument will be added as minutes unless the value is less than 16 and greater than -16, in which case it will be treated as hours.

```
"SELECT OFFSET_UTC(1587568845765, 240) AS offset_utc_result" returns
    {
      "offset_utc_result": "2020-04-22T19:20:45.765+0400"
    }
```

```
"SELECT OFFSET_UTC(1587568845765, 10) AS offset_utc_result2" returns
    {
      "offset_utc_result2": "2020-04-23T01:20:45.765+1000"
    }
```

### NOW()

Returns the current Unix Timestamp in milliseconds.

```
"SELECT NOW() AS now_result" returns
    {
      "now_result": 1587568845765
    }
```
