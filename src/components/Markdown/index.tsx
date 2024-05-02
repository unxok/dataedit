import {
	App,
	Component,
	MarkdownPostProcessorContext,
	MarkdownRenderer,
} from "obsidian";
import React, { useEffect, useRef, useState } from "react";

class Comp extends Component {}

export const Markdown = ({
	app,
	filePath,
	plainText,
}: {
	app: App;
	filePath: string;
	plainText: string;
}) => {
	const component = new Component();
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!ref?.current) return;
		ref.current.textContent = "";
		MarkdownRenderer.render(
			app,
			plainText,
			ref.current,
			filePath,
			component,
		);
	}, []);
	return <div ref={ref} className="no-p-margin h-fit w-fit"></div>;
};
