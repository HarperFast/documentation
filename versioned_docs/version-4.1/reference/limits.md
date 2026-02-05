---
title: HarperDB Limits
---

# HarperDB Limits

This document outlines limitations of HarperDB.

## Schema Naming Restrictions

**Case Sensitivity**

HarperDB schema metadata (schema names, table names, and attribute/column names) are case sensitive. Meaning schemas, tables, and attributes can differ only by the case of their characters.

**Restrictions on Schema Metadata Names**

HarperDB schema metadata (schema names, table names, and attribute names) cannot contain the following UTF-8 characters:

```
/`¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ
```

Additionally, they cannot contain the first 31 non-printing characters. Spaces are allowed, but not recommended as best practice. The regular expression used to verify a name is valid is:

```
^[\x20-\x2E|\x30-\x5F|\x61-\x7E]*$
```

## Table Limitations

**Attribute Maximum**

HarperDB limits number of attributes to 10,000 per table.
