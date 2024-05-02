---
some-list:
  - eggs
  - lettuce
  - tomatos
  - ""
tags:
  - anotherrrrrr
  - onemoretagg
  - testtt
  - test
checkboxtest: true
datetime: 2005-02-02T08:20
number: 125
dataedit-links:
  - "![[demo.gif|demo.gif]]"
  - "[[Welcomeee.md|Welcomeee]]"
  - "[[test noteee.md|test noteee]]"
  - "[[new file name.md|new file name]]"
cssclasses:
  - classA
  - classB
  - classC
test: "![[demo.gif|demo.gif]]"
date: 1970-01-01
---
```dataedit
TABLE WITHOUT ID test, file.link, some-list, number, tags, date, checkboxtest, datetime
FROM #test
SORT file.name DESC
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
