---
some-list:
  - asdrf
  - sdfsdfdddd
  - sdfsd
  - aasss
  - ddfdffffdf
tags:
  - anotherrrr
  - onemoretagg
  - testtt
  - test
checkboxtest: true
datetime: 2005-02-01T16:20
number: 123
dataedit-links:
  - "[[new file name.md|new file name]]"
  - "[[test noteee.md|test noteee]]"
  - "[[Welcome.md|Welcome]]"
cssclasses:
  - classA
  - classB
  - classC
test: new value
date: 1970-01-01
---
## Dataedit demo
- [x] Edit in place (updates after press enter or click away)
- [x] fast, no-flicker updates
- [ ] highly customizable
	- [ ] plugin (global) settings and individual block settings

```dataedit
TABLE WITHOUT ID test, file.link, some-list, number, tags, date, checkboxtest, datetime
FROM #test
SORT file.name
---
autoSuggest: true
showNumberButtons: true
showTypeIcons: true
emptyValueDisplay: "-"
queryLinksPropertyName: dataedit-links
cssClassName: ""
columnAliases:
  - - thisColumn
    - showThisAlias
verticalAlignment: top
horizontalAlignment: start
alignmentByType:
  text:
    vertical: top
    horizontal: start
    enabled: false
  list:
    vertical: top
    horizontal: start
    enabled: false
  number:
    vertical: top
    horizontal: start
    enabled: false
  checkbox:
    vertical: top
    horizontal: start
    enabled: false
  date:
    vertical: top
    horizontal: start
    enabled: false
  datetime:
    vertical: top
    horizontal: start
    enabled: false
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
