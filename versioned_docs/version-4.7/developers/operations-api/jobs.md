---
title: Jobs
---

# Jobs

## Get Job

Returns job status, metrics, and messages for the specified job ID.

- `operation` _(required)_ - must always be `get_job`
- `id` _(required)_ - the id of the job you wish to view

### Body

```json
{
	"operation": "get_job",
	"id": "4a982782-929a-4507-8794-26dae1132def"
}
```

### Response: 200

```json
[
	{
		"__createdtime__": 1611615798782,
		"__updatedtime__": 1611615801207,
		"created_datetime": 1611615798774,
		"end_datetime": 1611615801206,
		"id": "4a982782-929a-4507-8794-26dae1132def",
		"job_body": null,
		"message": "successfully loaded 350 of 350 records",
		"start_datetime": 1611615798805,
		"status": "COMPLETE",
		"type": "csv_url_load",
		"user": "HDB_ADMIN",
		"start_datetime_converted": "2021-01-25T23:03:18.805Z",
		"end_datetime_converted": "2021-01-25T23:03:21.206Z"
	}
]
```

---

## Search Jobs By Start Date

Returns a list of job statuses, metrics, and messages for all jobs executed within the specified time window.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `search_jobs_by_start_date`
- `from_date` _(required)_ - the date you wish to start the search
- `to_date` _(required)_ - the date you wish to end the search

### Body

```json
{
	"operation": "search_jobs_by_start_date",
	"from_date": "2021-01-25T22:05:27.464+0000",
	"to_date": "2021-01-25T23:05:27.464+0000"
}
```

### Response: 200

```json
[
	{
		"id": "942dd5cb-2368-48a5-8a10-8770ff7eb1f1",
		"user": "HDB_ADMIN",
		"type": "csv_url_load",
		"status": "COMPLETE",
		"start_datetime": 1611613284781,
		"end_datetime": 1611613287204,
		"job_body": null,
		"message": "successfully loaded 350 of 350 records",
		"created_datetime": 1611613284764,
		"__createdtime__": 1611613284767,
		"__updatedtime__": 1611613287207,
		"start_datetime_converted": "2021-01-25T22:21:24.781Z",
		"end_datetime_converted": "2021-01-25T22:21:27.204Z"
	}
]
```
