import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	Plugin,
	PopoverSuggest,
	Scope,
	TFile,
} from "obsidian";

export class PropertySuggester extends EditorSuggest<string> {
	private plugin: Plugin;
	app: App;

	constructor(app, plugin) {
		super(app);
		this.app = app;
		this.plugin = plugin;

		this.scope.register(["Shift"], "Enter", (evt: KeyboardEvent) => {
			// @ts-ignore
			this.suggestions.useSelectedItem(evt);
			return false;
		});
	}

	getSuggestions(context: EditorSuggestContext): any[] {
		const suggestions =
			// @ts-ignore
			app.metadataCache.getFrontmatterPropertyValuesForKey("test");
		console.log("suggestions: ", suggestions);
		console.log("context in getsugg: ", context);
		return suggestions;
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		const { editor } = this.app.workspace.activeEditor;
		const cursor = editor.getCursor();
		const start = {
			line: cursor.line,
			ch: cursor.ch,
		};
		editor.replaceRange(value, start, start);
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile,
	): EditorSuggestTriggerInfo {
		console.log("should be triggered");

		const startPos = this.context?.start || {
			line: cursor.line,
			ch: cursor.ch,
		};

		console.log("we got context");
		return {
			start: startPos,
			end: cursor,
			query: editor.getRange(startPos, cursor),
		};
	}
}
