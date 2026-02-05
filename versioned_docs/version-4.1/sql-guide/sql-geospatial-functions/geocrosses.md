---
title: geoCrosses
---

# geoCrosses

Determines if the geometries cross over each other. Returns boolean.

## Syntax

geoCrosses(_geo1, geo2_)

## Parameters

| Parameter | Description                            |
| --------- | -------------------------------------- |
| geo1      | Required. GeoJSON geometry or feature. |
| geo2      | Required. GeoJSON geometry or feature. |

### Example

Find all locations that cross over a highway.

```
SELECT *
FROM dev.locations
WHERE geoCrosses(
    geo_data,
    '{
        "type": "Feature",
        "properties": {
          "name": "Highway I-25"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-104.9139404296875,41.00477542222947],
                [-105.0238037109375,39.715638134796336],
                [-104.853515625,39.53370327008705],
                [-104.853515625,38.81403111409755],
                [-104.61181640625,38.39764411353178],
                [-104.8974609375,37.68382032669382],
                [-104.501953125,37.00255267215955]
            ]
        }
    }'
)
```
