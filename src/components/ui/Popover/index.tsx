import React, { useEffect, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import {
	BlockCache,
	HeadingCache,
	MetadataCache,
	Plugin,
	SectionCache,
	TFile,
} from "obsidian";
import { Forward } from "lucide-react";
import { boolean } from "zod";

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
	plugin: Plugin;
	disabled?: boolean;
};

type LinkSuggestion = {
	file: TFile;
	path: string;
	alias?: string;
};

const BASE = "base";
const HEADER = "header";
const SECTION = "section";
type WikiLinkType = typeof BASE | typeof HEADER | typeof SECTION;
type GetWikiLinkDetails = (fileName: string) => {
	charIndex: number;
	linkType: WikiLinkType;
};
const getWikiLinkDetails: GetWikiLinkDetails = (fileName) => {
	const hashTagIndex = fileName.indexOf("#");
	const hatIndex = fileName.indexOf("^");
	if (hashTagIndex + hatIndex === -2)
		return {
			charIndex: -1,
			linkType: BASE,
		};
	const charIndex = hashTagIndex > -1 ? hashTagIndex : hatIndex;
	return {
		charIndex,
		linkType: charIndex === hashTagIndex ? HEADER : SECTION,
	};
};

const getItems = (
	query: string,
	charIndex: number,
	linkType: WikiLinkType,
	plugin: Plugin,
) => {
	const mc = app.metadataCache as MetadataCache & {
		getLinkSuggestions: () => LinkSuggestion[];
	};
	if (linkType === BASE) {
		return mc.getLinkSuggestions() as LinkSuggestion[];
	}
	const potentialFile = plugin.app.vault.getFileByPath(
		query.slice(2, charIndex) + ".md",
	);
	if (!potentialFile) {
		return;
	}
	const { headings, sections } =
		plugin.app.metadataCache.getFileCache(potentialFile);
	return linkType === HEADER ? headings : sections;
};

type ToModifiedSectionCache = (
	filePath: string,
	sections: SectionCache[],
	plugin: Plugin,
) => Promise<ModifiedSectionCache[]>;
const toModifiedSectionCache: ToModifiedSectionCache = async (
	filePath,
	sections,
	plugin,
) => {
	const file = plugin.app.vault.getFileByPath(filePath + ".md");
	// Your filepath should be valid since you used it to get `sections` param
	if (!file)
		throw new Error(
			"Tried reading sections but couldn't get file from filepath: " +
				filePath +
				".md",
		);
	const content = await plugin.app.vault.cachedRead(file);
	return sections.map((s) => {
		const start = s.position.start.offset;
		const end = s.position.end.offset;
		return {
			...s,
			section: content.slice(start, end),
		};
	});
};

type ModifiedSectionCache = SectionCache & {
	section: string;
};

type GetFilterProps = (
	| {
			linkType: typeof BASE;
			linkObj: LinkSuggestion;
	  }
	| {
			linkType: typeof HEADER;
			linkObj: HeadingCache;
	  }
	| {
			linkType: typeof SECTION;
			linkObj: ModifiedSectionCache;
	  }
) & {
	query: string;
};

const linkFilter = async ({ linkObj, linkType, query }: GetFilterProps) => {
	const qu = query.toUpperCase();
	if (linkType === BASE) {
		return (v: LinkSuggestion) => {
			if (!v?.path) return false;
			return v.path.toUpperCase().includes(qu.slice(2));
		};
	}
	if (linkType === HEADER) {
		const { heading, level } = linkObj;
		const isMatchLevel = qu === "H" + level.toString();
		const isMatchName = heading.toUpperCase().includes(qu);
		return isMatchLevel || isMatchName;
	}
	if (linkType === SECTION) {
		const { section, type, id } = linkObj;
		const isSectionMatch = section.toUpperCase().includes(qu);
		const isTypeMatch = type.toUpperCase().includes(qu);
		// const isIdMatch = id.toUpperCase().includes(qu);
		return isSectionMatch || isTypeMatch;
	}
	throw new Error(
		"Invalid linkType.\nExpected `typeof BASE` or `typeof HEADER` or `typeof SECTION`\nGot: " +
			linkType,
	);
};

