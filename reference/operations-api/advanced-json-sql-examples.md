---
title: Advanced JSON SQL Examples
---

# Advanced JSON SQL Examples

## Create movies database

Create a new database called `movies` using the `create_database` operation.

_Note: Creating a database is optional, if one is not created Harper will default to using a database named `data`_

### Body

```json
{
	"operation": "create_database",
	"database": "movies"
}
```

### Response: 200

```json
{
	"message": "database 'movies' successfully created"
}
```

---

## Create movie Table

Creates a new table called "movie" inside the database "movies" using the ‘create_table’ operation.

### Body

```json
{
	"operation": "create_table",
	"database": "movies",
	"table": "movie",
	"primary_key": "id"
}
```

### Response: 200

```json
{
	"message": "table 'movies.movie' successfully created."
}
```

---

## Create credits Table

Creates a new table called "credits" inside the database "movies" using the ‘create_table’ operation.

### Body

```json
{
	"operation": "create_table",
	"database": "movies",
	"table": "credits",
	"primary_key": "movie_id"
}
```

### Response: 200

```json
{
	"message": "table 'movies.credits' successfully created."
}
```

---

## Bulk Insert movie Via CSV

Inserts data from a hosted CSV file into the "movie" table using the 'csv_url_load' operation.

### Body

```json
{
	"operation": "csv_url_load",
	"database": "movies",
	"table": "movie",
	"csv_url": "https://search-json-sample-data.s3.us-east-2.amazonaws.com/movie.csv"
}
```

### Response: 200

```json
{
	"message": "Starting job with id 1889eee4-23c1-4945-9bb7-c805fc20726c"
}
```

---

## Bulk Insert credits Via CSV

Inserts data from a hosted CSV file into the "credits" table using the 'csv_url_load' operation.

### Body

```json
{
	"operation": "csv_url_load",
	"database": "movies",
	"table": "credits",
	"csv_url": "https://search-json-sample-data.s3.us-east-2.amazonaws.com/credits.csv"
}
```

### Response: 200

```json
{
	"message": "Starting job with id 3a14cd74-67f3-41e9-8ccd-45ffd0addc2c",
	"job_id": "3a14cd74-67f3-41e9-8ccd-45ffd0addc2c"
}
```

---

## View raw data

