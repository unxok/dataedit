---
test: ddddd
some-list:
  - asdf
  - sdfsdfdddd
  - sdfsd
  - aasss
  - ddfdffffdf
tags:
  - anotherrrr
  - onemoretagg
  - testtt
  - test
date: 2024-02-01T00:00:00.000-08:00
checkboxtest: false
datetime: 2024-02-01T13:24:00.000-08:00
number: 9
dataedit-links:
  - "[[test noteee.md|test noteee]]"
  - "[[testt.md|testt]]"
  - "[[Welcome.md|Welcome]]"
---
## Dataedit

```dataedit
TABLE test, some-list, number, tags, date, checkboxtest, datetime, date
FROM #test
SORT file.name
```
## Dataview

```dataview
TABLE test, some-list, number, tags, date, checkboxtest, datetime, date
FROM #test
SORT file.name
```












```dataviewjs
const data = dv.pages().map(p => [p.file.link, p.test, p.number]);
dv.table(['file', 'test', 'number'], data)
```
