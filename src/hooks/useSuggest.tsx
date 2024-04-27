import { AbstractInputSuggest, App } from "obsidian";
import React, { useEffect, useRef, useState } from "react";

/**
 * Render suggestions for an autocomplete popover and automatically set the value of the input that uses the returned ref
 * @param ConfigObject object with keys for `app` and `getSuggestions` callback
 * @returns an input ref
 */
export const useSuggest = ({
	app,
	getSuggestions,
	onSelect,
}: {
	app: App;
	getSuggestions: (query: string) => string[] | Promise<string[]>;
	onSelect: (value: string, evt: MouseEvent | KeyboardEvent) => void;
}) => {
	const [suggest, setSuggest] = useState<Suggest>();
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!ref?.current) return;
		setSuggest(new Suggest(app, ref.current, getSuggestions, onSelect));
	}, []);
	return ref;
};

class Suggest extends AbstractInputSuggest<string> {
	app: App;
	inputEl: HTMLInputElement;
	getSuggestions: (query: string) => string[] | Promise<string[]>;
	onSelectCb: (value: string, evt: MouseEvent | KeyboardEvent) => any;

	constructor(
		app: App,
		inputEl: HTMLInputElement,
		getSuggestions: (query: string) => string[] | Promise<string[]>,
		onSelect: (value: string, evt: MouseEvent | KeyboardEvent) => any,
	) {
		super(app, inputEl);
		this.app = app;
		this.inputEl = inputEl;
		this.getSuggestions = getSuggestions;
		this.onSelectCb = onSelect;
	}

	// protected getSuggestions(query: string): string[] | Promise<string[]> {
	// 	return ["test1", "test2", "test3"];
	// }

	renderSuggestion(value: string, el: HTMLElement): void {
		console.log("rendered sugg: ", value);
		el.textContent = value;
	}

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		console.log("selected sugg: ", value);
		// this.inputEl.value = value;
		this.onSelectCb(value, evt);
	}
}