In the following example we will be running expressions on the keywords & production_companies attributes, so for context we are displaying what the raw data looks like.

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT title, rank, keywords, production_companies FROM movies.movie ORDER BY rank LIMIT 10"
}
```

### Response: 200

```json
[
	{
		"title": "Ad Astra",
		"rank": 1,
		"keywords": [
			{
				"id": 305,
				"name": "moon"
			},
			{
				"id": 697,
				"name": "loss of loved one"
			},
			{
				"id": 839,
				"name": "planet mars"
			},
			{
				"id": 14626,
				"name": "astronaut"
			},
			{
				"id": 157265,
				"name": "moon colony"
			},
			{
				"id": 162429,
				"name": "solar system"
			},
			{
				"id": 240119,
				"name": "father son relationship"
			},
			{
				"id": 244256,
				"name": "near future"
			},
			{
				"id": 257878,
				"name": "planet neptune"
			},
			{
				"id": 260089,
				"name": "space walk"
			}
		],
		"production_companies": [
			{
				"id": 490,
				"name": "New Regency Productions",
				"origin_country": ""
			},
			{
				"id": 79963,
				"name": "Keep Your Head",
				"origin_country": ""
			},
			{
				"id": 73492,
				"name": "MadRiver Pictures",
				"origin_country": ""
			},
			{
				"id": 81,
				"name": "Plan B Entertainment",
				"origin_country": "US"
			},
			{
				"id": 30666,
				"name": "RT Features",
				"origin_country": "BR"
			},
			{
				"id": 30148,
				"name": "Bona Film Group",
				"origin_country": "CN"
			},
			{
				"id": 22213,
				"name": "TSG Entertainment",
				"origin_country": "US"
			}
		]
	},
	{
		"title": "Extraction",
		"rank": 2,
		"keywords": [
			{
				"id": 3070,
				"name": "mercenary"
			},
			{
				"id": 4110,
				"name": "mumbai (bombay), india"
			},
			{
				"id": 9717,
				"name": "based on comic"
			},
			{
				"id": 9730,
				"name": "crime boss"
			},
			{
				"id": 11107,
				"name": "rescue mission"
			},
			{
				"id": 18712,
				"name": "based on graphic novel"
			},
			{
				"id": 265216,
				"name": "dhaka (dacca), bangladesh"
			}
		],
		"production_companies": [
			{
				"id": 106544,
				"name": "AGBO",
				"origin_country": "US"
			},
			{
				"id": 109172,
				"name": "Thematic Entertainment",
				"origin_country": "US"
			},
			{
				"id": 92029,
				"name": "TGIM Films",
				"origin_country": "US"
			}
		]
	},
	{
		"title": "To the Beat! Back 2 School",
		"rank": 3,
		"keywords": [
			{
				"id": 10873,
				"name": "school"
			}
		],
		"production_companies": []
	},
	{
		"title": "Bloodshot",
		"rank": 4,
		"keywords": [
			{
				"id": 2651,
				"name": "nanotechnology"
			},
			{
				"id": 9715,
				"name": "superhero"
			},
			{
				"id": 9717,
				"name": "based on comic"
			},
			{
				"id": 164218,
				"name": "psychotronic"
			},
			{
				"id": 255024,
				"name": "shared universe"
			},
			{
				"id": 258575,
				"name": "valiant comics"
			}
		],
		"production_companies": [
			{
				"id": 34,
				"name": "Sony Pictures",
				"origin_country": "US"
			},
			{
				"id": 10246,
				"name": "Cross Creek Pictures",
				"origin_country": "US"
			},
			{
				"id": 6573,
				"name": "Mimran Schur Pictures",
				"origin_country": "US"
			},
			{
				"id": 333,
				"name": "Original Film",
				"origin_country": "US"
			},
			{
				"id": 103673,
				"name": "The Hideaway Entertainment",
				"origin_country": "US"
			},
			{
				"id": 124335,
				"name": "Valiant Entertainment",
				"origin_country": "US"
			},
			{
				"id": 5,
				"name": "Columbia Pictures",
				"origin_country": "US"
			},
			{
				"id": 1225,
				"name": "One Race",
				"origin_country": "US"
			},
			{
				"id": 30148,
				"name": "Bona Film Group",
				"origin_country": "CN"
			}
		]
	},
	{
		"title": "The Call of the Wild",
		"rank": 5,
		"keywords": [
			{
				"id": 818,
				"name": "based on novel or book"
			},
			{
				"id": 4542,
				"name": "gold rush"
			},
			{
				"id": 15162,
				"name": "dog"
			},
			{
				"id": 155821,
				"name": "sled dogs"
			},
			{
				"id": 189390,
				"name": "yukon"
			},
			{
				"id": 207928,
				"name": "19th century"
			},
			{
				"id": 259987,
				"name": "cgi animation"
			},
			{
				"id": 263806,
				"name": "1890s"
			}
		],
		"production_companies": [
			{
				"id": 787,
				"name": "3 Arts Entertainment",
				"origin_country": "US"
			},
			{
				"id": 127928,
				"name": "20th Century Studios",
				"origin_country": "US"
			},
			{
				"id": 22213,
				"name": "TSG Entertainment",
				"origin_country": "US"
			}
		]
	},
	{
		"title": "Sonic the Hedgehog",
		"rank": 6,
		"keywords": [
			{
				"id": 282,
				"name": "video game"
			},
			{
				"id": 6054,
				"name": "friendship"
			},
			{
				"id": 10842,
				"name": "good vs evil"
			},
			{
				"id": 41645,
				"name": "based on video game"
			},
			{
				"id": 167043,
				"name": "road movie"
			},
			{
				"id": 172142,
				"name": "farting"
			},
			{
				"id": 188933,
				"name": "bar fight"
			},
			{
				"id": 226967,
				"name": "amistad"
			},
			{
				"id": 245230,
				"name": "live action remake"
			},
			{
				"id": 258111,
				"name": "fantasy"
			},
			{
				"id": 260223,
				"name": "videojuego"
			}
		],
		"production_companies": [
			{
				"id": 333,
				"name": "Original Film",
				"origin_country": "US"
			},
			{
				"id": 10644,
				"name": "Blur Studios",
				"origin_country": "US"
			},
			{
				"id": 77884,
				"name": "Marza Animation Planet",
				"origin_country": "JP"
			},
			{
				"id": 4,
				"name": "Paramount",
				"origin_country": "US"
			},
			{
				"id": 113750,
				"name": "SEGA",
				"origin_country": "JP"
			},
			{
				"id": 100711,
				"name": "DJ2 Entertainment",
				"origin_country": ""
			},
			{
				"id": 24955,
				"name": "Paramount Animation",
				"origin_country": "US"
			}
		]
	},
	{
		"title": "Birds of Prey (and the Fantabulous Emancipation of One Harley Quinn)",
		"rank": 7,
		"keywords": [
			{
				"id": 849,
				"name": "dc comics"
			},
			{
				"id": 9717,
				"name": "based on comic"
			},
			{
				"id": 187056,
				"name": "woman director"
			},
			{
				"id": 229266,
				"name": "dc extended universe"
			}
		],
		"production_companies": [
			{
				"id": 9993,
				"name": "DC Entertainment",
				"origin_country": "US"
			},
			{
				"id": 82968,
				"name": "LuckyChap Entertainment",
				"origin_country": "GB"
			},
			{
				"id": 103462,
				"name": "Kroll & Co Entertainment",
				"origin_country": "US"
			},
			{
				"id": 174,
				"name": "Warner Bros. Pictures",
				"origin_country": "US"
			},
			{
				"id": 429,
				"name": "DC Comics",
				"origin_country": "US"
			},
			{
				"id": 128064,
				"name": "DC Films",
				"origin_country": "US"
			},
			{
				"id": 101831,
				"name": "Clubhouse Pictures",
				"origin_country": "US"
			}
		]
	},
	{
		"title": "Justice League Dark: Apokolips War",
		"rank": 8,
		"keywords": [
			{
				"id": 849,
				"name": "dc comics"
			}
		],
		"production_companies": [
			{
				"id": 2785,
				"name": "Warner Bros. Animation",
				"origin_country": "US"
			},
			{
				"id": 9993,
				"name": "DC Entertainment",
				"origin_country": "US"
			},
			{
				"id": 429,
				"name": "DC Comics",
				"origin_country": "US"
			}
		]
	},
	{
		"title": "Parasite",
		"rank": 9,
		"keywords": [
			{
				"id": 1353,
				"name": "underground"
			},
			{
				"id": 5318,
				"name": "seoul"
			},
			{
				"id": 5732,
				"name": "birthday party"
			},
			{
				"id": 5752,
				"name": "private lessons"
			},
			{
				"id": 9866,
				"name": "basement"
			},
			{
				"id": 10453,
				"name": "con artist"
			},
			{
				"id": 11935,
				"name": "working class"
			},
			{
				"id": 12565,
				"name": "psychological thriller"
			},
			{
				"id": 13126,
				"name": "limousine driver"
			},
			{
				"id": 14514,
				"name": "class differences"
			},
			{
				"id": 14864,
				"name": "rich poor"
			},
			{
				"id": 17997,
				"name": "housekeeper"
			},
			{
				"id": 18015,
				"name": "tutor"
			},
			{
				"id": 18035,
				"name": "family"
			},
			{
				"id": 33421,
				"name": "crime family"
			},
			{
				"id": 173272,
				"name": "flood"
			},
			{
				"id": 188861,
				"name": "smell"
			},
			{
				"id": 198673,
				"name": "unemployed"
			},
			{
				"id": 237462,
				"name": "wealthy family"
			}
		],
		"production_companies": [
			{
				"id": 7036,
				"name": "CJ Entertainment",
				"origin_country": "KR"
			},
			{
				"id": 4399,
				"name": "Barunson E&A",
				"origin_country": "KR"
			}
		]
	},
	{
		"title": "Star Wars: The Rise of Skywalker",
		"rank": 10,
		"keywords": [
			{
				"id": 161176,
				"name": "space opera"
			}
		],
		"production_companies": [
			{
				"id": 1,
				"name": "Lucasfilm",
				"origin_country": "US"
			},
			{
				"id": 11461,
				"name": "Bad Robot",
				"origin_country": "US"
			},
			{
				"id": 2,
				"name": "Walt Disney Pictures",
				"origin_country": "US"
			},
			{
				"id": 120404,
				"name": "British Film Commission",
				"origin_country": ""
			}
		]
	}
]
```

---

## Simple search_json call

This query uses search_json to convert the keywords object array to a simple string array. The expression '[name]' tells the function to extract all values for the name attribute and wrap them in an array.

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT title, rank, search_json('[name]', keywords) as keywords FROM movies.movie ORDER BY rank LIMIT 10"
}
```

