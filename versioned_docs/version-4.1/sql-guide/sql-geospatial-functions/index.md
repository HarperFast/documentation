---
title: SQL Geospatial Functions
---

# SQL Geospatial Functions

HarperDB geospatial features require data to be stored in a single column using the [GeoJSON standard](https://geojson.org/), a standard commonly used in geospatial technologies. Geospatial functions are available to be used in SQL statements.

If you are new to GeoJSON you should check out the full specification here: [https://geojson.org/](https://geojson.org/). There are a few important things to point out before getting started.

1. All GeoJSON coordinates are stored in `[longitude, latitude]` format.
2. Coordinates or GeoJSON geometries must be passed as string when written directly in a SQL statement.
3. Note if you are using Postman for you testing. Due to limitations in the Postman client, you will need to escape quotes in your strings and your SQL will need to be passed on a single line.

In the examples contained in the left-hand navigation, schema and table names may change, but all GeoJSON data will be stored in a column named geo_data.
