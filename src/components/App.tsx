import {
	MarkdownPostProcessorContext,
	Notice,
	parseYaml,
	stringifyYaml,
} from "obsidian";
import { Settings } from "./PluginSettings";
import React, { useCallback, useEffect, useState } from "react";
import DataEdit, { loadDependencies } from "@/main";
import {
	checkForInlineField,
	cn,
	currentLocale,
	dv,
	dvRenderNullAs,
	getColAliasObj,
	getPropertyType,
	iconStyle,
	isDateWithTime,
	iterateStringKeys,
	numberToBase26Letters,
	tryToMarkdownLink,
	updateMetaData,
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
	Sparkle,
	ScanText,
	Braces,
	Plus,
	ChevronLeft,
	ChevronRight,
	ChevronLast,
	ChevronFirst,
} from "lucide-react";
import { ClassValue } from "clsx";
import { create } from "zustand";
import { FILE } from "@/lib/consts";
import { DateTime } from "luxon";
// import { NumberInput } from "./Inputs";

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
		case "inline": {
			return <ScanText style={iconStyle} />;
		}
		case "object": {
			return <Braces style={iconStyle} />;
		}
		default: {
			return <Text style={iconStyle} />;
		}
	}
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
		if (l === FILE || l === "file.link") return true;
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
	const [fileHeaderIndex, setFileHeaderIndex] = useState<number>(-1);
	const [dvErr, setDvErr] = useState<string>();
	const { setBlockState } = useBlock();
	const [isLocked, setIsLocked] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(2);
	const startIndex = (currentPage - 1) * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const currentRows = queryResults?.values?.slice(startIndex, endIndex);

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

	// console.log("blockid: ", blockId);

	const doQuery = async () => {
		// console.log("do query called: ", query);
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

	if (!queryResults || fileHeaderIndex === -1) {
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
			{/* height 1px allows divs to be 100% of the td -_- */}
			<table className="dataedit h-[1px]">
				<thead>
					{false && (
						<tr>
							{queryResults?.headers?.map((_, i) => (
								<th className="!bg-secondary">
									<div className="flex items-center justify-center">
										{numberToBase26Letters(i)}
									</div>
								</th>
							))}
						</tr>
					)}
					<tr>
						{false && (
							<th className="w-fit min-w-0 !bg-secondary">
								<div className="flex h-full w-full items-center justify-center">
									1
								</div>
							</th>
						)}
						{queryResults?.headers?.map((h, i) => (
							<Th
								key={i + "table-header"}
								className=""
								hideFileLink={hideFileLink}
								propertyName={h}
							/>
						))}
					</tr>
				</thead>
				<tbody>
					{currentRows?.map((r, i) => (
						<tr key={i + "-table-body-row"}>
							{false && (
								<td className="w-fit min-w-0 bg-secondary">
									<div className="my-auto flex h-full w-full items-center justify-center">
										{i + 2}
									</div>
								</td>
							)}
							{r?.map((d, k) => (
								<Td
									key={k + "table-data"}
									propertyName={queryResults.headers[k]}
									propertyValue={d}
									className=""
									hideFileLink={hideFileLink}
									filePath={
										queryResults.values[startIndex + i][
											fileHeaderIndex
										]?.path
									}
									isLocked={isLocked}
								/>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex w-full flex-row items-center p-2">
				<Pagination
					totalRows={queryResults.values.length}
					rowsPerPage={rowsPerPage}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
				<input
					type="number"
					step={1}
					min={0}
					defaultValue={rowsPerPage}
					aria-label="Page size"
					placeholder="no limit"
					className="w-8"
					onBlur={(e) =>
						setRowsPerPage((prev) => {
							const num = Number(e.target.value);
							if (!num || Number.isNaN(num)) {
								return prev;
							}
							return num;
						})
					}
				/>
				<SettingsGear blockId={blockId} />
				<LockToggle
					isLocked={isLocked}
					toggleLock={() => setIsLocked((b) => !b)}
				/>
			</div>
		</div>
	);
};

const Pagination = ({
	totalRows,
	rowsPerPage,
	currentPage,
	setCurrentPage,
}: {
	totalRows: number;
	rowsPerPage: number;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
	const totalPages = Math.ceil(totalRows / rowsPerPage);

	const goPrev = () => {
		if (currentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	};

	const goFirst = () => {
		if (currentPage > 1) {
			setCurrentPage(1);
		}
	};

	const goNext = () => {
		if (currentPage < totalPages) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	const goLast = () => {
		if (currentPage < totalPages) {
			setCurrentPage(totalPages);
		}
	};

	return (
		<div className="flex items-center justify-center">
			<div onClick={goFirst} className="clickable-icon w-fit">
				<ChevronFirst className="svg-icon" />
			</div>
			<div onClick={goPrev} className="clickable-icon w-fit">
				<ChevronLeft className="svg-icon" />
			</div>
			<span className="px-1">{`${currentPage} of ${totalPages}`}</span>
			<div onClick={goNext} className="clickable-icon w-fit">
				<ChevronRight className="svg-icon" />
			</div>
			<div onClick={goLast} className="clickable-icon w-fit">
				<ChevronLast className="svg-icon" />
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
	propertyName,
	className,
	hideFileLink,
}: {
	propertyName: string;
	className?: ClassValue;
	hideFileLink: boolean;
}) => {
	const { ctx, plugin, aliasObj } = useBlock();
	const propName = aliasObj[propertyName] ?? propertyName;
	// TODO check for different prop name set in dataview settings?
	const isFileProp =
		propName.toLowerCase() === FILE || propName === "file.link";
	const prePropertyType = isFileProp ? FILE : getPropertyType(propName);
	const propertyType = prePropertyType ?? "inline";
	if (isFileProp && hideFileLink) return;
	return (
		<th className={cn(className)}>
			<div className="flex h-full w-full items-center">
				<Markdown
					app={plugin.app}
					filePath={ctx.sourcePath}
					plainText={propertyName}
				/>
				&nbsp;
				<div
					aria-label={propertyType}
					className="flex items-center justify-center"
				>
					<PropertyIcon propertyType={propertyType} />
				</div>
			</div>
		</th>
	);
};

type TdProps<T> = {
	propertyName: string;
	propertyValue: T;
	className?: ClassValue;
	hideFileLink: boolean;
	filePath: string;
	isLocked: boolean;
};
const Td = (props: TdProps<unknown>) => {
	const { propertyValue, propertyName, className, hideFileLink, filePath } =
		props;
	const { ctx, plugin, aliasObj } = useBlock();
	const propName = aliasObj[propertyName] ?? propertyName;
	// TODO check for different prop name set in dataview settings?
	const isFileProp =
		propName.toLowerCase() === FILE || propName === "file.link";
	const prePropertyType = isFileProp ? FILE : getPropertyType(propName);
	const propertyType = checkForInlineField(
		propName,
		filePath,
		// @ts-ignore
		plugin.app.plugins.plugins.dataview.api,
	).success
		? "inline"
		: prePropertyType;

	const propValue = tryToMarkdownLink(propertyValue);

	if (isFileProp && hideFileLink) return;

	return (
		<td className={cn(className)}>
			<div className="flex h-full w-full">
				<InputSwitch
					{...props}
					propertyName={propName}
					propertyValue={propValue}
					propertyType={propertyType}
				/>
			</div>
		</td>
	);

	// return (
	// 	<td className={cn(className)}>
	// 		<div className="flex h-full w-full">
	// 			{propertyType === "text" || isFileProp ? (
	// 				<TextInput {...props} propertyName={propName}>
	// 					{content}
	// 				</TextInput>
	// 			) : isFileProp ? (
	// 				<Markdown
	// 					app={plugin.app}
	// 					filePath={ctx.sourcePath}
	// 					plainText={children}
	// 				/>
	// 			) : (
	// 				<div>{content}</div>
	// 			)}
	// 		</div>
	// 	</td>
	// );
};

type InputSwitchProps<T> = {
	propertyType: string;
} & TdProps<T>;
const InputSwitch = (props: InputSwitchProps<unknown>) => {
	const { plugin, ctx } = useBlock();
	const { propertyValue, propertyType } = props;
	if (props.propertyType === FILE) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={propertyValue as string}
				className="[&_*]:my-0"
			/>
		);
	}

	// TODO if value is falsey, use property type to render input
	// it CANNOT be inline if it is falsey
	if (!propertyValue) {
		console.log(
			"got propertyType: ",
			propertyType,
			"for prop: ",
			propertyValue,
		);
		switch (propertyType) {
			case "aliases":
			case "text":
			case "object": {
				return <StringInput {...(props as InputSwitchProps<string>)} />;
			}
			case "checkbox": {
				return (
					<BooleanInput {...(props as InputSwitchProps<boolean>)} />
				);
			}
			case "date": {
				return (
					<DateTimeInput
						hasTime={false}
						{...(props as InputSwitchProps<DateTime>)}
					/>
				);
			}
			case "datetime": {
				return (
					<DateTimeInput
						hasTime={true}
						{...(props as InputSwitchProps<DateTime>)}
					/>
				);
			}
			case "multitext": {
				return (
					<ArrayInput
						{...(props as InputSwitchProps<(string | number)[]>)}
					/>
				);
			}
			case "number": {
				return <NumberInput {...(props as InputSwitchProps<number>)} />;
			}
			case "tags": {
				return (
					<ArrayInput
						{...(props as InputSwitchProps<(string | number)[]>)}
					/>
				);
			}
			default: {
				return <StringInput {...(props as InputSwitchProps<string>)} />;
			}
		}
	}

	// Dataview will sometimes parse property values to a different type than what is defined in the metadataTypeManager
	// As well, inline fields won't have a type and frontmatter objects will be considered the default of text
	// So the type of input to render is determined from the value's actual type instead of the property type itself
	console.log(
		"property type: ",
		typeof propertyValue,
		"for: ",
		propertyValue,
	);
	switch (typeof propertyValue) {
		case "string":
			return <StringInput {...(props as InputSwitchProps<string>)} />;
		case "number":
			return <NumberInput {...(props as InputSwitchProps<number>)} />;
		case "object":
			if (Array.isArray(propertyValue)) {
				return (
					<ArrayInput
						{...(props as InputSwitchProps<(string | number)[]>)}
					/>
				);
			}

			if (DateTime.isDateTime(propertyValue)) {
				const hasTime = isDateWithTime(propertyValue);
				return (
					<DateTimeInput
						hasTime={hasTime}
						{...(props as InputSwitchProps<DateTime>)}
					/>
				);
			}
			return <div>{"[Object object]"}</div>;

		case "boolean":
			return <BooleanInput {...(props as InputSwitchProps<boolean>)} />;
		default:
			return (
				<Markdown
					app={plugin.app}
					filePath={ctx.sourcePath}
					plainText={(propertyValue as string) ?? "null"}
					className="h-full min-h-4 w-full break-keep [&_*]:my-0"
				/>
			);
	}
};

const StringInput = (props: InputSwitchProps<string>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { ctx, plugin } = useBlock();
	const [isEditing, setIsEditing] = useState(false);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={propertyValue ?? dvRenderNullAs}
				className="h-full min-h-4 w-full break-keep [&_*]:my-0 [&_img]:!max-w-[unset]"
				onClick={() => {
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	return (
		<input
			type="text"
			defaultValue={propertyValue}
			autoFocus
			onBlur={async (e) => {
				// console.log(e.target.value);
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

const NumberInput = (props: InputSwitchProps<number>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { ctx, plugin } = useBlock();
	const [isEditing, setIsEditing] = useState(false);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={propertyValue?.toString() ?? dvRenderNullAs}
				className="h-full min-h-4 w-full break-keep [&_*]:my-0"
				onClick={() => {
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	return (
		<input
			type="number"
			defaultValue={propertyValue}
			autoFocus
			onBlur={async (e) => {
				const num = Number(e.target.value);
				if (Number.isNaN(num)) return;
				await updateMetaData(propertyName, num, filePath, plugin);
				setIsEditing(false);
			}}
		/>
	);
};

const ArrayInput = (props: InputSwitchProps<(string | number)[]>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { plugin } = useBlock();

	const updateProperty = async (
		itemIndex: number,
		newValue: string | number,
		allowFalsey?: boolean,
	) => {
		const newArrayValue = [...propertyValue];
		newArrayValue[itemIndex] = newValue;
		const filtered = allowFalsey
			? newArrayValue
			: newArrayValue.filter((v) => !!v);
		await updateMetaData(propertyName, filtered, filePath, plugin);
	};

	return (
		<ul className="m-0 flex flex-col gap-1 p-0">
			{propertyValue?.map((item, i) => (
				<li key={i} className="flex">
					{"- "}
					<ArrayInputItem
						{...props}
						itemValue={item}
						itemIndex={i}
						updateProperty={updateProperty}
					/>
				</li>
			))}
			<li>
				<div
					className={`clickable-icon w-fit ${isLocked && "cursor-not-allowed opacity-50"}`}
					aria-label="New item"
					onClick={async () => {
						if (isLocked) return;
						await updateProperty(propertyValue.length, "", true);
					}}
				>
					<Plus className="svg-icon" />
				</div>
			</li>
		</ul>
	);
};

const ArrayInputItem = (
	props: InputSwitchProps<(string | number)[]> & {
		itemValue: string | number;
		itemIndex: number;
		updateProperty: (
			itemIndex: number,
			newValue: string | number,
		) => Promise<void>;
	},
) => {
	const { isLocked, itemValue, itemIndex, propertyType, updateProperty } =
		props;
	const { ctx, plugin } = useBlock();
	const [isEditing, setIsEditing] = useState(false);
	const plainText = tryToMarkdownLink(itemValue);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={
					propertyType === "tags" ? "#" + plainText : plainText
				}
				className="min-h-4 w-full [&_*]:my-0"
				onClick={() => {
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	return (
		<input
			type="text"
			defaultValue={itemValue}
			autoFocus
			onBlur={async (e) => {
				// console.log(e.target.value);
				await updateProperty(itemIndex, e.target.value);
				setIsEditing(false);
			}}
		/>
	);
};

const BooleanInput = (props: InputSwitchProps<boolean>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { plugin } = useBlock();

	return (
		<input
			type="checkbox"
			disabled={!!isLocked}
			defaultChecked={!!propertyValue}
			className={isLocked && "opacity-50"}
			onClick={(e) => {
				updateMetaData(
					propertyName,
					e.currentTarget.checked,
					filePath,
					plugin,
				);
			}}
		/>
	);
};

const DateInput = (props: InputSwitchProps<DateTime>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { ctx, plugin } = useBlock();
	const [isEditing, setIsEditing] = useState(false);
	const [{ formattedDate, inputDate }, setDateStrings] = useState({
		formattedDate: null,
		inputDate: null,
	});
	const locale = currentLocale();
	// @ts-ignore
	const { defaultDateFormat } = app.plugins.plugins?.dataview?.settings;

	useEffect(() => {
		if (!DateTime.isDateTime(propertyValue)) {
			setDateStrings({
				formattedDate: null,
				inputDate: null,
			});
		}
		if (DateTime.isDateTime(propertyValue)) {
			const formattedDate = propertyValue
				.toLocal()
				.toFormat(defaultDateFormat, { locale });
			const inputDate = propertyValue.toLocal().toFormat("yyyy-MM-dd");
			setDateStrings({ formattedDate, inputDate });
		}
	}, [propertyValue]);

	// useEffect(
	// 	() => console.log("inputDateString: ", inputDateString),
	// 	[inputDateString],
	// );

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={formattedDate ?? dvRenderNullAs}
				className="h-full min-h-4 w-full break-keep [&_*]:my-0"
				onClick={() => {
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	return (
		<input
			type="date"
			max={"9999-12-31"}
			defaultValue={inputDate}
			autoFocus
			onBlur={async (e) => {
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

const DateTimeInput = (
	props: InputSwitchProps<DateTime> & { hasTime: boolean },
) => {
	const { propertyName, propertyValue, filePath, isLocked, hasTime } = props;
	const { ctx, plugin } = useBlock();
	const [isEditing, setIsEditing] = useState(false);
	const [{ formattedDate, inputDate }, setDateStrings] = useState({
		formattedDate: null,
		inputDate: null,
	});
	const locale = currentLocale();
	const dvSettings: {
		defaultDateTimeFormat: string;
		defaultDateFormat: string;
		// @ts-ignore
	} = app.plugins.plugins?.dataview?.settings;
	const defaultFormat = hasTime
		? dvSettings.defaultDateTimeFormat
		: dvSettings.defaultDateFormat;
	const inputFormat = hasTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd";
	const max = hasTime ? "9999-12-31T23:59" : "9999-12-31";

	useEffect(() => {
		if (!DateTime.isDateTime(propertyValue)) {
			setDateStrings({
				formattedDate: null,
				inputDate: null,
			});
		}
		if (DateTime.isDateTime(propertyValue)) {
			const formattedDate = propertyValue
				.toLocal()
				.toFormat(defaultFormat, { locale });
			const inputDate = propertyValue.toLocal().toFormat(inputFormat);
			setDateStrings({ formattedDate, inputDate });
		}
	}, [propertyValue]);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={formattedDate ?? dvRenderNullAs}
				className="h-full min-h-4 w-full break-keep [&_*]:my-0"
				onClick={() => {
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	return (
		<input
			type={hasTime ? "datetime-local" : "date"}
			defaultValue={inputDate}
			max={max}
			autoFocus
			onBlur={async (e) => {
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
