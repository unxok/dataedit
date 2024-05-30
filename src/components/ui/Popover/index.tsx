import React, { useEffect, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { useBlock } from "@/components/App";
import { HeadingCache, TFile } from "obsidian";
import { Forward } from "lucide-react";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * Use `prompt-instruction` and `prompt-instruction-command`
 */
const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			sideOffset={sideOffset}
			className={cn("suggestion-container", className)}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };

type SuggesterProps = {
	children: React.ReactNode;
	query: string;
	open: boolean;
	onSelect: (text?: string, index?: number) => void;
	getSuggestions: (query: string) => string[];
};

type LinkSuggestion = {
	file: TFile;
	path: string;
	alias?: string;
};

export const Suggester = ({
	children,
	query,
	open,
	onSelect,
	getSuggestions,
}: SuggesterProps) => {
	const [selected, setSelected] = useState<number>();
	const { plugin } = useBlock();
	const getLinkSuggestions = (q: string) => {
		const hashTagIndex = q.indexOf("#");
		if (hashTagIndex !== -1) {
			const potentialFile = plugin.app.vault.getFileByPath(
				q.slice(2, hashTagIndex) + ".md",
			);
			if (!potentialFile) return [""];
			const headers =
				plugin.app.metadataCache.getFileCache(potentialFile);
			return headers?.headings?.length > 0 ? headers.headings : [""];
		}

		const files: LinkSuggestion[] =
			// @ts-ignore
			app.metadataCache.getLinkSuggestions();

		return files.filter((v) => {
			if (!v?.path) return false;
			return v.path.includes(q.slice(2));
		});
	};
	const suggestions = query.startsWith("[[")
		? getLinkSuggestions(query)
		: getSuggestions(query);

	const selectNext = (
		suggestionArr: HeadingCache[] | LinkSuggestion[] | string[],
	) => {
		setSelected((prev) => {
			if (prev === undefined || prev + 1 >= suggestionArr.length) {
				console.log("sug len: ", suggestionArr.length);
				console.log("next 0 ", prev);
				return 0;
			}
			console.log("next + 1");
			return prev + 1;
		});
	};

	const selectPrev = (
		suggestionArr: HeadingCache[] | LinkSuggestion[] | string[],
	) => {
		setSelected((prev) => {
			if (prev === undefined || prev - 1 < 0) {
				console.log("sug len: ", suggestionArr.length);

				console.log("prev len - 1 ", prev);
				return suggestionArr.length - 1;
			}
			console.log("prev - 1");
			return prev - 1;
		});
	};

	const handleKeyPress = (
		e: KeyboardEvent,
		suggestionArr: HeadingCache[] | LinkSuggestion[] | string[],
	) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			return selectNext(suggestionArr);
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			return selectPrev(suggestionArr);
		}
		if (e.key === "Escape") {
			e.preventDefault();
			return setSelected(undefined);
		}
	};

	useEffect(() => {
		if (selected !== undefined) {
			const selectedSuggestion = suggestions[selected];
			if (typeof selectedSuggestion === "string") {
				return onSelect(selectedSuggestion, selected);
			}
			if (selectedSuggestion.hasOwnProperty("path")) {
				return onSelect(
					"[[" + (selectedSuggestion as LinkSuggestion).path + "]]",
					selected,
				);
			}
			return onSelect(
				query + (selectedSuggestion as HeadingCache).heading + "]]",
				selected,
			);
		}
		onSelect();
	}, [selected, query]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => handleKeyPress(e, suggestions);
		window.addEventListener("keydown", handler);

		return () => {
			window.removeEventListener("keydown", handler);
		};
	}, [suggestions]);

	if (query.startsWith("[[")) {
		return (
			<Popover open={open}>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
				<PopoverContent
					className="twcss"
					onOpenAutoFocus={(e) => e.preventDefault()}
					align="start"
					avoidCollisions={true}
				>
					<div className="suggestion">
						{(
							suggestions as unknown as
								| LinkSuggestion[]
								| HeadingCache[]
						)?.map((v, i) => (
							<div
								key={i}
								className={`suggestion-item mod-complex ${selected === i ? "is-selected" : ""}`}
							>
								<div
									className="suggestion-content"
									onMouseEnter={(e) => {
										setSelected(i);
									}}
									onMouseLeave={(e) => {
										setSelected(undefined);
										// onSelect(e.currentTarget.textContent);
									}}
								>
									<div className="suggestion-title">
										{v?.path
											? v.path
											: v?.heading
												? v.heading
												: "No matches found"}
									</div>
									<div className="suggestion-note">
										{v?.alias}
									</div>
								</div>
								<div className="suggestion-aux">
									<span
										className="suggestion-flair"
										aria-label="Alias"
									>
										{v?.alias && (
											<Forward className="svg-icon lucide-forward" />
										)}
										{v?.level && (
											<span className="suggestion-flair">
												H{v.level}
											</span>
										)}
									</span>
								</div>
							</div>
						))}
					</div>
					<div className="prompt-instructions flex-nowrap text-nowrap">
						<div className="prompt-instruction">
							<span className="prompt-instruction-command">
								Type #
							</span>
							<span>to link heading</span>
						</div>
						<div className="prompt-instruction">
							<span className="prompt-instruction-command">
								Type ^
							</span>
							<span>to link blocks</span>
						</div>
						<div className="prompt-instruction">
							<span className="prompt-instruction-command">
								Type |
							</span>
							<span>to change display text</span>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Popover open={open}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				className="twcss"
				onOpenAutoFocus={(e) => e.preventDefault()}
				align="start"
				avoidCollisions={true}
			>
				<div className="suggestion">
					{(suggestions as string[])?.map((v, i) => (
						<div
							key={i}
							className={`suggestion-item ${selected === i ? "is-selected" : ""}`}
						>
							<span
								className="suggestion-highlight"
								onMouseEnter={(e) => {
									setSelected(i);
								}}
								onMouseLeave={(e) => {
									setSelected(undefined);
									// onSelect(e.currentTarget.textContent);
								}}
							>
								{v}
							</span>
						</div>
					))}
				</div>
				<div className="prompt-instructions flex-nowrap text-nowrap">
					<div className="prompt-instruction">
						<span className="prompt-instruction-command">
							Type [[
						</span>
						<span>to link note</span>
					</div>
					<div className="prompt-instruction">
						<span className="prompt-instruction-command">esc</span>
						<span>to dismiss</span>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export const LinkSuggester = ({
	children,
	query,
	// getSuggestions,
	open,
	onSelect,
}: {
	children: React.ReactNode;
	query: string;
	// getSuggestions: (query: string) => string[] | undefined;
	open: boolean;
	onSelect: (text: string, index: number) => void;
	// onOpenChange: (b: boolean) => boolean;
}) => {
	const [selected, setSelected] = useState<number>();

	type LinkSuggestion = {
		file: TFile;
		path: string;
		alias?: string;
	};
	const getSuggestions = (q: string) => {
		const files: LinkSuggestion[] =
			// @ts-ignore
			app.metadataCache.getLinkSuggestions();

		console.log("files: ", files);
		return files.filter((v) => {
			if (!v?.path) return false;
			return true;
			// return v.path.includes(q.slice(2));
		});
	};
	const suggestions = getSuggestions(query);

	const selectNext = () => {
		setSelected((prev) => {
			if (prev === undefined || prev + 1 >= suggestions.length) {
				return 0;
			}
			return prev + 1;
		});
	};

	const selectPrev = () => {
		setSelected((prev) => {
			if (prev === undefined || prev - 1 < 0) {
				return suggestions.length - 1;
			}
			return prev - 1;
		});
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			return selectNext();
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			return selectPrev();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			return setSelected(undefined);
		}
	};

	useEffect(() => {
		if (selected) {
			onSelect(suggestions[selected]?.path, selected);
		}
	}, [selected]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);

		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, []);

	return (
		<Popover open={open}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				className="twcss"
				onOpenAutoFocus={(e) => e.preventDefault()}
				align="start"
				avoidCollisions={true}
			>
				<div className="suggestion">
					{suggestions?.map((v, i) => (
						<div
							key={i}
							className={`suggestion-item mod-complex ${selected === i ? "is-selected" : ""}`}
						>
							<div
								className="suggestion-content"
								onMouseEnter={(e) => {
									setSelected(i);
								}}
								onMouseLeave={(e) => {
									setSelected(undefined);
									// onSelect(e.currentTarget.textContent);
								}}
							>
								<div className="suggestion-title">{v.path}</div>
								<div className="suggestion-note">
									{v?.alias}
								</div>
							</div>
							<div className="suggestion-aux">
								<span
									className="suggestion-flair"
									aria-label="Alias"
								>
									{v?.alias && (
										<Forward className="svg-icon lucide-forward" />
									)}
								</span>
							</div>
						</div>
					))}
				</div>
				<div className="prompt-instructions flex-nowrap text-nowrap">
					<div className="prompt-instruction">
						<span className="prompt-instruction-command">
							Type #
						</span>
						<span>to link heading</span>
					</div>
					<div className="prompt-instruction">
						<span className="prompt-instruction-command">
							Type ^
						</span>
						<span>to link blocks</span>
					</div>
					<div className="prompt-instruction">
						<span className="prompt-instruction-command">
							Type |
						</span>
						<span>to change display text</span>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
