---
title: geoEqual
---

# geoEqual

Determines if two GeoJSON features are the same type and have identical X,Y coordinate values. For more information see [https://developers.arcgis.com/documentation/spatial-references/](https://developers.arcgis.com/documentation/spatial-references/). Returns a Boolean.

## Syntax

geoEqual(_geo1_, _geo2_)

## Parameters

| Parameter | Description                            |
| --------- | -------------------------------------- |
| geo1      | Required. GeoJSON geometry or feature. |
| geo2      | Required. GeoJSON geometry or feature. |

### Example

Find HarperDB Headquarters within all locations within the database.

```
SELECT *
FROM dev.locations
WHERE geoEqual(geo_data, '{
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
