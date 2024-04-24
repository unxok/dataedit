---
test: hello asdjj
some-list:
  - itemAa
  - itemBb
  - itemCcd
  - s
  - s
  - sdddfdd
  - sdff
tags:
  - another
  - onemoretagg
  - test
date: 2024-02-01
checkboxtest: false
datetime: 2024-02-01T13:24:00
number: 0

---
 #test #another #onemoretag


```data-edit
TABLE test, some-list, number, tags, date, checkboxtest, datetime
FROM #test
SORT file.name
```

```data-edit
const data = dv.pages().map(p => [p.file.link, p.test, p.tags, p['some-list']]);
return {headers: ['file', 'test', 'tags', 'some-list'], values: data};
```


```dataview
TABLE test, file.etags as Tags
FROM #test
SORT file.ctime ASC
```

```dataviewjs
const data = dv.pages().map(p => [p.file.link, p.test]);
dv.table(['file', 'test'], data)
```
