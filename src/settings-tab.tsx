import React from "react";
import { App, PluginSettingTab } from "obsidian";
import DataEdit from "@/main";
import { Root, createRoot } from "react-dom/client";
import { PluginSettings } from "./components/PluginSettings";

export class DataEditSettingsTab extends PluginSettingTab {
	plugin: DataEdit;
	root: Root;

	constructor(app: App, plugin: DataEdit) {
		super(app, plugin);
		this.plugin = plugin;
		this.containerEl.empty();
		this.root = createRoot(this.containerEl);
	}

	display(): void {
		this.root.render(
			<div className="twcss">
				<PluginSettings plugin={this.plugin} />
			</div>,
		);
	}

	// display(): void {
	// 	this.containerEl.empty();
	// 	this.containerEl.createEl("h2", {
	// 		text: "My Plugin Settings",
	// 	});

	// 	new Setting(this.containerEl)
	// 		.setName("Demo of settings")
	// 		.setDesc(
	// 			createFragment((f) => {
	// 				f.createSpan({
	// 					text: "Description for setting goes here ",
	// 				});
	// 				f.createEl("a", {
	// 					text: "Link to additional useful materials",
	// 					href: "#",
	// 				});
	// 				f.createSpan({ text: " syntax." });
	// 			}),
	// 		)
	// 		.addText((t) => {
	// 			t.setValue(String(this.plugin.settings.demoSetting));
	// 			t.onChange(async (v) => {
	// 				this.plugin.settings.demoSetting = v.length
	// 					? v
	// 					: defaultSettings.demoSetting;
	// 				await this.plugin.saveSettings();
	// 			});
	// 		})
	// 		.addSearch((c) => console.log("comp: ", c));
	// }
}
