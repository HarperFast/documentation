---
title: geoContains
---

# geoContains

Determines if geo2 is completely contained by geo1. Returns a Boolean.

## Syntax

geoContains(_geo1, geo2_)

## Parameters

| Parameter | Description                                                                       |
| --------- | --------------------------------------------------------------------------------- |
| geo1      | Required. Polygon or MultiPolygon GeoJSON feature.                                |
| geo2      | Required. Polygon or MultiPolygon GeoJSON feature tested to be contained by geo1. |

### Example 1

Return all locations within the state of Colorado (passed as a GeoJSON string).

```
SELECT *
FROM dev.locations
WHERE geoContains('{
    "type": "Feature",
    "properties": {
      "name":"Colorado"
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.072265625,37.00255267],
            [-102.01904296874999,37.00255267],
            [-102.01904296874999,41.01306579],
            [-109.072265625,41.01306579],
            [-109.072265625,37.00255267]
        ]]
    }
}', geo_data)
```

### Example 2

Return all locations which contain HarperDB Headquarters.

```
SELECT *
FROM dev.locations
WHERE geoContains(geo_data, '{
    "type": "Feature",
    "properties": {
      "name": "HarperDB Headquarters"
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.98060941696167,39.760704817357905],
            [-104.98053967952728,39.76065120861263],
            [-104.98055577278137,39.760642961109674],
            [-104.98037070035934,39.76049450588716],
            [-104.9802714586258,39.76056254790385],
            [-104.9805235862732,39.76076461167841],
            [-104.98060941696167,39.760704817357905]
        ]]
    }
}')
```
