# Obsidian Dataedit

_Transform your Dataview queries into <u>editable-in-place</u> tables!_

<a href="https://www.buymeacoffee.com/unxok" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/arial-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

This is a plugin for the note-taking app [Obsidian](https://obsidian.md/)

This depends on the [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) plugin to query frontmatter metadata. This plugin would not be possible without Dataview, so please show the creators some love for all their hardwork!

> [!NOTE]
>
> ### A special note about Datacore
>
> The existence of the [Datacore](https://github.com/blacksmithgu/datacore) plugin, made by [blacksmithgu](https://github.com/blacksmithgu) (creator of Dataview) may <u>make this plugin irrelevent</u>, as it aims to achieve (likely) very similar functionality that this plugin implements, along with creating a more optimized query engine.
>
> _However_, The Datacore plugin was [created 2 years](https://github.com/blacksmithgu/datacore/commits/master/README.md) ago, is not yet usuable for the public, and has no release date set. So, I made this to get the editing functionality _now_ without having to wait for a release from Datacore.

## Beta

Officially in beta!

Before I attempt to get this plugin on the community plugins page, I would love if I could get some people to try it out first so I can find some issues that may not be obvious to me, as well as get some feature requests I may want to implement beforehand.

You can join the beta now by installing the plugin directly from the repo or by using the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) by TfTHacker

Please an open an issue if needed for bugs, feature requests, and questions.

Thank you!!

## Demo

### Key features

-   Edit frontmatter properties and rename files directly in the table
-   Updates happen and are updated in the table very swiftly
-   Files from query are linked to the file and will show in graph view
-   Property type support
-   Auto suggest on text and multitext properties
-   Links and tags are clickable and editable
-   **_Highly configurable_** (see [Customization](https://github.com/unxok/dataedit/edit/main/README.md#customization) section below)

![demo gif](gifs/demo.gif)

## Usage

> [!IMPORTANT]
> The [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) plugin <u>must</u> installed and enabled separately!

Set your codeblock langauge to `dataedit`

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

> [!CAUTION]
> Inline metadata may show in the table, but editing it will cause it to be added as a frontmatter property.
> I have no intention of supporting inline property edits, but if someone has an easy and computationally cheap way to do it, I will look into it

````sql
```dataedit
TABLE progress, category
FROM #tasks
SORT file.name
```
````

> [!WARNING]
> The exceptions to the statement above are:
>
> -   You <u>must</u> include the note link as one of the columns.
>     -   the 'File' column is included by default, but if you use `TABLE WITHOUT ID`, then you <u>must</u> include `file.link`.
> -   You <u>cannot</u> specify column aliases in the query (you can set up aliases in this plugin or block settings though)
> -   I haven't tried it yet, but I am pretty sure `GROUP BY` will <u>not</u> work (on roadmap)

#### Javascript expression

-   You will have access to the dataview api through `dv` just like in a dataview js expression
    -   Dataview [render methods](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#render) will not work properly, so don't use them.
-   You must return `{headers: string[], values: string[][]}`
-   Note that you still just use the `dataedit` code block language. The plugin will automatically detect if you have entered a dataview query or js expression
-   _Technically_ you don't have to use dataview here, but currently I rely on some data types produced by it so it won't work properly

````js
// surround with ```dataedit <newline> ``` like normal
const data = dv
	.pages("#tasks")
	.map((p) => [p.file.link, p.progress, p.category]);
return { headers: ["Name", "Progress", "Category"], values: data };
````

# Customization

You can customize the way tables look and behave through either the plugin settings and or an individual code blocks config.

## Plugin settings

These settings will apply to all Dataedit tables unless that code block has its own config that conflicts with them.

![plugin settings demo](/gifs/plugin-settings-demo.gif)

## Block config

This configuration will apply _only_ to the table produced from that codeblock.

-   If _no_ config is provided, the plugin settings will apply
-   If a config _is_ provided, it will overwrite any plugin-level settings
-   You can provide a config in a block by manually typing it in YAML format (not recommended) or by clicking the gear icon in the bottom right of the block once rendered

![block config demo](/gifs/block-config-demo.gif)

## Implementation details

The following is a typescript definition of the expected shape of the provided config after being parsed to YAML. This is validated by [zod](https://zod.dev) and will revert to the plugin settings if an invalid config is provided.

### Zod schema

<details><summary>Show code</summary>

```ts
const StartCenterEnd = z.union([
	z.literal("start"),
	z.literal("center"),
	z.literal("end"),
]);

const TopMiddleBottom = z.union([
	z.literal("top"),
	z.literal("middle"),
	z.literal("bottom"),
]);

const Alignment = z.object({
	vertical: TopMiddleBottom,
	horizontal: StartCenterEnd,
	enabled: z.boolean(),
});

export const SettingsSchema = z.object({
	autoSuggest: z.boolean(),
	renderMarkdown: z.boolean(),
	showNumberButtons: z.boolean(),
	showTypeIcons: z.boolean(),
	emptyValueDisplay: z.string(),
	queryLinksPropertyName: z.string(),
	cssClassName: z.string(),
	columnAliases: z.array(z.array(z.string(), z.string())),
	verticalAlignment: TopMiddleBottom,
	horizontalAlignment: StartCenterEnd,
	alignmentByType: z.object({
		text: Alignment,
		list: Alignment,
		number: Alignment,
		checkbox: Alignment,
		date: Alignment,
		datetime: Alignment,
	}),
});
```

</details>

### Default settings

Below are what the default plugin settings are when you first install the plugin.

<details>
<summary>Show code</summary>

```ts
{
	autoSuggest: true,
    renderMarkdown: true,
	showNumberButtons: true,
	showTypeIcons: true,
	emptyValueDisplay: "-",
	queryLinksPropertyName: "dataedit-links",
	cssClassName: "",
	columnAliases: [["thisColumn", "showThisAlias"]],
	verticalAlignment: "top",
	horizontalAlignment: "start",
	alignmentByType: {
		text: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		list: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		number: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		checkbox: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		date: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		datetime: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
	},
};
```

</details>

# Roadmap

Items will be moved to the appropriate release once I start working on them or have them planned out

-   [ ] Switch to Vite
    -   ~~bundle size at ~1.1mb :( Pretty sure this is in part due to esbuild and it not minifying and/or bundling as good as Vite~~
        -   Yup, esbuild didn't have minify on lol so I might not do this
-   [ ] Allow `GROUP BY` and JS expression grouping
-   [ ] Alternative views to table
    -   [ ] cards
        -   [ ] custom rows and columns count
    -   [ ] kanban
        -   [ ] custom columns
            -   [ ] property name-- string (will display alias if set in settings/config)
            -   [ ] show count-- boolean
            -   [ ] color-- string (valid css color)
        -   [ ] collapsible columns (persisted state)
        -   [ ] custom swim lanes? (may or may not do this)
-   [ ] Live preview markdown editing
-   [ ] Date display options in settings and config

# Releases

## 0.1.0 (TBD)

Major rework!

I thought about it a lot and decided I wanted to pretty much rework how a lot of things were currently set up after getting it to this point. It should be a bit less of a mess with this one.

-   [x] Allow aliases in Dataview query
    -   You no longer need to use Dataedit's settings to set aliases. Just specifiy them like normal in Dataview ('TABLE prop AS alias...')
-   [x] Allow no file link being displayed
-   [x] You can now do 'TABLE WITHOUT ID...' _without_ including `file.link`
    -   Dataedit will silently add `, file.link` to your query but will hide the column from view
-   [x] Dataviewjs syntax is now more closely supported
    -   Dataedit blocks hijack `dv.table()` and `dv.markdownTable()` so they will render an editable table
-   [x] Nested property support
    -   If you use YAML objects in frontmatter, that will update correctly
-   [x] ~~Grouped results support?~~ This might not make sense...
-   [x] Inline property support
-   [x] Date/Datetime properties now render according to relevant Dataview settings
-   [x] Image embeds
-   [x] Pagination
-   [ ] Better autocomplete
    -   [x] Existing property values
    -   [x] keyboard controls
    -   [x] file links
    -   [x] heading links
    -   [ ] block links
        -   [ ] This is more difficult than I thought; may not make it in 0.1.0
-   [ ] Block toolbar
    -   You can now choose items to show in a toolbar near your Dataedit block for quick access to common settings and tools for Dataedit
-   [ ] Settings overhaul
    -   [ ] Block config
        -   Previously, Dataedit would write block configs directly to their own block in your markdown note. I disliked this approach. Instead, you just add `ID some-id` as the last line of your query and click the button like normal to change block config. This config is saved to Dataedit's settings file. This makes block id's reusable across different Dataedit blocks so you can easily reuse settings.
        -   [ ] Lock editing- Allows links and tags to be clickable
        -   [ ] Export current results
            -   [ ] csv
            -   [ ] markdown
            -   [ ] custom delim
        -   [ ] Lists
            -   [ ] List style type (enter text. pro tip use Iconize)
            -   [ ] Orientation
                -   [ ] Vertical
                -   [ ] Horizontal
        -   [ ] Render markdown or plaintext
        -   [ ] Allow embed img to grow to natural size
        -   [ ] Alignment- vertical and horizontal
            -   [ ] Whole table
            -   [ ] Columns
            -   [ ] Rows
            -   [ ] What to do in conflicts?
        -   [ ] Resize
            -   [ ] all columns
            -   [ ] all rows
            -   [ ] specific column
            -   [ ] specific row
        -   [ ] Show icons
            -   [ ] Add examples for using the Iconize plugin to do custom icons
        -   [ ] Show number buttons
        -   [ ] Show autocomplete
        -   [ ] pagination
        -   [ ] query links- off by default
            -   [ ] Check if another config in the same file uses the property a user tries setting this block's config to (and reject if so)
        -   [ ] inline property support?
            -   I may not make this a toggle because I found a cheap way to check if a property is inline before doing the work of reading and modifying the entire contents of a note
        -   [ ] Configurable column value presets?
    -   [ ] Plugin settings
        -   Previously, after changing plugin settings you would need to start editing an already rendered Dataedit block and click away to force a rerender with the new plugin settings. This is no longer needed
        -   Also previously, plugin settings were exactly the same as block config. Instead, they are not completely different but you _can_ still set default settings for block configs from within the plugin settings (see default block config)
        -   [ ] Nested property format
            -   I can't easily tell if JSON vs YAML is used in a nested property because it's always exposed as JSON. This will allow the output of a Dataedit cell to cause JSON or YAML to be outputted to the property value
        -   [ ] Default block config- Applies settings to all Dataedit blocks that do _not_ have an id set
        -   [ ] Allow JS- Default off?
            -   Because there isn't a separate codeblock language like `dataedit-js` (which I don't really want to do), you are at risk of accidentally running JS in your Dataedit block if you don't specify 'TABLE' (not case sensitive). Maybe I should do a separate block language?
        -   [ ] Read from dataview for null value display

## ~~0.0.3~~ (cancelled)

-   [ ] select cols to show totals for
-   [ ] nested property support
-   [ ] pagination (set default limit per page in config)

## 0.0.2 (TBD upcoming)

-   [x] Render markdown
    -   Render markdown as html in text and multitext cells
    -   Will not be live-preview editable (working on that for another release)
    -   Links and tags are not clickable (unless a link is the only thing in the
    -   cell)
    -   Basic support for image embed via markdown embed link
        -   I'm not super happy with the way it sizes the image, so I will continue to work on this
    -   Can turn off feature in plugin settings and/or codeblock config
-   [x] Fixed case sensitivity issue
    -   Previously, I incorrectly assumed that `TABLE` in a Dataview query must always be capitalized. Now it works with any case as long as `TABLE` (or `tAblE` or whatever) is at the start of the query
-   [ ] Inline properties
    -   Inline properties can now be updated from Dataedit tables
    -   Can be turned on in plugin settings and/or codeblock config
        -   Default **OFF** due to it having potential performance impacts

## [0.0.1](https://github.com/unxok/dataedit/releases/tag/0.0.1) (2024-05-30)

Initial beta release!

-   [x] Support different property types
    -   [x] string
        -   [x] auto suggest
        -   [x] render and edit links
    -   [x] array (and tags)
        -   [x] tags
            -   Note that this only works if you use tags as a frontmatter property
        -   [x] render and edit links
        -   [x] auto suggest
    -   [x] number
    -   [x] Checkbox
    -   [x] Date & Datetime
        -   [x] Issue with not filling value from property. It does update though
    -   [x] Ability to rename file
-   [x] Links from query to frontmatter (to show in graph view, etc)
-   [x] Config options
    -   [x] Auto suggest-- boolean. default true
    -   [x] Show type icons-- boolean. default true
    -   [x] Links from query to frontmatter
        -   [x] property name-- string. Default 'dataedit-links'. Leave blank to turn off this feature
    -   [x] CSS classname-- string
    -   [x] Column aliases-- an array
    -   [x] Vertical alignment-- top, middle, bottom
        -   Single value-- applies to all cells
    -   [x] Horizontal alignment-- left (start), center, right (end)
        -   Single value-- applies to all cells
-   ~~[ ] Specify default config for codeblocks from plugin settings~~
    -   Codeblocks will inherit from plugin settings unless overriden specifically
-   [x] Allow for extra config in each codeblock
    -   [x] Add `---` to the end of the query where you can use yaml to specify config
    -   [x] Setting button to add/edit config from a dialog rather than manually in code block (will automatically update code block and add yaml config)
-   [x] Allow for `TABLE WITHOUT ID` as long as `file.link` column is included
-   [x] Reset plugin settings to default button

# Contributing

Feel free to open an issue for improvements, bugs, questions, etc.

If you would like to contribute to the project, please fork the repo and make a pull request! Setting it up on your local machine is as simple as cloning the repo and running `npm install`. It comes with a test vault (`/test-vault`) which is where the code gets built to on `npm run build`.
