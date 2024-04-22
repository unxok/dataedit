import { Notice, Plugin } from "obsidian";

import React from "react";
import { createRoot } from "react-dom/client";

import { defaultSettings, TSettings } from "@/settings";
import { MyObsidianPluginSettingsTab } from "@/settings-tab";
import { loadData } from "@/saveload";

import App from "@/components/App";

export default class MyObsidianPlugin extends Plugin {
	settings: TSettings;
	dependenciesLoaded: boolean = false;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new MyObsidianPluginSettingsTab(this.app, this));

		app.workspace.onLayoutReady(async () => {
			this.dependenciesLoaded = await this.loadDependencies();
		});

		this.registerMarkdownCodeBlockProcessor(
			"my-obsidian-plugin",
			(s, e, i) => {
				console.log(s);
				e.empty();
				const root = createRoot(e);
				root.render(
					<React.StrictMode>
						<App
							data={s}
							getSectionInfo={() => i.getSectionInfo(e)}
							settings={this.settings}
							app={this.app}
							dependenciesLoaded={this.dependenciesLoaded}
						/>
					</React.StrictMode>,
				);
			},
		);

		this.addCommand({
			id: `insert`,
			name: `Insert My Plugin`,
			editorCallback: (e, _) => {
				e.replaceSelection("```my-obsidian-plugin\n```\n");
			},
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData(),
		);
	}

	/**
	 * Loads the dependencies (plugins) that your plugin requires
	 * @returns true if successful, false if fail
	 */
	async loadDependencies() {
		const noticeSpan = document.createElement("span");
		noticeSpan.innerHTML =
			'You must have <a href="/">Dataview</a> installed and enabled!';
		const docFrag = new DocumentFragment();
		docFrag.append(noticeSpan);
		const DATAVIEW = "dataview";
		// @ts-ignore
		const plugins = app.plugins;
		if (!plugins.enabledPlugins.has(DATAVIEW)) {
			new Notice(docFrag);
			return false;
		}
		await plugins.loadPlugin("dataview");

		return true;
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
