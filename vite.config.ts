import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import builtins from "builtin-modules";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				format: "cjs",
				file: "main.js",
				exports: "default",
			},
			external: [
				"obsidian",
				"electron",
				"@codemirror/autocomplete",
				"@codemirror/closebrackets",
				"@codemirror/collab",
				"@codemirror/commands",
				"@codemirror/comment",
				"@codemirror/fold",
				"@codemirror/gutter",
				"@codemirror/highlight",
				"@codemirror/history",
				"@codemirror/language",
				"@codemirror/lint",
				"@codemirror/matchbrackets",
				"@codemirror/panel",
				"@codemirror/rangeset",
				"@codemirror/rectangular-selection",
				"@codemirror/search",
				"@codemirror/state",
				"@codemirror/stream-parser",
				"@codemirror/text",
				"@codemirror/tooltip",
				"@codemirror/view",
				...builtins,
			],
		},
	},
});
