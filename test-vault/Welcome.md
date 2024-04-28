---
test: ""
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
date: 2001-02-01
checkboxtest: false
datetime: 2556-10-25T02:21
number: 123
dataedit-links:
  - "[[test noteee.md|test noteee]]"
  - "[[testt.md|testt]]"
  - "[[Welcome.md|Welcome]]"
cssclasses:
  - classA
  - classB
  - classC
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
