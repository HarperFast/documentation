---
title: geoDifference
---

# geoDifference

Returns a new polygon with the difference of the second polygon clipped from the first polygon.

## Syntax

geoDifference(_polygon1, polygon2_)

## Parameters

| Parameter | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| polygon1  | Required. Polygon or MultiPolygon GeoJSON feature.                         |
| polygon2  | Required. Polygon or MultiPolygon GeoJSON feature to remove from polygon1. |

### Example

Return a GeoJSON Polygon that removes City Park (_polygon2_) from Colorado (_polygon1_).

```
SELECT geoDifference('{
    "type": "Feature",
    "properties": {
      "name":"Colorado"
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.072265625,37.00255267215955],
            [-102.01904296874999,37.00255267215955],
            [-102.01904296874999,41.0130657870063],
            [-109.072265625,41.0130657870063],
            [-109.072265625,37.00255267215955]
        ]]
      }
    }',
    '{
        "type": "Feature",
        "properties": {
          "name":"City Park"
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-104.95973110198975,39.7543828214657],
                [-104.95955944061278,39.744781185675386],
                [-104.95904445648193,39.74422022399989],
                [-104.95835781097412,39.74402223643582],
                [-104.94097709655762,39.74392324244047],
                [-104.9408483505249,39.75434982844515],
                [-104.95973110198975,39.7543828214657]
            ]]
        }
    }'
)
```
