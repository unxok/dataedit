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
	disabled,
	span,
	...props
}: {
	app: App;
	filePath: string;
	plainText: string;
	disabled?: boolean;
	span?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
	if (disabled) {
		return <div {...props}>{plainText}</div>;
	}
	const component = new Component();
	const ref = useRef<HTMLDivElement | HTMLSpanElement>(null);
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

	if (span) {
		return (
			<span
				ref={ref}
				className={cn(
					"no-p-margin h-fit w-fit [&>p]:whitespace-pre",
					className,
				)}
				{...props}
			></span>
		);
	}

	return (
		<div
			ref={ref as React.MutableRefObject<HTMLDivElement>}
			className={cn(
				"no-p-margin h-fit w-fit [&>p]:whitespace-pre",
				className,
			)}
			{...props}
		></div>
	);
};
