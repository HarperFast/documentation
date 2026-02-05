---
title: geoLength
---

# geoLength

Takes a GeoJSON and measures its length in the specified units (default is kilometers).

## Syntax

geoLength(_geoJSON_[_, units_])

## Parameters

| Parameter | Description                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| geoJSON   | Required. GeoJSON to measure.                                                                                         |
| units     | Optional. Specified as a string. Options are ‘degrees’, ‘radians’, ‘miles’, or ‘kilometers’. Default is ‘kilometers’. |

### Example 1

Calculate the length, in kilometers, of a manually passed GeoJSON linestring.

```
SELECT geoLength('{
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [-104.97963309288025,39.76163265441438],
            [-104.9823260307312,39.76365323407955],
            [-104.99193906784058,39.75616442110704]
        ]
    }
}')
```

### Example 2

Find all data plus the calculated length in miles of the GeoJSON, restrict the response to only lengths less than 5 miles, and return the data in order of lengths smallest to largest.

```
SELECT *, geoLength(geo_data, 'miles') as length
FROM dev.locations
WHERE geoLength(geo_data, 'miles') < 5
ORDER BY length ASC
```