/*
	TODO Sections
	Apparently sections and blocks are more distinct than I thought and I am confused.
	The first step is changing from sections to blocks because the named blocks are in the fileCache and they contain a position just like sections
	The bigger issue is I don't know how obsidian gets suggestions for non-named blocks. 
	As well, if you click one of the unnamed suggestions, it seems to modify the file and give it a random id
	- This means I'll have to add this has a side effect for when an unnamed block is selected and will have to pass that generated id back to the components parent in onSelect
*/
export const Suggester = ({
	children,
	query,
	open,
	onSelect,
	getSuggestions,
	plugin,
	disabled,
}: SuggesterProps) => {
	if (disabled) {
		return <>{children}</>;
	}
	const [selected, setSelected] = useState<number>();
	const [keydownHandler, setKeydownHandler] = useState<any>();
	const getLinkSuggestions = async (q: string) => {
		const { charIndex, linkType } = getWikiLinkDetails(q);
		let items = getItems(q, charIndex, linkType, plugin);
		console.log("items: ", items);
		if (linkType === SECTION && items?.length > 0) {
			items = await toModifiedSectionCache(
				q.slice(2, charIndex),
				items as SectionCache[],
				plugin,
			);
		}
		// TODO I thought I did the types right but idk
		const filtered = items?.filter((item) =>
			linkFilter({
				linkObj: item,
				linkType: linkType,
				query: q,
			} as GetFilterProps),
		) as LinkSuggestion[] | HeadingCache[] | ModifiedSectionCache[];
		return filtered;
	};
	const [suggestions, setSuggestions] = useState<
		string[] | LinkSuggestion[] | HeadingCache[] | ModifiedSectionCache[]
	>();

	const selectNext = (
		suggestionArr:
			| string[]
			| LinkSuggestion[]
			| HeadingCache[]
			| ModifiedSectionCache[],
	) => {
		setSelected((prev) => {
			if (prev === undefined || prev + 1 >= suggestionArr.length) {
				return 0;
			}
			return prev + 1;
		});
	};

	const selectPrev = (
		suggestionArr:
			| string[]
			| LinkSuggestion[]
			| HeadingCache[]
			| ModifiedSectionCache[],
	) => {
		setSelected((prev) => {
			if (prev === undefined || prev - 1 < 0) {
				return suggestionArr.length - 1;
			}
			return prev - 1;
		});
	};

	const handleKeyPress = (
		e: KeyboardEvent,
		suggestionArr:
			| string[]
			| LinkSuggestion[]
			| HeadingCache[]
			| ModifiedSectionCache[],
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
		if (!query || !query?.startsWith("[[")) {
			setSuggestions(() => getSuggestions(query));
			return;
		}
		(async () => {
			const s = await getLinkSuggestions(query);
			setSuggestions(s);
		})();
	}, [query]);

	useEffect(() => {
		if (selected !== undefined) {
			const selectedSuggestion = suggestions[selected];
			if (typeof selectedSuggestion === "string") {
				onSelect(selectedSuggestion, selected);
				return;
			}
			if (selectedSuggestion.hasOwnProperty("path")) {
				onSelect(
					"[[" + (selectedSuggestion as LinkSuggestion).path + "]]",
					selected,
				);
				return;
			}
			return onSelect(
				query + (selectedSuggestion as HeadingCache).heading + "]]",
				selected,
			);
		}
		onSelect();
	}, [selected, query]);

	useEffect(() => {
		console.log("suggestions: ", suggestions);
		if (keydownHandler) {
			window.removeEventListener("keydown", keydownHandler);
		}
		const handler = (e: KeyboardEvent) => handleKeyPress(e, suggestions);
		setKeydownHandler(() => handler);
		window.addEventListener("keydown", handler);
		return () => {
			window.removeEventListener("keydown", handler);
		};
	}, [suggestions]);

	if (typeof suggestions?.[0] === "object") {
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
						{!suggestions && <NoSuggestions />}
						{suggestions && (
							<LinkSuggestions
								suggestions={
									suggestions as unknown as
										| LinkSuggestion[]
										| HeadingCache[]
										| ModifiedSectionCache[]
								}
								selected={selected}
								setSelected={setSelected}
							/>
						)}
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
							onMouseEnter={() => {
								setSelected(i);
							}}
							onMouseLeave={() => {
								setSelected(undefined);
								// onSelect(e.currentTarget.textContent);
							}}
						>
							<span className="suggestion-highlight">{v}</span>
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

const NoSuggestions = () => (
	<div className={`suggestion-item mod-complex`}>
		<div className="suggestion-content">
			<div className="suggestion-title">No matches found</div>
		</div>
	</div>
);

type LinkSuggestionProps = {
	suggestions: LinkSuggestion[] | HeadingCache[] | ModifiedSectionCache[];
	selected: number;
	setSelected: (value: React.SetStateAction<number>) => void;
};

const LinkSuggestions = ({
	suggestions,
	selected,
	setSelected,
}: LinkSuggestionProps) => (
	<>
		{suggestions.map(
			(
				v: LinkSuggestion | HeadingCache | ModifiedSectionCache,
				i: number,
			) => (
				<div
					key={i}
					className={`suggestion-item mod-complex ${selected === i ? "is-selected" : ""}`}
					onMouseEnter={(e) => {
						setSelected(i);
					}}
					onMouseLeave={(e) => {
						setSelected(undefined);
						// onSelect(e.currentTarget.textContent);
					}}
				>
					<div className="suggestion-content">
						<div className="suggestion-title">
							{typeof v !== "object" && "No matches found"}
							{v?.hasOwnProperty("path") &&
								(v as LinkSuggestion).path}
							{v?.hasOwnProperty("section") &&
								(v as ModifiedSectionCache).section}
							{v?.hasOwnProperty("heading") &&
								(v as HeadingCache).heading}
						</div>
						<div className="suggestion-note">
							{v?.hasOwnProperty("alias")
								? (v as LinkSuggestion)?.alias
								: v?.hasOwnProperty("id")
									? (v as ModifiedSectionCache).id
									: ""}
						</div>
					</div>
					<div className="suggestion-aux">
						<span className="suggestion-flair" aria-label="Alias">
							{v?.hasOwnProperty("alias") && (
								<Forward className="svg-icon lucide-forward" />
							)}
							{v?.hasOwnProperty("level") && (
								<>H{(v as HeadingCache).level}</>
							)}
							{v?.hasOwnProperty("type") &&
								(v as ModifiedSectionCache).type}
						</span>
					</div>
				</div>
			),
		)}
	</>
);

// export const LinkSuggester = ({
// 	children,
// 	query,
// 	// getSuggestions,
// 	open,
// 	onSelect,
// }: {
// 	children: React.ReactNode;
// 	query: string;
// 	// getSuggestions: (query: string) => string[] | undefined;
// 	open: boolean;
// 	onSelect: (text: string, index: number) => void;
// 	// onOpenChange: (b: boolean) => boolean;
// }) => {
// 	const [selected, setSelected] = useState<number>();

// 	type LinkSuggestion = {
// 		file: TFile;
// 		path: string;
// 		alias?: string;
// 	};
// 	const getSuggestions = (q: string) => {
// 		const files: LinkSuggestion[] =
// 			// @ts-ignore
// 			app.metadataCache.getLinkSuggestions();

// 		console.log("files: ", files);
// 		return files.filter((v) => {
// 			if (!v?.path) return false;
// 			return true;
// 			// return v.path.includes(q.slice(2));
// 		});
// 	};
// 	const suggestions = getSuggestions(query);

// 	const selectNext = () => {
// 		setSelected((prev) => {
// 			if (prev === undefined || prev + 1 >= suggestions.length) {
// 				return 0;
// 			}
// 			return prev + 1;
// 		});
// 	};

// 	const selectPrev = () => {
// 		setSelected((prev) => {
// 			if (prev === undefined || prev - 1 < 0) {
// 				return suggestions.length - 1;
// 			}
// 			return prev - 1;
// 		});
// 	};

// 	const handleKeyPress = (e: KeyboardEvent) => {
// 		if (e.key === "ArrowDown") {
// 			e.preventDefault();
// 			return selectNext();
// 		}
// 		if (e.key === "ArrowUp") {
// 			e.preventDefault();
// 			return selectPrev();
// 		}
// 		if (e.key === "Escape") {
// 			e.preventDefault();
// 			return setSelected(undefined);
// 		}
// 	};

// 	useEffect(() => {
// 		if (selected) {
// 			onSelect(suggestions[selected]?.path, selected);
// 		}
// 	}, [selected]);

// 	useEffect(() => {
// 		window.addEventListener("keydown", handleKeyPress);

// 		return () => {
// 			window.removeEventListener("keydown", handleKeyPress);
// 		};
// 	}, []);

// 	return (
// 		<Popover open={open}>
// 			<PopoverTrigger asChild>{children}</PopoverTrigger>
// 			<PopoverContent
// 				className="twcss"
// 				onOpenAutoFocus={(e) => e.preventDefault()}
// 				align="start"
// 				avoidCollisions={true}
// 			>
// 				<div className="suggestion">
// 					{suggestions?.map((v, i) => (
// 						<div
// 							key={i}
// 							className={`suggestion-item mod-complex ${selected === i ? "is-selected" : ""}`}
// 						>
// 							<div
// 								className="suggestion-content"
// 								onMouseEnter={(e) => {
// 									setSelected(i);
// 								}}
// 								onMouseLeave={(e) => {
// 									setSelected(undefined);
// 									// onSelect(e.currentTarget.textContent);
// 								}}
// 							>
// 								<div className="suggestion-title">{v.path}</div>
// 								<div className="suggestion-note">
// 									{v?.alias}
// 								</div>
// 							</div>
// 							<div className="suggestion-aux">
// 								<span
// 									className="suggestion-flair"
// 									aria-label="Alias"
// 								>
// 									{v?.alias && (
// 										<Forward className="svg-icon lucide-forward" />
// 									)}
// 								</span>
// 							</div>
// 						</div>
// 					))}
// 				</div>
// 				<div className="prompt-instructions flex-nowrap text-nowrap">
// 					<div className="prompt-instruction">
// 						<span className="prompt-instruction-command">
// 							Type #
// 						</span>
// 						<span>to link heading</span>
// 					</div>
// 					<div className="prompt-instruction">
// 						<span className="prompt-instruction-command">
// 							Type ^
// 						</span>
// 						<span>to link blocks</span>
// 					</div>
// 					<div className="prompt-instruction">
// 						<span className="prompt-instruction-command">
// 							Type |
// 						</span>
// 						<span>to change display text</span>
// 					</div>
// 				</div>
// 			</PopoverContent>
// 		</Popover>
// 	);
// };
