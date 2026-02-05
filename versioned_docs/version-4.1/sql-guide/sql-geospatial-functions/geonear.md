---
title: geoNear
---

# geoNear

Determines if point1 and point2 are within a specified distance from each other, default units are kilometers. Returns a Boolean.

## Syntax

geoNear(_point1, point2, distance_[_, units_])

## Parameters

| Parameter | Description                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| point1    | Required. GeoJSON Point specifying the origin.                                                                        |
| point2    | Required. GeoJSON Point specifying the destination.                                                                   |
| distance  | Required. The maximum distance in units as an integer or decimal.                                                     |
| units     | Optional. Specified as a string. Options are ‘degrees’, ‘radians’, ‘miles’, or ‘kilometers’. Default is ‘kilometers’. |

### Example 1

Return all locations within 50 miles of a given point.

```
SELECT *
FROM dev.locations
WHERE geoNear('[-104.979127,39.761563]', geo_data, 50, 'miles')
```

### Example 2

Return all locations within 2 degrees of the earth of a given point. (Each degree lat/long is about 69 miles [111 kilometers]). Return all data and the distance in miles, sorted by ascending distance.

```
SELECT *, geoDistance('[-104.979127,39.761563]', geo_data, 'miles') as distance
FROM dev.locations
WHERE geoNear('[-104.979127,39.761563]', geo_data, 2, 'degrees')
ORDER BY distance ASC
```
