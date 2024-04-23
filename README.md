# Obsidian Data Edit

This is a plugin for the note-taking app [Obsidian](https://obsidian.md/) which creates a custom code block syntax to generate a Kanban board which is interconnected with the properties (metadata/frontmatter) of the notes in your vault.

This depends on the [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) and [MetaEdit](https://github.com/chhoumann/MetaEdit) plugins to achive the functionality of quickly and efficiently reading and updating metadata. Please show them some love for all their hardwork!

## Usage

> [!WARNING]
> This plugin is still being worked on and fleshed out. Therefore, it is not available to download from the obsidian community plugins menu.

Set your codeblock langauge to `data-edit`

The configuration will accept a **_dataview query_** or a Javascript expression that returns an object with `headers` and `values` keys with arrays respectively.

### Example

#### Dataview Query

Any valid Dataview query _should_ work (let me know if not!)

````sql
```data-edit
TABLE progress, category
FROM #tasks
SORT file.name
```
````

> [!WARNING]
> The exception to the statement above is you <u>must</u> include `file.link` whether naturally (without doing anything extra) or by adding it as a column

````sql
```data-edit
TABLE WITHOUT ID progress, category, file.link AS Name
FROM #tasks
SORT file.name
```
````

````js
```data-edit
const data = dv
	.pages("#tasks")
	.map((p) => [p.file.link, p.progress, p.category]);
return { headers: ["Name", "Progress", "Category"], values: data };
```;
````

# Demo

See it in action!

Some things you might notice:

-   tables (that you aren't currently editing) update quite a bit faster than dataview, (although that might be a setting in dataview, I forget lol)
-   it uses debounce so as to not update the metadata after every single keystroke
-   They are unstyled tables

**Note:** This is very much a WIP and I have spent 2 days on it so far
![demo](./demo-data-edit.gif)

# Planned features

-   [ ] allow extra config for className and `autoprop` from MetaEdit
    -   [ ] Add `---` to the end of the query where you can use yaml to specify config
    -   [ ] Add an extra key `config` to the returned object to specify in js expressions
-   [ ] Support different property types
    -   [x] string
    -   [x] array (and tags)
        -   Note that this only works if you use tags as a frontmatter property
    -   [ ] number
    -   [ ] Checkbox
    -   [ ] Date, Date & time (are these just strings that are validated? Haven't checked yet)

# Contributing

Feel free to open an issue for improvements, bugs, questions, etc.

If you would like to contribute to the project, please fork the repo and make a pull request! Setting it up on your local machine is as simple as cloning the repo and running `npm install`. It comes with a test vault (`/test-vault`) which is where the code gets built to on `npm run build`.

# Issues I need to open but am too tired and it's 2am

-   [x] flickering on file changes outside of the editable table
    -   Fixed, I was doing weirdness with trying to force rerenders prior and that is no longer needed
-   [ ] can't seem to get table width sized right
-   [x] dataviewjs blocks (literally from dataview) seem broken now and I don't know why
    -   Looks good now
-   Using column aliases in dataview query causes property to not get updated
-   Using a different header name then the property name in js expression causes property to not get updated
