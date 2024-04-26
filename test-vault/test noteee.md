---
test2: ddd
test: ""
number: 2
some-list:
  - asdrf
  - asdf
tags: []
date: 
datetime: 
---
#test



```dataedit
const data = dv.pages().map(p => [p.file.link, p.test, p.tags, p['some-list']]);
return {headers: ['file', 'test', 'tags', 'some-list'], values: data};
```