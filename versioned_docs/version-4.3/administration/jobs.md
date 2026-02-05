---
title: Jobs
---

# Jobs

HarperDB Jobs are asynchronous tasks performed by the Operations API.

## Job Summary

Jobs uses an asynchronous methodology to account for the potential of a long-running operation. For example, exporting millions of records to S3 could take some time, so that job is started and the id is provided to check on the status.

The job status can be **COMPLETE** or **IN_PROGRESS**.

## Example Job Operations

Example job operations include:

[csv data load](../developers/operations-api/bulk-operations#csv-data-load)

[csv file load](../developers/operations-api/bulk-operations#csv-file-load)

[csv url load](../developers/operations-api/bulk-operations#csv-url-load)

[import from s3](../developers/operations-api/bulk-operations#import-from-s3)

[delete_records_before](../developers/operations-api/utilities#delete-records-before)

[export_local](../developers/operations-api/utilities#export-local)

[export_to_s3](../developers/operations-api/utilities#export-to-s3)

Example Response from a Job Operation

```
{
  "message": "Starting job with id 062a1892-6a0a-4282-9791-0f4c93b12e16"
}
```

Whenever one of these operations is initiated, an asynchronous job is created and the request contains the ID of that job which can be used to check on its status.

## Managing Jobs

To check on a job's status, use the [get_job](../developers/operations-api/jobs#get-job) operation.

Get Job Request

```
{
    "operation": "get_job",
    "id": "4a982782-929a-4507-8794-26dae1132def"
}
```

Get Job Response

```
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

## Finding Jobs

To find jobs (if the ID is not known) use the [search_jobs_by_start_date](../developers/operations-api/jobs#search-jobs-by-start-date) operation.

Search Jobs Request

```
{
    "operation": "search_jobs_by_start_date",
    "from_date": "2021-01-25T22:05:27.464+0000",
    "to_date": "2021-01-25T23:05:27.464+0000"
}
```

Search Jobs Response

```
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
