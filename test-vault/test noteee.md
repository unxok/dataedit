---
test2: ddd
test: "#another value"
number: 24
some-list:
  - cats
  - dogs
  - "![[demo.gif|demo.gif]]"
tags: []
date: 
datetime: 1970-01-01T08:00
---
#test



```dataedit
const data = dv.pages().map(p => [p.file.link, p.test, p.tags, p['some-list']]);
return {headers: ['file', 'test', 'tags', 'some-list'], values: data};
```