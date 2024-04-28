import { AbstractInputSuggest, App } from "obsidian";
import React, { useEffect, useRef, useState } from "react";

export const createSuggest = (
	app: App,
	inputEl: HTMLInputElement,
	getSuggestions: (query: string) => string[] | Promise<string[]>,
	onSelect: (value: string, evt: MouseEvent | KeyboardEvent) => void,
) => {
	new Suggest(app, inputEl, getSuggestions, onSelect);
};

/**
 * Render suggestions for an autocomplete popover and automatically set the value of the input that uses the returned ref
 * @param ConfigObject object with keys for `app` and `getSuggestions` callback
 * @returns an input ref
 */
export const useSuggest = ({
	app,
	getSuggestions,
	onSelect,
	ref,
}: {
	app: App;
	getSuggestions: (query: string) => string[] | Promise<string[]>;
	onSelect: (value: string, evt: MouseEvent | KeyboardEvent) => void;
	ref?: React.MutableRefObject<HTMLInputElement>;
}): [
	React.MutableRefObject<HTMLInputElement>,
	(inputEl: HTMLInputElement) => void,
] => {
	const [suggest, setSuggest] = useState<Suggest>();
	const inputRef = ref === undefined ? useRef<HTMLInputElement>(null) : ref;

	const createSuggest = (inputEl: HTMLInputElement) => {
		setSuggest(new Suggest(app, inputEl, getSuggestions, onSelect));
	};

	useEffect(() => {
		console.log("use effect called");
		if (!inputRef?.current) return;
		if (!suggest) {
			createSuggest(inputRef.current);
		}
		if (suggest) {
			setSuggest((prev) => {
				prev.inputEl = inputRef.current;
				prev.getSuggestions = getSuggestions;
				prev.onSelectCb = onSelect;
				return prev;
			});
		}
	}, [app, getSuggestions, onSelect]);
	return [inputRef, createSuggest];
};

export class Suggest extends AbstractInputSuggest<string> {
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
		if (el.parentNode.firstChild === el) {
			el.style.color = "var(--text-faint)";
		}
		el.textContent = value;
	}

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		console.log("selected sugg: ", value);
		// this.inputEl.value = value;
		this.onSelectCb(value, evt);
	}
}
