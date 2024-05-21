import { Notice, Plugin } from "obsidian";
import React from "react";
import { createRoot } from "react-dom/client";
import { DataEditSettingsTab } from "@/settings-tab";
// import { PropertySuggester } from "@/components/Popover";

import { App } from "@/components/App";
import {
	Settings,
	SettingsSchema,
	defaultSettings,
} from "./components/PluginSettings";
import { addNewKeyValues } from "./lib/utils";

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
	settings: Settings;

	async onExternalSettingsChange() {
		console.log("settings were changed");
		await this.loadSettings();
	}

	async onload(): Promise<void> {
		this.settings = await this.loadData();
		this.addSettingTab(new DataEditSettingsTab(this.app, this));

		this.registerCodeBlock();

		this.addCommand({
			id: `insert`,
			name: `Insert My Plugin`,
			editorCallback: (e, _) => {
				// e.replaceSelection("```dataedit\n```\n");
			},
			callback: () => this.registerCodeBlock(),
		});
	}

	registerCodeBlock() {
		this.registerMarkdownCodeBlockProcessor("dataedit", (s, e, ctx) => {
			// console.log("registered mcbp: ", s);
			// console.log("ctx: ", ctx);
			e.empty();
			const root = createRoot(e);
			root.render(
				// <React.StrictMode>
				<App
					data={s}
					getSectionInfo={() => ctx.getSectionInfo(e)}
					settings={this.settings}
					// app={this.app}
					plugin={this}
					ctx={ctx}
				/>,
				// </React.StrictMode>,
			);
		});
	}

	async updateSettings(newSettings: Settings) {
		await this.saveData(newSettings);
		this.settings = newSettings;
	}

	async loadSettings() {
		const savedSettings = await this.loadData();
		const potentialSettings = addNewKeyValues(
			savedSettings,
			defaultSettings,
		);
		const potentialParsed = SettingsSchema.safeParse(potentialSettings);
		if (!potentialParsed.success) new Notice("Invalid settings detected");
		this.saveData(potentialParsed.data);
	}
}
