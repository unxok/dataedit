import {
	MarkdownPostProcessorContext,
	Notice,
	parseYaml,
	stringifyYaml,
} from "obsidian";
import { Settings } from "./PluginSettings";
import React, { useEffect, useState } from "react";
import DataEdit, { loadDependencies } from "@/main";
import {
	cn,
	getPropertyType,
	iconStyle,
	iterateStringKeys,
	tryToMarkdownLink,
} from "@/lib/utils";
import { Markdown } from "./Markdown";
import {
	Binary,
	Calendar,
	CheckSquare,
	Clock,
	File,
	Forward,
	Info,
	List,
	Lock,
	Settings as Gear,
	Tags,
	Text,
	Unlock,
} from "lucide-react";
import { ClassValue } from "clsx";
import { create } from "zustand";

export const updateMetaData = async (
	propertyName: string,
	propertyValue: any,
	filePath: string,
	plugin: DataEdit,
) => {
	// console.log("updated?", v, queryResults.headers[k]);
	const file = plugin.app.vault.getFileByPath(filePath);
	if (!file) {
		throw new Error("Tried to update property but couldn't find file");
		return;
	}
	await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
		// console.log("fm: ", frontmatter);
		const arr = propertyName.split(".");
		if (arr.length === 1) {
			return (frontmatter[propertyName] = propertyValue);
		}
		return (frontmatter = iterateStringKeys(
			frontmatter,
			propertyName,
			propertyValue,
		));
	});
	// await updateDataeditLinks();
};

type ObsdianPropertyType =
	| "aliases"
	| "checkbox"
	| "date"
	| "datetime"
	| "multitext"
	| "number"
	| "tags"
	| "text";

const PropertyIcon = ({
	propertyType,
}: {
	propertyType: ObsdianPropertyType | string;
}) => {
	switch (propertyType) {
		case "aliases": {
			return <Forward style={iconStyle} />;
		}
		case "checkbox": {
			return <CheckSquare style={iconStyle} />;
		}
		case "date": {
			return <Calendar style={iconStyle} />;
		}
		case "datetime": {
			return <Clock style={iconStyle} />;
		}
		case "multitext": {
			return <List style={iconStyle} />;
		}
		case "number": {
			return <Binary style={iconStyle} />;
		}
		case "tags": {
			return <Tags style={iconStyle} />;
		}
		case "text": {
			return <Text style={iconStyle} />;
		}
		case "file": {
			return <File style={iconStyle} />;
		}
		default: {
			return <Text style={iconStyle} />;
		}
	}
};

const getColAliasObj = (text: string) => {
	const regex = /\b([^\s]+)\s+as\s+([^\s]+)\b/gi;
	const matches = text.match(regex);
	if (!matches) return {};
	return matches.reduce((acc, cur) => {
		const arr = cur.split(/\sas\s/gi);
		return {
			...acc,
			[arr[1].trim()]: arr[0].trim(),
		};
	}, {});
};

const ensureFileLink = (query: string) => {
	const regex1 = new RegExp(/table without id/gi);
	const regex2 = new RegExp(/file.link/gi);
	if (regex1.test(query) && !regex2.test(query)) {
		const arr = query.split("\n");
		arr[0] += ", file.link";
		return { query: arr.join("\n"), hideFileLink: true };
	}
	return { query: query, hideFileLink: false };
};

const findFileHeaderIndex = (headers: string[]) => {
	const found = headers.findIndex((h) => {
		const l = h.toLowerCase();
		if (l === "file" || l === "file.link") return true;
	});
	if (found === -1)
		throw new Error(
			"Could not find file link header. This should be impossible",
		);
	return found;
};

const getBlockId = (multiLine: string) => {
	const arr = multiLine.trim().split("\n");
	const line = arr[arr.length - 1];
	const regex = new RegExp(/^ID\s\S/gim);
	const hasId = regex.test(line);
	if (!hasId)
		return {
			blockId: undefined,
			query: multiLine,
		};
	return {
		blockId: line.slice(3),
		query: arr.slice(0, -1).join("\n"),
	};
};

type QueryResults = {
	headers: string[];
	values: any[][];
};

type BlockState = {
	plugin?: DataEdit;
	data?: string;
	ctx?: MarkdownPostProcessorContext;
	aliasObj?: Record<string, string>;
	setBlockState: (
		state: BlockState | ((state: BlockState) => BlockState),
	) => void;
};
export const useBlock = create<BlockState>()((set) => ({
	plugin: undefined,
	setBlockState: (state) => {
		if (typeof state === "function") {
			return set((prev) => state(prev));
		}
		set(state);
	},
}));

