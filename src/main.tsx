import { Notice, Plugin } from "obsidian";
import React from "react";
import { createRoot } from "react-dom/client";
import { DataEditSettingsTab } from "@/settings-tab";
// import { PropertySuggester } from "@/components/Popover";

import { App } from "@/components/App";
import {
	BlockConfigSchema,
	PluginSettingsSchema,
	defaultPluginSettings,
} from "./components/PluginSettings";
import { addNewKeyValues } from "./lib/utils";
import { z } from "zod";

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
	settings: z.infer<typeof PluginSettingsSchema>;

	async onExternalSettingsChange() {
		// console.log("settings were changed");
		await this.loadSettings();
	}

	async onload(): Promise<void> {
		await this.loadSettings();
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
					// settings={this.settings}
					// app={this.app}
					plugin={this}
					ctx={ctx}
				/>,
				// </React.StrictMode>,
			);
		});
	}

	async updateSettings(newSettings: z.infer<typeof PluginSettingsSchema>) {
		await this.saveData(newSettings);
		this.settings = newSettings;
		// console.log("settings updated: ", newSettings);
		return newSettings;
	}

	async updateBlockConfig(id: string, s: z.infer<typeof BlockConfigSchema>) {
		if (!this?.settings) {
			await this.loadSettings();
		}
		const copySettings = { ...this.settings };
		copySettings.blockConfigs[id || "default"] = s;
		await this.updateSettings(copySettings);
		return copySettings;
	}

	async loadSettings() {
		const savedSettings: z.infer<typeof PluginSettingsSchema> =
			await this.loadData();
		const modifiedSavedSettings: typeof savedSettings = addNewKeyValues(
			savedSettings,
			defaultPluginSettings,
		);
		const parsed = PluginSettingsSchema.safeParse(modifiedSavedSettings);
		console.log(parsed);
		if (!parsed.success) {
			new Notice("Invalid settings detected. Reverting to default");
			return await this.updateSettings(defaultPluginSettings);
		}
		this.settings = modifiedSavedSettings;
		return modifiedSavedSettings;
	}
}
