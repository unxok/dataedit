---
test: testing testing 1234567899
some-list:
  - itemAa
  - itemBb
  - itemCc
tags:
  - another
  - onemoretagg
  - test
num: "2"

---
 #test #another #onemoretag


```data-edit
TABLE test, tags, some-list, num
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


sdfsdf
sldkf