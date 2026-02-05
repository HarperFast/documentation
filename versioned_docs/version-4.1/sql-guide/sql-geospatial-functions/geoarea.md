---
title: geoArea
---

# geoArea

The geoArea() function returns the area of one or more features in square meters.

### Syntax

geoArea(_geoJSON_)

### Parameters

| Parameter | Description                     |
| --------- | ------------------------------- |
| geoJSON   | Required. One or more features. |

#### Example 1

Calculate the area, in square meters, of a manually passed GeoJSON polygon.

```
SELECT geoArea('{
    "type":"Feature",
    "geometry":{
        "type":"Polygon",
        "coordinates":[[
            [0,0],
            [0.123456,0],
            [0.123456,0.123456],
            [0,0.123456]
        ]]
    }
}')
```

#### Example 2

Find all records that have an area less than 1 square mile (or 2589988 square meters).

```
SELECT * FROM dev.locations
WHERE geoArea(geo_data) < 2589988
```
