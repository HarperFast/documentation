---
title: Harper Limits
---

# Harper Limits

This document outlines limitations of Harper.

## Database Naming Restrictions

**Case Sensitivity**

Harper database metadata (database names, table names, and attribute/column names) are case sensitive. Meaning databases, tables, and attributes can differ only by the case of their characters.

**Restrictions on Database Metadata Names**

Harper database metadata (database names, table names, and attribute names) cannot contain the following UTF-8 characters:

```
/`¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ
```

Additionally, they cannot contain the first 31 non-printing characters. Spaces are allowed, but not recommended as best practice. The regular expression used to verify a name is valid is:

```
^[\x20-\x2E|\x30-\x5F|\x61-\x7E]*$
```

## Table Limitations

**Attribute Maximum**

Harper limits the number of total indexed attributes across tables (including the primary key of each table) to 10,000 per database.

## Primary Keys

The maximum length of a primary key is 1978 bytes or 659 characters (whichever is shortest).
