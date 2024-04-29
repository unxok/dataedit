---
test2: ddd
test: asdfasdfasdfddddd
number: 24
some-list:
  - ddfdffffdf
  - asdrf
tags: []
date: 
datetime: 1970-01-01T08:00
---
#test



```dataedit
const data = dv.pages().map(p => [p.file.link, p.test, p.tags, p['some-list']]);
return {headers: ['file', 'test', 'tags', 'some-list'], values: data};
```