### Response: 200

```json
[
	{
		"title": "Ad Astra",
		"rank": 1,
		"keywords": [
			"moon",
			"loss of loved one",
			"planet mars",
			"astronaut",
			"moon colony",
			"solar system",
			"father son relationship",
			"near future",
			"planet neptune",
			"space walk"
		]
	},
	{
		"title": "Extraction",
		"rank": 2,
		"keywords": [
			"mercenary",
			"mumbai (bombay), india",
			"based on comic",
			"crime boss",
			"rescue mission",
			"based on graphic novel",
			"dhaka (dacca), bangladesh"
		]
	},
	{
		"title": "To the Beat! Back 2 School",
		"rank": 3,
		"keywords": ["school"]
	},
	{
		"title": "Bloodshot",
		"rank": 4,
		"keywords": ["nanotechnology", "superhero", "based on comic", "psychotronic", "shared universe", "valiant comics"]
	},
	{
		"title": "The Call of the Wild",
		"rank": 5,
		"keywords": [
			"based on novel or book",
			"gold rush",
			"dog",
			"sled dogs",
			"yukon",
			"19th century",
			"cgi animation",
			"1890s"
		]
	},
	{
		"title": "Sonic the Hedgehog",
		"rank": 6,
		"keywords": [
			"video game",
			"friendship",
			"good vs evil",
			"based on video game",
			"road movie",
			"farting",
			"bar fight",
			"amistad",
			"live action remake",
			"fantasy",
			"videojuego"
		]
	},
	{
		"title": "Birds of Prey (and the Fantabulous Emancipation of One Harley Quinn)",
		"rank": 7,
		"keywords": ["dc comics", "based on comic", "woman director", "dc extended universe"]
	},
	{
		"title": "Justice League Dark: Apokolips War",
		"rank": 8,
		"keywords": ["dc comics"]
	},
	{
		"title": "Parasite",
		"rank": 9,
		"keywords": [
			"underground",
			"seoul",
			"birthday party",
			"private lessons",
			"basement",
			"con artist",
			"working class",
			"psychological thriller",
			"limousine driver",
			"class differences",
			"rich poor",
			"housekeeper",
			"tutor",
			"family",
			"crime family",
			"flood",
			"smell",
			"unemployed",
			"wealthy family"
		]
	},
	{
		"title": "Star Wars: The Rise of Skywalker",
		"rank": 10,
		"keywords": ["space opera"]
	}
]
```

