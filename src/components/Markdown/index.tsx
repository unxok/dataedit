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
	...props
}: {
	app: App;
	filePath: string;
	plainText: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
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
	}, [app, filePath, plainText]);
	return (
		<div
			ref={ref}
			className="no-p-margin h-fit w-fit [&>p]:whitespace-pre"
			{...props}
		></div>
	);
};
