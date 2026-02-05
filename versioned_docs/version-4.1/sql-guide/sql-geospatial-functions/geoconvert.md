---
title: geoConvert
---

# geoConvert

Converts a series of coordinates into a GeoJSON of the specified type.

## Syntax

geoConvert(_coordinates, geo_type_[, _properties_])

## Parameters

| Parameter   | Description                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| coordinates | Required. One or more coordinates                                                                                                  |
| geo_type    | Required. GeoJSON geometry type. Options are ‘point’, ‘lineString’, ‘multiLineString’, ‘multiPoint’, ‘multiPolygon’, and ‘polygon’ |
| properties  | Optional. Escaped JSON array with properties to be added to the GeoJSON output.                                                    |

### Example

Convert a given coordinate into a GeoJSON point with specified properties.

```
SELECT geoConvert(
    '[-104.979127,39.761563]',
    'point',
    '{
      "name": "HarperDB Headquarters"
    }'
)
```
