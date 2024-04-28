---
test2: ddd
test: ""
number: 22
some-list:
  - asdrf
  - asdrf
tags: []
date: 
datetime: 
---
#test



```dataedit
const data = dv.pages().map(p => [p.file.link, p.test, p.tags, p['some-list']]);
return {headers: ['file', 'test', 'tags', 'some-list'], values: data};
```