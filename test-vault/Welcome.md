---
test: sdfsdf
some-list:
  - itemAa
  - itemBbddddd
  - a new item
tags:
  - another
  - onemoretagg
  - testtt
date: 2024-02-01
checkboxtest: true
datetime: 2024-02-01T13:24:00
number: 9
---
 #test #another #onemoretag

dfsdfsf   ffff fsdfdd

```data-edit
TABLE test, some-list, number, tags, date, checkboxtest, datetime
FROM #test
SORT file.name
```

```data-edittt
const data = dv.pages().map(p => [p.file.link, p.test, p.tags, p['some-list']]);
return {headers: ['file', 'test', 'tags', 'some-list'], values: data};
```


```dataview
TABLE test, file.etags as Tags
FROM #test
SORT file.ctime ASC
```

```dataviewjs
const data = dv.pages().map(p => [p.file.link, p.test, p.number]);
dv.table(['file', 'test', 'number'], data)
```
