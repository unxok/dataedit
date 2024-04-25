import { Notice, Plugin } from "obsidian";

import React from "react";
import { createRoot } from "react-dom/client";

import { defaultSettings, TSettings } from "@/settings";
import { DataEditSettingsTab } from "@/settings-tab";
import { loadData } from "@/saveload";
import { PropertySuggester } from "@/components/Popover";

import App from "@/components/App";

/**
 * Loads the dependencies (plugins) that your plugin requires
 * @returns true if successful, false if fail
 */
export const loadDependencies = async () => {
	const DATAVIEW = "dataview";
	// @ts-ignore
	const plugins = app.plugins;
	if (!plugins.enabledPlugins.has(DATAVIEW)) {
		return false;
	}
	await plugins.loadPlugin(DATAVIEW);
	return true;
};

export default class DataEdit extends Plugin {
	settings: TSettings;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new DataEditSettingsTab(this.app, this));

		this.registerCodeBlock();
		// this doesn't work inside my react rendered table
		// this.registerEditorSuggest(new PropertySuggester(this.app, this));

		// app.workspace.onLayoutReady(async () => {
		// 	this.registerCodeBlock();
		// });

		this.addCommand({
			id: `insert`,
			name: `Insert My Plugin`,
			editorCallback: (e, _) => {
				// e.replaceSelection("```data-edit\n```\n");
			},
			callback: () => this.registerCodeBlock(),
		});
	}

	registerCodeBlock() {
		this.registerMarkdownCodeBlockProcessor("data-edit", (s, e, i) => {
			console.log("registered mcbp: ", s);
			console.log("ctx: ", i);
			e.empty();
			const root = createRoot(e);
			root.render(
				// <React.StrictMode>
				<App
					data={s}
					getSectionInfo={() => i.getSectionInfo(e)}
					settings={this.settings}
					app={this.app}
					plugin={this}
				/>,
				// </React.StrictMode>,
			);
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
