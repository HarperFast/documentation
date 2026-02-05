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

[csv data load](https://api.harperdb.io/#0186bc25-b9ae-44e7-bd9e-8edc0f289aa2)

[csv file load](https://api.harperdb.io/#c4b71011-8a1d-4cb2-8678-31c0363fea5e)

[csv url load](https://api.harperdb.io/#d1e9f433-e250-49db-b44d-9ce2dcd92d32)

[import from s3](https://api.harperdb.io/#820b3947-acbe-41f9-858b-2413cabc3a18)

[delete_records_before](https://api.harperdb.io/#8de87e47-73a8-4298-b858-ca75dc5765c2)

[export_local](https://api.harperdb.io/#49a02517-ada9-4198-b48d-8707db905be0)

[export_to_s3](https://api.harperdb.io/#f6393e9f-e272-4180-a42c-ff029d93ddd4)

Example Response from a Job Operation

```
{
  "message": "Starting job with id 062a1892-6a0a-4282-9791-0f4c93b12e16"
}
```

Whenever one of these operations is initiated, an asynchronous job is created and the request contains the ID of that job which can be used to check on its status.

## Managing Jobs

To check on a job's status, use the [get_job](https://api.harperdb.io/#d501bef7-dbb7-4714-b535-e466f6583dce) operation.

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

To find jobs (if the ID is not known) use the [search_jobs_by_start_date](https://api.harperdb.io/#4474ca16-e4c2-4740-81b5-14ed98c5eeab) operation.

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
