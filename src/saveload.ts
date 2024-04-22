import { App, MarkdownSectionInformation } from "obsidian";

export async function saveData(
	data: any,
	app: App,
	section: MarkdownSectionInformation
): Promise<void> {
	let file = app.workspace.getActiveFile();
	if (!file) return;
	let content = await app.vault.read(file);

	// figure out what part of the content we have to edit
	let lines = content.split("\n");
	let prev = lines.filter((_, i) => i <= section.lineStart).join("\n");
	let next = lines.filter((_, i) => i >= section.lineEnd).join("\n");
	// edit only the code block content, leave the rest untouched
	content = `${prev}\n${JSON.stringify(data)}\n${next}`;

	await app.vault.modify(file, content);
}

export function loadData(json: string) {
	if (json) {
		try {
			return JSON.parse(json);
		} catch (e) {
			console.log(`Failed to parse data from ${json}`);
		}
	}
	return { entries: [] };
}
