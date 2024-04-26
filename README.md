# Obsidian Data Edit

_Transform your Dataview queries into <u>editable-in-place</u> tables!_

This is a plugin for the note-taking app [Obsidian](https://obsidian.md/)

This depends on the [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) plugin query frontmatter metadata. Please show the creators some love for all their hardwork!

> [!IMPORTANT]
> The [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) plugin <u>must</u> installed and enabled separately!

## Demo

Forgive the terrible quality😅

### Key features

-   Edit frontmatter properties and rename files directly in the table
-   Updates happen and are updated in the table very swiftly
-   Files from query are linked to the file and will show in graph view
-   Property type support
-   Auto suggest on text and multitext properties
-   Links and tags are clickable and editable

![demo gif](/dataedit-demo.gif)

## Usage

> [!CAUTION]
> This plugin is still being worked on and fleshed out. Therefore, it is not available to download from the obsidian community plugins menu.

Set your codeblock langauge to `dataedit`. Example:
````
```dataedit
TABLE foo
FROM #bar
```
````

The codeblock will accept a **_dataview query_** or a **_Javascript expression_** that returns an object with `headers` and `values` keys with arrays respectively.

### Example

#### Dataview Query

Most _(exceptions below)_ valid Dataview queries _should_ work (let me know if not!)

````sql
```dataedit
TABLE progress, category
FROM #tasks
SORT file.name
```
````

> [!CAUTION]
> Inline metadata may show in the table, but editing it will cause it to be added as a frontmatter property.
> I have no intention of supporting inline property edits, but if someone provides an easy and computationally cheap way to do it, I will look into it

> [!WARNING]
> The exceptions to the statement above are:
>
> -   You <u>cannot</u> use `WITHOUT ID`
> -   You <u>cannot</u> specify column aliases in the query (on roadmap)
> -   I haven't tried it yet, but I am pretty sure `GROUP BY` will <u>not</u> work

````sql
TABLE WITHOUT ID progress, category, file.link AS Name
FROM #tasks
SORT file.name

...this will NOT work
````

#### Javascript expression

-   You will have access to the dataview api through `dv` just like in a dataview js expression
-   Note that you still just use the `dataedit` code block language. The plugin will automatically detect if you have entered a dataview query or js expression
-   _Technically_ you don't have to use dataview here, but currently I rely on some data types produced by it so it won't work properly

````js
// surround with ```dataedit ... ``` like normal
const data = dv
	.pages("#tasks")
	.map((p) => [p.file.link, p.progress, p.category]);
return { headers: ["Name", "Progress", "Category"], values: data };
````

# Roadmap

-   [x] Support different property types
    -   [x] string
        -   [x] auto suggest
        -   [x] render and edit links
    -   [x] array (and tags)
        -   [ ] (seen in demo) bug with using suggest?
        -   [x] tags
        -   [x] render and edit links
        -   [x] auto suggest
        -   Note that this only works if you use tags as a frontmatter property
    -   [x] number
    -   [x] Checkbox
    -   [x] Date & Datetime
        -   [ ] Issue with not filling value from property. It does update though
    -   [x] Ability to rename file
-   [x] Links from query to frontmatter (to show in graph view, etc)
-   [ ] Switch to Vite
-   [ ] Config options (YAML in a query, JSON in js expression)
    -   [ ] Auto suggest-- boolean. default true
    -   [ ] Show type icons-- boolean. default true
    -   [ ] Links from query to frontmatter
        -   [ ] property name-- string. Default 'dataedit-links'. Leave blank to turn off this feature
    -   [ ] CSS classname-- string
    -   [ ] Column aliases-- an array
    -   [ ] Vertical alignment
        -   [ ] Single value-- applies to all cells
        -   [ ] Array-- applies to specific collumns
    -   [ ] Horizontal alignment
        -   [ ] Single value-- applies to all cells
        -   [ ] Array-- applies to specific collumns
-   [ ] Specify default config for codeblocks from plugin settings
-   [ ] Allow for extra config in each codeblock
    -   [ ] Add `---` to the end of the query where you can use yaml to specify config
    -   [ ] Add an extra key `config` to the returned object to specify in js expressions

# Contributing

Feel free to open an issue for improvements, bugs, questions, etc.

If you would like to contribute to the project, please fork the repo and make a pull request! Setting it up on your local machine is as simple as cloning the repo and running `npm install`. It comes with a test vault (`/test-vault`) which is where the code gets built to on `npm run build`.
