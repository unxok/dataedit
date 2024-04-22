const fs = require("fs");
const postcss = require("postcss");

const prefixer = require("postcss-prefix-selector");

// css to be processed
const css = fs.readFileSync(
	"test-vault/.obsidian/plugins/my-obsidian-plugin/styles.css",
	"utf8",
);

const out = postcss()
	.use(
		prefixer({
			prefix: "#twcss ",
			transform: function (
				prefix,
				selector,
				prefixedSelector,
				filePath,
				rule,
			) {
				return prefixedSelector;
			},
		}),
	)
	.process(css).css;

fs.writeFileSync(
	"test-vault/.obsidian/plugins/my-obsidian-plugin/styles.css",
	out,
);
