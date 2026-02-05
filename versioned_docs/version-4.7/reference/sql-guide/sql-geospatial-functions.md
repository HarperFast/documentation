---
title: SQL Geospatial Functions
---

:::warning
Harper encourages developers to utilize other querying tools over SQL for performance purposes. Harper SQL is intended for data investigation purposes and uses cases where performance is not a priority. SQL optimizations are on our roadmap for the future.
:::

# SQL Geospatial Functions

Harper geospatial features require data to be stored in a single column using the [GeoJSON standard](https://geojson.org/), a standard commonly used in geospatial technologies. Geospatial functions are available to be used in SQL statements.

If you are new to GeoJSON you should check out the full specification here: https://geojson.org/. There are a few important things to point out before getting started.

1. All GeoJSON coordinates are stored in `[longitude, latitude]` format.
1. Coordinates or GeoJSON geometries must be passed as string when written directly in a SQL statement.
1. Note if you are using Postman for you testing. Due to limitations in the Postman client, you will need to escape quotes in your strings and your SQL will need to be passed on a single line.

In the examples contained in the left-hand navigation, database and table names may change, but all GeoJSON data will be stored in a column named geo_data.

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

# geoDistance

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

Calculate the distance, in miles, between Harper’s headquarters and the Washington Monument.

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

Return all locations which contain Harper Headquarters.

```
SELECT *
FROM dev.locations
WHERE geoContains(geo_data, '{
    "type": "Feature",
    "properties": {
      "name": "Harper Headquarters"
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

# geoEqual

Determines if two GeoJSON features are the same type and have identical X,Y coordinate values. For more information see https://developers.arcgis.com/documentation/spatial-references/. Returns a Boolean.

## Syntax

geoEqual(_geo1_, _geo2_)

## Parameters

| Parameter | Description                            |
| --------- | -------------------------------------- |
| geo1      | Required. GeoJSON geometry or feature. |
| geo2      | Required. GeoJSON geometry or feature. |

### Example

Find Harper Headquarters within all locations within the database.

```
SELECT *
FROM dev.locations
WHERE geoEqual(geo_data, '{
    "type": "Feature",
    "properties": {
      "name": "Harper Headquarters"
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
      "name": "Harper Headquarters"
    }'
)
```
