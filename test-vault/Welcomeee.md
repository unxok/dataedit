---
test: dddffddd *sdf* ww
text: asdfasdf
obj:
  key: dd
  anotherKey: anotherValue
json:
  key: asdlff
multitext:
  - asdffff
num: 4566
aliases:
  - asdeeffe
  - anotheralias
dotnotation: "123"
category: 
tags:
  - onemoretagg
  - test
bool: true
date: 5550-11-06
datetime: 2302-06-19T02:08
embed: "![[demo.gif|demo.gif]]"
---


![[demo.gif]]

inlineProp:: 551

[[]]

## Editing inline fields
An inline field can be of two types:
1. Entire line ^f3abc4
	- Regex: `/^\S+::[ ]*\S+/gm`
2. Wrapped with `()` or `[]`
	- Regex: `/[\[\(]([^\n\r\(\[]*)::[ ]*([^\)\]\n\r]*)[\]\)]/gm`
In both cases, they can either be a string or an array. ^c42732
- if an array, that means that the field is declared multiple times in a file


To find inline fields:
1. Given a line, trimmed of whitespace
2. Parse every line for a line or wrapped inline field
3. Get key and value
	- split on `/::(.+)` and trim ^29f7b6
4. add to an array
To edit a field:
- If value from dataview was an array
	1. Find field-value pair where the value matches the old value before editing
	2. Replace value in that line
- If value from dataview was a string
	1. Replace value in that line
1. Modify that line in file with new line content

```python
def func(x):
	print('hello ' + x)
# a comment
func('world')
```

# h2
- a list
- asdf
[[Welcomeee#^f3abc4]]

[external](https://example.com)


TODO next
- [ ] Add rest of settings to block config modal
	- [x] auto complete
	- [x] lock editing
	- [x] page size
	- [x] list item prefix
	- [x] render markdown
- [ ] Create other toolbar items for other settings if applicable
	- [ ] Export options
		- [ ] CSV
		- [ ] JSON
		- [ ] HTML
		- [ ] custom delimiter
- [ ] Add action buttons in config
	- [ ] Export (JSON)
	- [ ] Import (JSON)
	- [ ] Reset to default
- [ ] Create customizable toolbar
- [ ] prevent duplicate ids from being used?

[asdf](https://)

TODO Add keydown for enter and escape for all inputs
- [ ] string
- [ ] number
- [ ] array
- [ ] datetime
- [ ] boolean

```dataedit
TABLE tags, num, bool
ID rotating-package
```



[[Welcomeee^]]


```dataedit
const data = dv.pages().map(p => {
  return [p.file.link, p?.test]
});
const headers = ['file', 'alias'];
dv.table(headers, data, {
  hideFileLink: true,
  aliases: {
    alias: 'test'
  }
})
ID asldkjflsdkjf
```

| asldkfj | asldfkjl                |
| ------- | ----------------------- |
| somers  | asldkfj *df*    alskdfj |
| sdd     | # saldkfj               |
|         |                         |