---

## Use search_json in a where clause

This example shows how we can use SEARCH_JSON to filter out records in a WHERE clause. The production_companies attribute holds an object array of companies that produced each movie, we want to only see movies which were produced by Marvel Studios. Our expression is a filter '$[name="Marvel Studios"]' this tells the function to iterate the production_companies array and only return entries where the name is "Marvel Studios".

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT title, release_date FROM movies.movie where search_json('$[name=\"Marvel Studios\"]', production_companies) IS NOT NULL ORDER BY release_date"
}
```

### Response: 200

```json
[
	{
		"title": "Iron Man",
		"release_date": "2008-04-30"
	},
	{
		"title": "The Incredible Hulk",
		"release_date": "2008-06-12"
	},
	{
		"title": "Iron Man 2",
		"release_date": "2010-04-28"
	},
	{
		"title": "Thor",
		"release_date": "2011-04-21"
	},
	{
		"title": "Captain America: The First Avenger",
		"release_date": "2011-07-22"
	},
	{
		"title": "Marvel One-Shot: The Consultant",
		"release_date": "2011-09-12"
	},
	{
		"title": "Marvel One-Shot: A Funny Thing Happened on the Way to Thor's Hammer",
		"release_date": "2011-10-25"
	},
	{
		"title": "The Avengers",
		"release_date": "2012-04-25"
	},
	{
		"title": "Marvel One-Shot: Item 47",
		"release_date": "2012-09-13"
	},
	{
		"title": "Iron Man 3",
		"release_date": "2013-04-18"
	},
	{
		"title": "Marvel One-Shot: Agent Carter",
		"release_date": "2013-09-08"
	},
	{
		"title": "Thor: The Dark World",
		"release_date": "2013-10-29"
	},
	{
		"title": "Marvel One-Shot: All Hail the King",
		"release_date": "2014-02-04"
	},
	{
		"title": "Marvel Studios: Assembling a Universe",
		"release_date": "2014-03-18"
	},
	{
		"title": "Captain America: The Winter Soldier",
		"release_date": "2014-03-20"
	},
	{
		"title": "Guardians of the Galaxy",
		"release_date": "2014-07-30"
	},
	{
		"title": "Avengers: Age of Ultron",
		"release_date": "2015-04-22"
	},
	{
		"title": "Ant-Man",
		"release_date": "2015-07-14"
	},
	{
		"title": "Captain America: Civil War",
		"release_date": "2016-04-27"
	},
	{
		"title": "Team Thor",
		"release_date": "2016-08-28"
	},
	{
		"title": "Doctor Strange",
		"release_date": "2016-10-25"
	},
	{
		"title": "Guardians of the Galaxy Vol. 2",
		"release_date": "2017-04-19"
	},
	{
		"title": "Spider-Man: Homecoming",
		"release_date": "2017-07-05"
	},
	{
		"title": "Thor: Ragnarok",
		"release_date": "2017-10-25"
	},
	{
		"title": "Black Panther",
		"release_date": "2018-02-13"
	},
	{
		"title": "Avengers: Infinity War",
		"release_date": "2018-04-25"
	},
	{
		"title": "Ant-Man and the Wasp",
		"release_date": "2018-07-04"
	},
	{
		"title": "Captain Marvel",
		"release_date": "2019-03-06"
	},
	{
		"title": "Avengers: Endgame",
		"release_date": "2019-04-24"
	},
	{
		"title": "Spider-Man: Far from Home",
		"release_date": "2019-06-28"
	},
	{
		"title": "Black Widow",
		"release_date": "2020-10-28"
	},
	{
		"title": "Untitled Spider-Man 3",
		"release_date": "2021-11-04"
	},
	{
		"title": "Thor: Love and Thunder",
		"release_date": "2022-02-10"
	},
	{
		"title": "Doctor Strange in the Multiverse of Madness",
		"release_date": "2022-03-23"
	},
	{
		"title": "Untitled Marvel Project (3)",
		"release_date": "2022-07-29"
	},
	{
		"title": "Guardians of the Galaxy Vol. 3",
		"release_date": "2023-02-16"
	}
]
```

---

## Use search_json to show the movies with the largest casts

This example shows how we can use SEARCH_JSON to perform a simple calculation on JSON and order by the results. The cast attribute holds an object array of details around the cast of a movie. We use the expression '$count(id)' that counts each id and returns the value back which we alias in SQL as cast_size which in turn gets used to sort the rows.

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT movie_title, search_json('$count(id)', `cast`) as cast_size FROM movies.credits ORDER BY cast_size DESC LIMIT 10"
}
```