export const App = (props: {
	data: string;
	ctx: MarkdownPostProcessorContext;
	getSectionInfo: () => any;
	settings: Settings;
	plugin: DataEdit;
}) => {
	const { data, getSectionInfo, settings, plugin, ctx } = props;
	const [queryResults, setQueryResults] = useState<QueryResults>();
	const [fileHeaderIndex, setFileHeaderIndex] = useState<number>();
	const [dvErr, setDvErr] = useState<string>();
	const { setBlockState } = useBlock();
	const [isLocked, setIsLocked] = useState(false);

	const reg = new RegExp(/\n^---$\n/gm);
	const { blockId, query: preQuery } = getBlockId(data);
	const { query, hideFileLink } = ensureFileLink(preQuery);
	const aliasObj = getColAliasObj(query);

	/**
	 * Block data becomes undefined in reading mode, so this protects against setting it undefined
	 * @param qr new Query Results
	 */
	const safeSetQueryResults = (qr: QueryResults) => {
		setQueryResults((prev) => {
			if (qr) return qr;
			if (prev) return prev;
			return qr;
		});
	};

	console.log("blockid: ", blockId);

	const doQuery = async () => {
		console.log("do query called: ", query);
		// @ts-ignore
		const dv = app.plugins.plugins.dataview.api;
		if (query.split(" ")[0].toLowerCase() !== "table") {
			const result = eval(`(() => {${query}})()`);
			// console.log("result: ", result);
			if (!result) return;
			return safeSetQueryResults(result);
		}
		const qr = await dv.query(query);
		console.log("dv q: ", qr);
		if (!qr.successful) {
			return setDvErr(qr.error);
		}
		// console.log(qr.value);
		safeSetQueryResults(qr.value);
	};

	useEffect(() => {
		setBlockState((prev) => ({
			...prev,
			data: data,
			ctx: ctx,
			plugin: plugin,
			aliasObj: aliasObj,
		}));
		(async () => {
			const b = await loadDependencies();
			if (!b) {
				return new Notice(
					"Datedit: Failed to load dependencies\n\nIs Dataview installed and enabled?",
				);
			}
			await doQuery();
		})();
		plugin.app.metadataCache.on(
			"dataview:index-ready" as "changed",
			doQuery,
		);
		plugin.app.metadataCache.on(
			"dataview:metadata-change" as "changed",
			doQuery,
		);
		return () => {
			plugin.app.metadataCache.off(
				"dataview:index-ready" as "changed",
				doQuery,
			);
			plugin.app.metadataCache.off(
				"dataview:metadata-change" as "changed",
				doQuery,
			);
		};
	}, []);

	useEffect(() => {
		console.log("queryResults changed: ", queryResults);
		if (!queryResults) return;
		setFileHeaderIndex(findFileHeaderIndex(queryResults.headers));
	}, [queryResults]);

	if (!queryResults) {
		return (
			<div className="twcss">
				<div>Query results undefined</div>
				<div className="flex flex-row items-center gap-1">
					<div>Dataview error</div>
					<div aria-label={dvErr}>
						<Info className="hover:text-accent" style={iconStyle} />
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="twcss" style={{ overflowX: "scroll" }}>
			<table className="dataedit">
				<thead>
					<tr>
						{queryResults?.headers?.map((h, i) => (
							<Th
								key={i + "table-header"}
								className="py-3"
								hideFileLink={hideFileLink}
							>
								{h}
							</Th>
						))}
					</tr>
				</thead>
				<tbody>
					{queryResults?.values?.map((r, i) => (
						<tr key={i + "-table-body-row"}>
							{r?.map((d, k) => (
								<Td
									key={k + "table-data"}
									propertyName={queryResults.headers[k]}
									className="py-3"
									hideFileLink={hideFileLink}
									filePath={
										queryResults.values[i][fileHeaderIndex]
											?.path
									}
									isLocked={isLocked}
								>
									{d}
								</Td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex w-full flex-row items-center p-2">
				<SettingsGear blockId={blockId} />
				<LockToggle
					isLocked={isLocked}
					toggleLock={() => setIsLocked((b) => !b)}
				/>
			</div>
		</div>
	);
};

const LockToggle = ({
	isLocked,
	toggleLock,
}: {
	isLocked: boolean;
	toggleLock: () => void;
}) => {
	const Icon = isLocked ? Lock : Unlock;
	return (
		<div
			onClick={() => toggleLock()}
			aria-label="Lock editing"
			className="clickable-icon side-dock-ribbon-action"
		>
			<Icon
				className={`svg-icon lucide-lock ${
					!isLocked
						? "text-muted opacity-50"
						: "text-inherit opacity-100"
				}`}
			/>
		</div>
	);
};

const SettingsGear = ({ blockId }: { blockId?: string }) => {
	return (
		<div
			// onClick={() => toggleLock()}
			aria-label={
				blockId
					? `id: ${blockId}`
					: `First specify an id to configure settings\n\nTABLE fizz\nFROM buzz\nID my-id`
			}
			className="clickable-icon side-dock-ribbon-action"
		>
			<Gear className="svg-icon lucide-settings" />
		</div>
	);
};

const Th = ({
	children,
	className,
	hideFileLink,
}: {
	children: string;
	className?: ClassValue;
	hideFileLink: boolean;
}) => {
	const { ctx, plugin, aliasObj } = useBlock();
	const propName = aliasObj[children] ?? children;
	// TODO check for different prop name set in dataview settings?
	const isFileProp =
		propName.toLowerCase() === "file" || propName === "file.link";
	const propertyType = isFileProp ? "file" : getPropertyType(propName);

	if (isFileProp && hideFileLink) return;
	return (
		<th className={cn(className)}>
			<div className="flex h-full w-full">
				<Markdown
					app={plugin.app}
					filePath={ctx.sourcePath}
					plainText={children}
				/>
				&nbsp;
				<PropertyIcon propertyType={propertyType} />
			</div>
		</th>
	);
};

type TdProps = {
	children: string;
	propertyName: string;
	className?: ClassValue;
	hideFileLink: boolean;
	filePath: string;
	isLocked: boolean;
};
const Td = (props: TdProps) => {
	const { children, propertyName, className, hideFileLink } = props;
	const { ctx, plugin, aliasObj } = useBlock();
	const propName = aliasObj[propertyName] ?? propertyName;
	// TODO check for different prop name set in dataview settings?
	const isFileProp =
		propName.toLowerCase() === "file" || propName === "file.link";
	const propertyType = isFileProp ? "file" : getPropertyType(propName);
	console.log(`property ${propName} is type: ${propertyType}`);
	const content = tryToMarkdownLink(children);

	if (isFileProp && hideFileLink) return;

	return (
		<td className={cn(className)}>
			<div className="flex h-full w-full">
				{propertyType === "text" || isFileProp ? (
					<TextInput {...props} propertyName={propName}>
						{content}
					</TextInput>
				) : isFileProp ? (
					<Markdown
						app={plugin.app}
						filePath={ctx.sourcePath}
						plainText={children}
					/>
				) : (
					<div>{content}</div>
				)}
			</div>
		</td>
	);
};

const TextInput2 = (props: TdProps) => {
	const {
		children,
		propertyName,
		className,
		hideFileLink,
		filePath,
		isLocked,
	} = props;
	const { ctx, plugin, aliasObj } = useBlock();
	const [isEditing, setIsEditing] = useState(false);

	if (!isEditing || isLocked || true) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={children}
				className="h-fit w-fit [&_*]:my-0"
				// onClick={() => {
				// 	console.log("clicked");
				// 	!isLocked && setIsEditing(true);
				// }}
				onBlur={async (e) => {
					console.log(e.target.textContent);
					await updateMetaData(
						propertyName,
						e.target.textContent,
						filePath,
						plugin,
					);
					setIsEditing(false);
				}}
			/>
		);
	}

	// return (
	// 	<div
	// 		contentEditable
	// 		onBlur={async (e) => {
	// 			console.log(e.target.textContent);
	// 			await updateMetaData(
	// 				propertyName,
	// 				e.target.textContent,
	// 				filePath,
	// 				plugin,
	// 			);
	// 			setIsEditing(false);
	// 		}}
	// 	>
	// 		{children}
	// 	</div>
	// );
};

const TextInput = (props: TdProps) => {
	const { children, propertyName, filePath, isLocked } = props;
	const { ctx, plugin, aliasObj } = useBlock();
	const [isEditing, setIsEditing] = useState(false);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={children}
				className="[&_*]:my-0"
				onClick={() => {
					console.log("clicked");
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	// return (
	// 	<textarea
	// 		defaultValue={children}
	// 		autoFocus
	// 		onBlur={async (e) => {
	// 			console.log(e.target.value);
	// 			await updateMetaData(
	// 				propertyName,
	// 				e.target.value,
	// 				filePath,
	// 				plugin,
	// 			);
	// 			setIsEditing(false);
	// 		}}
	// 	/>
	// );

	return (
		<input
			type="text"
			defaultValue={children}
			autoFocus
			onBlur={async (e) => {
				console.log(e.target.value);
				await updateMetaData(
					propertyName,
					e.target.value,
					filePath,
					plugin,
				);
				setIsEditing(false);
			}}
		/>
	);
};
