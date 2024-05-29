import { cn } from "@/lib/utils";
import {
	App,
	Component,
	MarkdownPostProcessorContext,
	MarkdownRenderer,
} from "obsidian";
import React, { useEffect, useRef, useState } from "react";

export const Markdown = ({
	app,
	filePath,
	plainText,
	className,
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
			className={cn(
				"no-p-margin h-fit w-fit [&>p]:whitespace-pre",
				className,
			)}
			{...props}
		></div>
	);
};
