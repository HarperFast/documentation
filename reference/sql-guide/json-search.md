---
title: SQL JSON Search
---

:::warning
Harper encourages developers to utilize other querying tools over SQL for performance purposes. Harper SQL is intended for data investigation purposes and uses cases where performance is not a priority. SQL optimizations are on our roadmap for the future.
:::

# SQL JSON Search

Harper automatically indexes all top level attributes in a row / object written to a table. However, any attributes which hold JSON data do not have their nested attributes indexed. In order to make searching and/or transforming these JSON documents easy, Harper offers a special SQL function called SEARCH_JSON. The SEARCH_JSON function works in SELECT & WHERE clauses allowing queries to perform powerful filtering on any element of your JSON by implementing the [JSONata library](https://docs.jsonata.org/overview.html) into our SQL engine.

## Syntax

`SEARCH_JSON(expression, attribute)`

Executes the supplied string _expression_ against data of the defined top level _attribute_ for each row. The expression both filters and defines output from the JSON document.

### Example 1

#### Search a string array

Here are two records in the database:

```json
[
	{
		"id": 1,
		"name": ["Harper", "Penny"]
	},
	{
		"id": 2,
		"name": ["Penny"]
	}
]
```

Here is a simple query that gets any record with "Harper" found in the name.

```
SELECT *
FROM dev.dog
WHERE search_json('"Harper" in *', name)
```

### Example 2

The purpose of this query is to give us every movie where at least two of our favorite actors from Marvel films have acted together. The results will return the movie title, the overview, release date and an object array of the actor’s name and their character name in the movie.

Both function calls evaluate the credits.cast attribute, this attribute is an object array of every cast member in a movie.

```
SELECT m.title,
    m.overview,
    m.release_date,
    SEARCH_JSON($[name in ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson", "Mark Ruffalo", "Chris Hemsworth", "Jeremy Renner", "Clark Gregg", "Samuel L. Jackson", "Gwyneth Paltrow", "Don Cheadle"]].{"actor": name, "character": character}, c.`cast`) AS characters
FROM movies.credits c
    INNER JOIN movies.movie m
    ON c.movie_id = m.id
WHERE SEARCH_JSON($count($[name in ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson", "Mark Ruffalo", "Chris Hemsworth", "Jeremy Renner", "Clark Gregg", "Samuel L. Jackson", "Gwyneth Paltrow", "Don Cheadle"]]), c.`cast`) >= 2
```

A sample of this data from the movie The Avengers looks like

```json
[
	{
		"cast_id": 46,
		"character": "Tony Stark / Iron Man",
		"credit_id": "52fe4495c3a368484e02b251",
		"gender": "male",
		"id": 3223,
		"name": "Robert Downey Jr.",
		"order": 0
	},
	{
		"cast_id": 2,
		"character": "Steve Rogers / Captain America",
		"credit_id": "52fe4495c3a368484e02b19b",
		"gender": "male",
		"id": 16828,
		"name": "Chris Evans",
		"order": 1
	},
	{
		"cast_id": 307,
		"character": "Bruce Banner / The Hulk",
		"credit_id": "5e85e8083344c60015411cfa",
		"gender": "male",
		"id": 103,
		"name": "Mark Ruffalo",
		"order": 2
	}
]
```

Let’s break down the SEARCH_JSON function call in the SELECT:

```
SEARCH_JSON(
    $[name in [
        "Robert Downey Jr.",
        "Chris Evans",
        "Scarlett Johansson",
        "Mark Ruffalo",
        "Chris Hemsworth",
        "Jeremy Renner",
        "Clark Gregg",
        "Samuel L. Jackson",
        "Gwyneth Paltrow",
        "Don Cheadle"
    ]].{
        "actor": name,
        "character": character
    },
    c.`cast`
)
```

The first argument passed to SEARCH_JSON is the expression to execute against the second argument which is the cast attribute on the credits table. This expression will execute for every row. Looking into the expression it starts with "$[…]" this tells the expression to iterate all elements of the cast array.

Then the expression tells the function to only return entries where the name attribute matches any of the actors defined in the array:

```
name in ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson", "Mark Ruffalo", "Chris Hemsworth", "Jeremy Renner", "Clark Gregg", "Samuel L. Jackson", "Gwyneth Paltrow", "Don Cheadle"]
```

So far, we’ve iterated the array and filtered out rows, but we also want the results formatted in a specific way, so we’ve chained an expression on our filter with: `{"actor": name, "character": character}`. This tells the function to create a specific object for each matching entry.

**Sample Result**

```json
[
	{
		"actor": "Robert Downey Jr.",
		"character": "Tony Stark / Iron Man"
	},
	{
		"actor": "Chris Evans",
		"character": "Steve Rogers / Captain America"
	},
	{
		"actor": "Mark Ruffalo",
		"character": "Bruce Banner / The Hulk"
	}
]
```

Just having the SEARCH_JSON function in our SELECT is powerful, but given our criteria it would still return every other movie that doesn’t have our matching actors, in order to filter out the movies we do not want we also use SEARCH_JSON in the WHERE clause.

This function call in the WHERE clause is similar, but we don’t need to perform the same transformation as occurred in the SELECT:

```
SEARCH_JSON(
    $count(
    $[name in [
            "Robert Downey Jr.",
            "Chris Evans",
            "Scarlett Johansson",
            "Mark Ruffalo",
            "Chris Hemsworth",
            "Jeremy Renner",
            "Clark Gregg",
            "Samuel L. Jackson",
            "Gwyneth Paltrow",
            "Don Cheadle"
        ]]
    ),
    c.`cast`
) >= 2
```

As seen above we execute the same name filter against the cast array, the primary difference is we are wrapping the filtered results in $count(…). As it looks this returns a count of the results back which we then use against our SQL comparator of >= 2.

To see further SEARCH_JSON examples in action view our Postman Collection that provides a [sample database & data with query examples](../../../developers/operations-api/advanced-json-sql-examples).

To learn more about how to build expressions check out the JSONata documentation: [https://docs.jsonata.org/overview](https://docs.jsonata.org/overview)
