> [!CAUTION]
> This plugin has been abandoned. Being so tightly coupled with Dataview restriced a lot of what I wanted to accomplish and I lost steam.
> Also, we have the Bases core-plugin now, so you shouldn't really need this plugin anymore.


# Obsidian Dataedit📝

Transform Your Dataview queries into editable tables ✨

This is an Obsidian plugin that turns your static [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) queries into dynamic, editable tables. Edit data right where you see it, without needing to leave your current view.

💌 Support the Project: I humbly appreciate any support you would like to give me to keep updates brewing! *However*, please consider [supporting blacksmithgu](https://github.com/blacksmithgu/obsidian-dataview/tree/master?tab=readme-ov-file#support) first and foremost for all their hardwork which makes this plugin possible.

<a href="https://www.buymeacoffee.com/unxok" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/arial-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## TOC
- [Join the beta](#join-the-beta-)
- [Demo](#demo)
- [Usage](#usage)
- [Customization](#customization)
- [Roadmap](#roadmap)
- [Releases](#releases)

## Dependencies

This plugin leans heavily on the mighty [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) plugin to make querying note metadata possible. Huge shoutout to [blacksmithgu](https://github.com/blacksmithgu) (and [other contributers](https://github.com/blacksmithgu/obsidian-dataview/graphs/contributors)) for their outstanding work. This would not be possible without them!

## What about Datacore?
The development of [Datacore](https://github.com/blacksmithgu/datacore), another brilliant creation by blacksmithgu, will fulfill most needs to use this plugin. Datacore promises similar features ***along with*** an enhanced query engine. However, it's not ready for the public yet—created [2 years ago](https://github.com/blacksmithgu/datacore/commits/master/README.md) and with no recent roadmap updates (last checked [9 months ago](https://github.com/blacksmithgu/datacore/commits/master/ROADMAP.md)).

So, why wait? This plugin is here to fill that gap, bringing you the editing capabilities today!

# Join the Beta 🚀
We're Officially Beta Testing!
Before this plugin hits the Obsidian community page, I’m hoping for some brave souls to dive in, test it out, and help me spot bugs and share your ideas for new features.

## How to Get Involved
1. Direct Install: Grab the plugin straight from the [release](https://github.com/unxok/dataedit/releases)
2. BRAT Plugin: Or install it using the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) by TfTHacker for a quick and easy install.

## Found a Bug? Got a Feature Idea?
Don’t be shy! Open an issue on GitHub for any bugs 🐞, feature suggestions 💡, or questions ❓ you might have. Your feedback is valuable!

Thank you!!

# Demo🎥

## Key features🌟

-   **Instant Edits:** Tweak frontmatter properties and rename files right from your table. Changes are swift and sync in real-time!
-   **Connected Files:** All files in your query are linked to the current file and visible in the graph view. (can be turned off)
-   **Type Support:** Handles various property types smoothly.
-   **Auto Suggestions:** Get auto-suggestions for text and multitext properties.
-   **Interactive Elements:** Click and edit links and tags directly in the table.
-   Highly Configurable: Tailor everything to your liking. Dive into the [Customization](https://github.com/unxok/dataedit/edit/main/README.md#customization) section to learn more.

![demo gif](gifs/demo.gif)

# Usage

> [!IMPORTANT]
> The [Dataview](https://github.com/blacksmithgu/obsidian-dataview/tree/master) plugin <u>must</u> installed and enabled separately!

Set your codeblock language to `dataedit`

````
```dataedit
TABLE foo
FROM #bar
```
````

The codeblock will accept a **_dataview query_** or a **_Javascript expression_** that returns an object with `headers` and `values` keys with arrays respectively.

## Dataview Query

Most _(exceptions below)_ valid Dataview queries _should_ work (let me know if not!)

> [!CAUTION]
> Inline metadata may show in the table, but editing it will cause it to be added as a frontmatter property (support coming soon).

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

## Javascript expression

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
    -   <s>bundle size at ~1.1mb :( Pretty sure this is in part due to esbuild and it not minifying and/or bundling as good as Vite</s>
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
-   [ ] Improve autosuggestions
	-   [ ] Once a character is entered, only show suggestions starting with what has been typed so far
 	-   [ ] Rewrite suggest component from scratch
  		- The class imlementation from Obsidian has issues when used in Radix dialogs since the suggest element is rendered to the document body.
			- Idea is to use a portal wrapper to allow it to be rendered to a custom element
	-   [ ] detect wikilinks and suggest from files

# Releases

## 0.0.3 (TBD upcoming)

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
