---
some-list:
  - aasss
  - sdfsdfdddd
  - sdfsd
  - aasss
  - ddfdffffdf
tags:
  - anotherrrr
  - onemoretagg
  - testtt
  - test
checkboxtest: false
datetime: 2005-02-01T00:20:00
number: 123
dataedit-links:
  - "[[test noteee.md|test noteee]]"
  - "[[testt.md|testt]]"
  - "[[Welcome.md|Welcome]]"
cssclasses:
  - classA
  - classB
  - classC
test: 
date: 2/2/2004
---
## Dataedit

```dataedit
TABLE WITHOUT ID test, some-list, number, tags, date, checkboxtest, datetime, date, file.link
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
