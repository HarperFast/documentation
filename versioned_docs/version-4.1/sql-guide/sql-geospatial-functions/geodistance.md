---
title: Geodistance
---

#geoDistance
Calculates the distance between two points in units (default is kilometers).

## Syntax

geoDistance(_point1, point2_[_, units_])

## Parameters

| Parameter | Description                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| point1    | Required. GeoJSON Point specifying the origin.                                                                        |
| point2    | Required. GeoJSON Point specifying the destination.                                                                   |
| units     | Optional. Specified as a string. Options are ‘degrees’, ‘radians’, ‘miles’, or ‘kilometers’. Default is ‘kilometers’. |

### Example 1

Calculate the distance, in miles, between HarperDB’s headquarters and the Washington Monument.

```
SELECT geoDistance('[-104.979127,39.761563]', '[-77.035248,38.889475]', 'miles')
```

### Example 2

Find all locations that are within 40 kilometers of a given point, return that distance in miles, and sort by distance in an ascending order.

```
SELECT *, geoDistance('[-104.979127,39.761563]', geo_data, 'miles') as distance
FROM dev.locations
WHERE geoDistance('[-104.979127,39.761563]', geo_data, 'kilometers') < 40
ORDER BY distance ASC
```