### Response: 200

```json
[
	{
		"movie_title": "Around the World in Eighty Days",
		"cast_size": 312
	},
	{
		"movie_title": "And the Oscar Goes To...",
		"cast_size": 259
	},
	{
		"movie_title": "Rock of Ages",
		"cast_size": 223
	},
	{
		"movie_title": "Mr. Smith Goes to Washington",
		"cast_size": 213
	},
	{
		"movie_title": "Les Misérables",
		"cast_size": 208
	},
	{
		"movie_title": "Jason Bourne",
		"cast_size": 201
	},
	{
		"movie_title": "The Muppets",
		"cast_size": 191
	},
	{
		"movie_title": "You Don't Mess with the Zohan",
		"cast_size": 183
	},
	{
		"movie_title": "The Irishman",
		"cast_size": 173
	},
	{
		"movie_title": "Spider-Man: Far from Home",
		"cast_size": 173
	}
]
```

---

## search_json as a condition, in a select with a table join

This example shows how we can use SEARCH_JSON to find movies where at least of 2 our favorite actors from Marvel films have acted together then list the movie, its overview, release date, and the actors names and their characters. The WHERE clause performs a count on credits.cast attribute that have the matching actors. The SELECT performs the same filter on the cast attribute and performs a transform on each object to just return the actor's name and their character.

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT m.title, m.overview, m.release_date, search_json('$[name in [\"Robert Downey Jr.\", \"Chris Evans\", \"Scarlett Johansson\", \"Mark Ruffalo\", \"Chris Hemsworth\", \"Jeremy Renner\", \"Clark Gregg\", \"Samuel L. Jackson\", \"Gwyneth Paltrow\", \"Don Cheadle\"]].{\"actor\": name, \"character\": character}', c.`cast`) as characters FROM movies.credits c INNER JOIN movies.movie m ON c.movie_id = m.id WHERE search_json('$count($[name in [\"Robert Downey Jr.\", \"Chris Evans\", \"Scarlett Johansson\", \"Mark Ruffalo\", \"Chris Hemsworth\", \"Jeremy Renner\", \"Clark Gregg\", \"Samuel L. Jackson\", \"Gwyneth Paltrow\", \"Don Cheadle\"]])', c.`cast`) >= 2"
}
```

### Response: 200

```json
[
	{
		"title": "Out of Sight",
		"overview": "Meet Jack Foley, a smooth criminal who bends the law and is determined to make one last heist. Karen Sisco is a federal marshal who chooses all the right moves … and all the wrong guys. Now they're willing to risk it all to find out if there's more between them than just the law.",
		"release_date": "1998-06-26",
		"characters": [
			{
				"actor": "Don Cheadle",
				"character": "Maurice Miller"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Hejira Henry (uncredited)"
			}
		]
	},
	{
		"title": "Iron Man",
		"overview": "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.",
		"release_date": "2008-04-30",
		"characters": [
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark / Iron Man"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Virginia \"Pepper\" Potts"
			},
			{
				"actor": "Clark Gregg",
				"character": "Phil Coulson"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury (uncredited)"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			}
		]
	},
	{
		"title": "Captain America: The First Avenger",
		"overview": "During World War II, Steve Rogers is a sickly man from Brooklyn who's transformed into super-soldier Captain America to aid in the war effort. Rogers must stop the Red Skull – Adolf Hitler's ruthless head of weaponry, and the leader of an organization that intends to use a mysterious device of untold powers for world domination.",
		"release_date": "2011-07-22",
		"characters": [
			{
				"actor": "Chris Evans",
				"character": "Steve Rogers / Captain America"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			}
		]
	},
	{
		"title": "In Good Company",
		"overview": "Dan Foreman is a seasoned advertisement sales executive at a high-ranking publication when a corporate takeover results in him being placed under naive supervisor Carter Duryea, who is half his age. Matters are made worse when Dan's new supervisor becomes romantically involved with his daughter an 18 year-old college student Alex.",
		"release_date": "2004-12-29",
		"characters": [
			{
				"actor": "Scarlett Johansson",
				"character": "Alex Foreman"
			},
			{
				"actor": "Clark Gregg",
				"character": "Mark Steckle"
			}
		]
	},
	{
		"title": "Zodiac",
		"overview": "The true story of the investigation of the \"Zodiac Killer\", a serial killer who terrified the San Francisco Bay Area, taunting police with his ciphers and letters. The case becomes an obsession for three men as their lives and careers are built and destroyed by the endless trail of clues.",
		"release_date": "2007-03-02",
		"characters": [
			{
				"actor": "Mark Ruffalo",
				"character": "Dave Toschi"
			},
			{
				"actor": "Robert Downey Jr.",
				"character": "Paul Avery"
			}
		]
	},
	{
		"title": "Hard Eight",
		"overview": "A stranger mentors a young Reno gambler who weds a hooker and befriends a vulgar casino regular.",
		"release_date": "1996-02-28",
		"characters": [
			{
				"actor": "Gwyneth Paltrow",
				"character": "Clementine"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Jimmy"
			}
		]
	},
	{
		"title": "The Spirit",
		"overview": "Down these mean streets a man must come.  A hero born, murdered, and born again.  A Rookie cop named Denny Colt returns from the beyond as The Spirit, a hero whose mission is to fight against the bad forces from the shadows of Central City.  The Octopus, who kills anyone unfortunate enough to see his face, has other plans; he is going to wipe out the entire city.",
		"release_date": "2008-12-25",
		"characters": [
			{
				"actor": "Scarlett Johansson",
				"character": "Silken Floss"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Octopuss"
			}
		]
	},
	{
		"title": "S.W.A.T.",
		"overview": "Hondo Harrelson recruits Jim Street to join an elite unit of the Los Angeles Police Department. Together they seek out more members, including tough Deke Kay and single mom Chris Sanchez. The team's first big assignment is to escort crime boss Alex Montel to prison. It seems routine, but when Montel offers a huge reward to anyone who can break him free, criminals of various stripes step up for the prize.",
		"release_date": "2003-08-08",
		"characters": [
			{
				"actor": "Samuel L. Jackson",
				"character": "Sgt. Dan 'Hondo' Harrelson"
			},
			{
				"actor": "Jeremy Renner",
				"character": "Brian Gamble"
			}
		]
	},
	{
		"title": "Iron Man 2",
		"overview": "With the world now aware of his dual life as the armored superhero Iron Man, billionaire inventor Tony Stark faces pressure from the government, the press and the public to share his technology with the military. Unwilling to let go of his invention, Stark, with Pepper Potts and James 'Rhodey' Rhodes at his side, must forge new alliances – and confront powerful enemies.",
		"release_date": "2010-04-28",
		"characters": [
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark / Iron Man"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Virginia \"Pepper\" Potts"
			},
			{
				"actor": "Don Cheadle",
				"character": "James \"Rhodey\" Rhodes / War Machine"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natalie Rushman / Natasha Romanoff / Black Widow"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			},
			{
				"actor": "Clark Gregg",
				"character": "Phil Coulson"
			}
		]
	},
	{
		"title": "Thor",
		"overview": "Against his father Odin's will, The Mighty Thor - a powerful but arrogant warrior god - recklessly reignites an ancient war. Thor is cast down to Earth and forced to live among humans as punishment. Once here, Thor learns what it takes to be a true hero when the most dangerous villain of his world sends the darkest forces of Asgard to invade Earth.",
		"release_date": "2011-04-21",
		"characters": [
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Clark Gregg",
				"character": "Phil Coulson"
			},
			{
				"actor": "Jeremy Renner",
				"character": "Clint Barton / Hawkeye (uncredited)"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury (uncredited)"
			}
		]
	},
	{
		"title": "View from the Top",
		"overview": "A small-town woman tries to achieve her goal of becoming a flight attendant.",
		"release_date": "2003-03-21",
		"characters": [
			{
				"actor": "Gwyneth Paltrow",
				"character": "Donna"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Ted Stewart"
			}
		]
	},
	{
		"title": "The Nanny Diaries",
		"overview": "A college graduate goes to work as a nanny for a rich New York family. Ensconced in their home, she has to juggle their dysfunction, a new romance, and the spoiled brat in her charge.",
		"release_date": "2007-08-24",
		"characters": [
			{
				"actor": "Scarlett Johansson",
				"character": "Annie Braddock"
			},
			{
				"actor": "Chris Evans",
				"character": "Hayden \"Harvard Hottie\""
			}
		]
	},
	{
		"title": "The Perfect Score",
		"overview": "Six high school seniors decide to break into the Princeton Testing Center so they can steal the answers to their upcoming SAT tests and all get perfect scores.",
		"release_date": "2004-01-30",
		"characters": [
			{
				"actor": "Chris Evans",
				"character": "Kyle"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Francesca Curtis"
			}
		]
	},
	{
		"title": "The Avengers",
		"overview": "When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster. Spanning the globe, a daring recruitment effort begins!",
		"release_date": "2012-04-25",
		"characters": [
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
			},
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow"
			},
			{
				"actor": "Jeremy Renner",
				"character": "Clint Barton / Hawkeye"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			},
			{
				"actor": "Clark Gregg",
				"character": "Phil Coulson"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Virginia \"Pepper\" Potts"
			}
		]
	},
	{
		"title": "Iron Man 3",
		"overview": "When Tony Stark's world is torn apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.",
		"release_date": "2013-04-18",
		"characters": [
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark / Iron Man"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Virginia \"Pepper\" Potts"
			},
			{
				"actor": "Don Cheadle",
				"character": "James \"Rhodey\" Rhodes / Iron Patriot"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Bruce Banner (uncredited)"
			}
		]
	},
	{
		"title": "Marvel One-Shot: The Consultant",
		"overview": "Agent Coulson informs Agent Sitwell that the World Security Council wishes Emil Blonsky to be released from prison to join the Avengers Initiative. As Nick Fury doesn't want to release Blonsky, the two agents decide to send a patsy to sabotage the meeting...",
		"release_date": "2011-09-12",
		"characters": [
			{
				"actor": "Clark Gregg",
				"character": "Phil Coulson"
			},
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark (archive footage)"
			}
		]
	},
	{
		"title": "Thor: The Dark World",
		"overview": "Thor fights to restore order across the cosmos… but an ancient race led by the vengeful Malekith returns to plunge the universe back into darkness. Faced with an enemy that even Odin and Asgard cannot withstand, Thor must embark on his most perilous and personal journey yet, one that will reunite him with Jane Foster and force him to sacrifice everything to save us all.",
		"release_date": "2013-10-29",
		"characters": [
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Chris Evans",
				"character": "Loki as Captain America (uncredited)"
			}
		]
	},
	{
		"title": "Avengers: Age of Ultron",
		"overview": "When Tony Stark tries to jumpstart a dormant peacekeeping program, things go awry and Earth’s Mightiest Heroes are put to the ultimate test as the fate of the planet hangs in the balance. As the villainous Ultron emerges, it is up to The Avengers to stop him from enacting his terrible plans, and soon uneasy alliances and unexpected action pave the way for an epic and unique global adventure.",
		"release_date": "2015-04-22",
		"characters": [
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
			},
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow"
			},
			{
				"actor": "Jeremy Renner",
				"character": "Clint Barton / Hawkeye"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			},
			{
				"actor": "Don Cheadle",
				"character": "James \"Rhodey\" Rhodes / War Machine"
			}
		]
	},
	{
		"title": "Captain America: The Winter Soldier",
		"overview": "After the cataclysmic events in New York with The Avengers, Steve Rogers, aka Captain America is living quietly in Washington, D.C. and trying to adjust to the modern world. But when a S.H.I.E.L.D. colleague comes under attack, Steve becomes embroiled in a web of intrigue that threatens to put the world at risk. Joining forces with the Black Widow, Captain America struggles to expose the ever-widening conspiracy while fighting off professional assassins sent to silence him at every turn. When the full scope of the villainous plot is revealed, Captain America and the Black Widow enlist the help of a new ally, the Falcon. However, they soon find themselves up against an unexpected and formidable enemy—the Winter Soldier.",
		"release_date": "2014-03-20",
		"characters": [
			{
				"actor": "Chris Evans",
				"character": "Steve Rogers / Captain America"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow"
			}
		]
	},
	{
		"title": "Thanks for Sharing",
		"overview": "A romantic comedy that brings together three disparate characters who are learning to face a challenging and often confusing world as they struggle together against a common demon—sex addiction.",
		"release_date": "2013-09-19",
		"characters": [
			{
				"actor": "Mark Ruffalo",
				"character": "Adam"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Phoebe"
			}
		]
	},
	{
		"title": "Chef",
		"overview": "When Chef Carl Casper suddenly quits his job at a prominent Los Angeles restaurant after refusing to compromise his creative integrity for its controlling owner, he is left to figure out what's next. Finding himself in Miami, he teams up with his ex-wife, his friend and his son to launch a food truck. Taking to the road, Chef Carl goes back to his roots to reignite his passion for the kitchen -- and zest for life and love.",
		"release_date": "2014-05-08",
		"characters": [
			{
				"actor": "Scarlett Johansson",
				"character": "Molly"
			},
			{
				"actor": "Robert Downey Jr.",
				"character": "Marvin"
			}
		]
	},
	{
		"title": "Marvel Studios: Assembling a Universe",
		"overview": "A look at the story behind Marvel Studios and the Marvel Cinematic Universe, featuring interviews and behind-the-scenes footage from all of the Marvel films, the Marvel One-Shots and \"Marvel's Agents of S.H.I.E.L.D.\"",
		"release_date": "2014-03-18",
		"characters": [
			{
				"actor": "Robert Downey Jr.",
				"character": "Himself / Tony Stark / Iron Man"
			},
			{
				"actor": "Chris Hemsworth",
				"character": "Himself / Thor"
			},
			{
				"actor": "Chris Evans",
				"character": "Himself / Steve Rogers / Captain America"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Himself / Bruce Banner / Hulk"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Herself"
			},
			{
				"actor": "Clark Gregg",
				"character": "Himself"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Himself"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Herself"
			},
			{
				"actor": "Jeremy Renner",
				"character": "Himself"
			}
		]
	},
	{
		"title": "Captain America: Civil War",
		"overview": "Following the events of Age of Ultron, the collective governments of the world pass an act designed to regulate all superhuman activity. This polarizes opinion amongst the Avengers, causing two factions to side with Iron Man or Captain America, which causes an epic battle between former allies.",
		"release_date": "2016-04-27",
		"characters": [
			{
				"actor": "Chris Evans",
				"character": "Steve Rogers / Captain America"
			},
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark / Iron Man"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow"
			},
			{
				"actor": "Don Cheadle",
				"character": "James \"Rhodey\" Rhodes / War Machine"
			},
			{
				"actor": "Jeremy Renner",
				"character": "Clint Barton / Hawkeye"
			}
		]
	},
	{
		"title": "Thor: Ragnarok",
		"overview": "Thor is imprisoned on the other side of the universe and finds himself in a race against time to get back to Asgard to stop Ragnarok, the destruction of his home-world and the end of Asgardian civilization, at the hands of an all-powerful new threat, the ruthless Hela.",
		"release_date": "2017-10-25",
		"characters": [
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Bruce Banner / Hulk"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow (archive footage / uncredited)"
			}
		]
	},
	{
		"title": "Avengers: Endgame",
		"overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
		"release_date": "2019-04-24",
		"characters": [
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
				"character": "Bruce Banner / Hulk"
			},
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow"
			},
			{
				"actor": "Jeremy Renner",
				"character": "Clint Barton / Hawkeye"
			},
			{
				"actor": "Don Cheadle",
				"character": "James Rhodes / War Machine"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Pepper Potts"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			}
		]
	},
	{
		"title": "Avengers: Infinity War",
		"overview": "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
		"release_date": "2018-04-25",
		"characters": [
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark / Iron Man"
			},
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Chris Evans",
				"character": "Steve Rogers / Captain America"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow"
			},
			{
				"actor": "Don Cheadle",
				"character": "James \"Rhodey\" Rhodes / War Machine"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Virginia \"Pepper\" Potts"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury (uncredited)"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Bruce Banner / The Hulk"
			}
		]
	},
	{
		"title": "Captain Marvel",
		"overview": "The story follows Carol Danvers as she becomes one of the universe’s most powerful heroes when Earth is caught in the middle of a galactic war between two alien races. Set in the 1990s, Captain Marvel is an all-new adventure from a previously unseen period in the history of the Marvel Cinematic Universe.",
		"release_date": "2019-03-06",
		"characters": [
			{
				"actor": "Samuel L. Jackson",
				"character": "Nick Fury"
			},
			{
				"actor": "Clark Gregg",
				"character": "Agent Phil Coulson"
			},
			{
				"actor": "Chris Evans",
				"character": "Steve Rogers / Captain America (uncredited)"
			},
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow (uncredited)"
			},
			{
				"actor": "Don Cheadle",
				"character": "James 'Rhodey' Rhodes / War Machine (uncredited)"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Bruce Banner / The Hulk (uncredited)"
			}
		]
	},
	{
		"title": "Spider-Man: Homecoming",
		"overview": "Following the events of Captain America: Civil War, Peter Parker, with the help of his mentor Tony Stark, tries to balance his life as an ordinary high school student in Queens, New York City, with fighting crime as his superhero alter ego Spider-Man as a new threat, the Vulture, emerges.",
		"release_date": "2017-07-05",
		"characters": [
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark / Iron Man"
			},
			{
				"actor": "Gwyneth Paltrow",
				"character": "Virginia \"Pepper\" Potts"
			},
			{
				"actor": "Chris Evans",
				"character": "Steve Rogers / Captain America"
			}
		]
	},
	{
		"title": "Team Thor",
		"overview": "Discover what Thor was up to during the events of Captain America: Civil War.",
		"release_date": "2016-08-28",
		"characters": [
			{
				"actor": "Chris Hemsworth",
				"character": "Thor Odinson"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Bruce Banner"
			}
		]
	},
	{
		"title": "Black Widow",
		"overview": "Natasha Romanoff, also known as Black Widow, confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises. Pursued by a force that will stop at nothing to bring her down, Natasha must deal with her history as a spy and the broken relationships left in her wake long before she became an Avenger.",
		"release_date": "2020-10-28",
		"characters": [
			{
				"actor": "Scarlett Johansson",
				"character": "Natasha Romanoff / Black Widow"
			},
			{
				"actor": "Robert Downey Jr.",
				"character": "Tony Stark / Iron Man"
			}
		]
	}
]
```
