import React, { ReactNode, useEffect, useState } from "react";
import {
	SettingControl,
	SettingDescription,
	SettingInfo,
	SettingName,
	SettingRoot,
	SettingToggle,
} from "../Setting";
import { Notice } from "obsidian";
import { z } from "zod";
import { ArrowDown, ArrowUp, CircleCheck, LoaderCircle } from "lucide-react";
import { addNewKeyValues, arrayMove, removeKeys } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/Dialog";
import { usePluginSettings } from "@/stores/global";
import { useBlock } from "../BlockProvider";
import { LIST_STYLE_TYPES } from "@/lib/consts";
import {
	HORIZONTAL_ALIGNMENT,
	LOCK_EDITING,
	PAGE_SIZE,
	PAGINATION_NAV,
	SETTINGS_GEAR,
	TOTAL_RESULTS,
	VERTICAL_ALIGNMENT,
} from "@/lib/consts/toolbarComponentNames";

const StartCenterEnd = z.union([
	z.literal("start"),
	z.literal("center"),
	z.literal("end"),
]);

const TopMiddleBottom = z.union([
	z.literal("top"),
	z.literal("middle"),
	z.literal("bottom"),
]);

const Alignment = z.object({
	vertical: TopMiddleBottom,
	horizontal: StartCenterEnd,
	enabled: z.boolean(),
});

export const BlockConfigSchema = z.object({
	filePath: z.string(),
	toolbarConfig: z.array(
		z.object({
			componentName: z.string(),
			displayText: z.string(),
			enabled: z.boolean(),
		}),
	),
	toolbarPosition: z.union([
		z.literal("top"),
		z.literal("bottom"),
		z.literal("disabled"),
	]),
	tdPadding: z.number(),
	lockEditing: z.boolean(),
	listItemPrefix: z.string(),
	listVertical: z.boolean(),
	renderMarkdown: z.boolean(),
	showTypeIcons: z.boolean(),
	showNumberButtons: z.boolean(),
	showAutoComplete: z.boolean(),
	showColAndRowLabels: z.boolean(),
	useToggleForCheckbox: z.boolean(),
	pageSize: z.number(),
	currentPage: z.number(),
	queryLinkPropertyName: z.string(),
	allowImageFullSize: z.boolean(),
	verticalAlignment: StartCenterEnd,
	horizontalAlignment: StartCenterEnd,
	alignmentByType: z.object({
		text: Alignment,
		list: Alignment,
		number: Alignment,
		checkbox: Alignment,
		date: Alignment,
		datetime: Alignment,
	}),
	columnWidths: z.array(z.number()),
	columnPresets: z.array(z.union([z.string(), z.array(z.string())])),
});

export const defaultDefaultBlockConfig: z.infer<typeof BlockConfigSchema> = {
	filePath: "",
	toolbarConfig: [
		{
			componentName: SETTINGS_GEAR,
			displayText: "Settings gear",
			enabled: true,
		},
		{
			componentName: TOTAL_RESULTS,
			displayText: "Total results",
			enabled: true,
		},
		{
			componentName: PAGINATION_NAV,
			displayText: "Pagination",
			enabled: true,
		},
		{
			componentName: PAGE_SIZE,
			displayText: "Page size",
			enabled: true,
		},
		{
			componentName: LOCK_EDITING,
			displayText: "Lock editing",
			enabled: true,
		},
		{
			componentName: HORIZONTAL_ALIGNMENT,
			displayText: "Horizontal alignment",
			enabled: true,
		},
		{
			componentName: VERTICAL_ALIGNMENT,
			displayText: "Vertical alignment",
			enabled: true,
		},
	],
	toolbarPosition: "bottom",
	tdPadding: 0,
	lockEditing: false,
	listItemPrefix: "disc",
	listVertical: true,
	renderMarkdown: true,
	showTypeIcons: true,
	showNumberButtons: true,
	showAutoComplete: true,
	showColAndRowLabels: false,
	useToggleForCheckbox: false,
	pageSize: 0,
	currentPage: 1,
	queryLinkPropertyName: "",
	allowImageFullSize: false,
	verticalAlignment: "start",
	horizontalAlignment: "start",
	alignmentByType: {
		text: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		list: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		number: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		checkbox: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		date: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
		datetime: {
			vertical: "top",
			horizontal: "start",
			enabled: false,
		},
	},
	columnWidths: [],
	columnPresets: [],
};

export const PluginSettingsSchema = z.object({
	allowJs: z.boolean(),
	renderNullAs: z.string(),
	blockConfigs: z.record(BlockConfigSchema),
});

export const defaultPluginSettings: z.infer<typeof PluginSettingsSchema> = {
	allowJs: false,
	renderNullAs: "\\-",
	blockConfigs: {
		default: defaultDefaultBlockConfig,
	},
};

// export const SettingsSchema = z.object({
// 	autoSuggest: z.boolean(),
// 	renderMarkdown: z.boolean(),
// 	showNumberButtons: z.boolean(),
// 	showTypeIcons: z.boolean(),
// 	emptyValueDisplay: z.string(),
// 	queryLinksPropertyName: z.string(),
// 	cssClassName: z.string(),
// 	columnAliases: z.array(z.array(z.string(), z.string())),
// 	verticalAlignment: StartCenterEnd,
// 	horizontalAlignment: StartCenterEnd,
// 	alignmentByType: z.object({
// 		text: Alignment,
// 		list: Alignment,
// 		number: Alignment,
// 		checkbox: Alignment,
// 		date: Alignment,
// 		datetime: Alignment,
// 	}),
// });

// export type Settings = z.infer<typeof SettingsSchema>;

// export const defaultSettings: Settings = {
// 	autoSuggest: true,
// 	renderMarkdown: true,
// 	showNumberButtons: true,
// 	showTypeIcons: true,
// 	emptyValueDisplay: "-",
// 	queryLinksPropertyName: "dataedit-links",
// 	cssClassName: "",
// 	columnAliases: [["thisColumn", "showThisAlias"]],
// 	verticalAlignment: "top",
// 	horizontalAlignment: "start",
// 	alignmentByType: {
// 		text: {
// 			vertical: "top",
// 			horizontal: "start",
// 			enabled: false,
// 		},
// 		list: {
// 			vertical: "top",
// 			horizontal: "start",
// 			enabled: false,
// 		},
// 		number: {
// 			vertical: "top",
// 			horizontal: "start",
// 			enabled: false,
// 		},
// 		checkbox: {
// 			vertical: "top",
// 			horizontal: "start",
// 			enabled: false,
// 		},
// 		date: {
// 			vertical: "top",
// 			horizontal: "start",
// 			enabled: false,
// 		},
// 		datetime: {
// 			vertical: "top",
// 			horizontal: "start",
// 			enabled: false,
// 		},
// 	},
// };

// export const PluginSettings = ({
// 	plugin,
// 	savedSettings,
// }: {
// 	plugin: DataEdit;
// 	savedSettings: Settings;
// }) => {
// 	const [errors, setErrors] = useState<(string | number)[][]>();
// 	const potentialSettings = addNewKeyValues(savedSettings, defaultSettings);
// 	const potentialParsed = SettingsSchema.safeParse(potentialSettings);
// 	const [form, setForm] = useState<Settings>(potentialParsed.data);
// 	const updateForm = <T,>(key: string, value: T) => {
// 		console.log("updateForm: ", key, " ", value);
// 		setForm((prev) => ({
// 			...prev,
// 			[key]: value,
// 		}));
// 	};

// 	useEffect(() => {
// 		plugin.onExternalSettingsChange = async () => {
// 			const potentialSettings = await plugin.loadData();
// 			const preCopyForm = addNewKeyValues(
// 				potentialSettings,
// 				defaultSettings,
// 			);
// 			const copyForm = removeKeys(preCopyForm, defaultSettings);
// 			const parsed = SettingsSchema.safeParse(copyForm);
// 			if (parsed.success) {
// 				setForm(parsed.data);
// 			}
// 			if (!parsed.success) {
// 				setErrors(() =>
// 					parsed.error.issues.map(({ path, message }) => [
// 						Array.isArray(path) ? path.join(", ") : path,
// 						message,
// 					]),
// 				);
// 				parsed.error.issues.forEach(({ code, message, path, fatal }) =>
// 					console.error(`
//                 Zod validation error on Plugin Settings form\n
//                 code: ${code}
//                 message: ${message}
//                 path: ${path}
//                 fatal: ${fatal}
//                 `),
// 				);
// 			}
// 		};
// 	}, []);

// 	useEffect(() => {
// 		console.log("setForm called: ", form);
// 		// adds key/values from default if form is missing keys
// 		// useful for when new settings are added
// 		const copyForm = addNewKeyValues(form, defaultSettings);
// 		const parsed = SettingsSchema.safeParse(copyForm);
// 		if (parsed.success) {
// 			console.log("parse successful");
// 			(async () => await plugin.updateSettings(copyForm))();
// 		}
// 		if (!parsed.success) {
// 			parsed.error.issues.forEach(({ code, message, path, fatal }) =>
// 				console.error(`
//             Zod validation error on Plugin Settings form\n
//             code: ${code}\n
//             message: ${message}\n
//             path: ${path}\n
//             fatal: ${fatal}\n
//             `),
// 			);
// 		}
// 	}, [form]);

// 	return (
// 		<div className="">
// 			<h2>Dataedit Settings</h2>
// 			{/* <SettingDescription></SettingDescription> */}
// 			<div className="pb-3">
// 				<SettingDescription>
// 					Plugin repository:{" "}
// 					<a href="https://github.com/unxok/dataedit">
// 						https://github.com/unxok/dataedit
// 					</a>
// 				</SettingDescription>
// 				<SettingDescription>
// 					Dataview docs:{" "}
// 					<a href="https://blacksmithgu.github.io/obsidian-dataview/">
// 						https://blacksmithgu.github.io/obsidian-dataview/
// 					</a>
// 				</SettingDescription>
// 				<br />
// 				<div className="flex gap-2">
// 					<BuyMeCoffee />
// 					<button
// 						className="text-modifier-error hover:bg-modifier-error-hover hover:text-normal"
// 						onClick={(e) => {
// 							new ConfirmationDialog(
// 								plugin.app,
// 								"Reset settings",
// 								"Are you absolutely sure? You cannot reverse this!",
// 								"back to safety",
// 								"go for it",
// 								(b) => {
// 									if (!b) return;
// 									setForm(defaultSettings);
// 								},
// 							).open();
// 						}}
// 					>
// 						Reset to default settings
// 					</button>
// 				</div>
// 			</div>
// 			{!potentialParsed.success && (
// 				<SettingRoot>
// 					<SettingInfo>
// 						<SettingName>Invalid Settings!</SettingName>
// 						<SettingDescription>
// 							<>
// 								{errors?.map(([property, message]) => (
// 									<div key={property}>
// 										Invalid setting <code>{property}</code>:{" "}
// 										{message}
// 									</div>
// 								))}
// 							</>
// 							The only way you should be able have invalid
// 							settings would be if you:
// 							<ul>
// 								<li>
// 									You manually changed the{" "}
// 									<code>data.json</code> file of this plugin
// 								</li>
// 								<li>
// 									Another plugin changed this plugins settings
// 									incorrectly
// 								</li>
// 								<li>
// 									There's a bug in this plugin causing an
// 									invalid setting value
// 								</li>
// 							</ul>
// 						</SettingDescription>
// 					</SettingInfo>
// 				</SettingRoot>
// 			)}
// 			{potentialParsed.success && (
// 				<>
// 					<AutoSuggest
// 						value={form.autoSuggest}
// 						onChange={(b) => updateForm("autoSuggest", b)}
// 					/>
// 					<RenderMarkdown
// 						value={form.renderMarkdown}
// 						onChange={(b) => updateForm("renderMarkdown", b)}
// 					/>
// 					<ShowNumberButtons
// 						value={form.showNumberButtons}
// 						onChange={(b) => updateForm("showNumberButtons", b)}
// 					/>
// 					<ShowTypeIcons
// 						value={form.showTypeIcons}
// 						onChange={(b) => updateForm("showTypeIcons", b)}
// 					/>
// 					<EmptyValueDisplay
// 						value={form.emptyValueDisplay}
// 						onChange={(e) =>
// 							updateForm("emptyValueDisplay", e.target.value)
// 						}
// 					/>
// 					<QueryLinksPropertyName
// 						value={form.queryLinksPropertyName}
// 						onChange={(e) =>
// 							updateForm("queryLinksPropertyName", e.target.value)
// 						}
// 					/>
// 					<CssClassName
// 						app={plugin.app}
// 						value={form.cssClassName}
// 						onChange={(e) =>
// 							updateForm("cssClassName", e.target.value)
// 						}
// 						onSelect={(v) =>
// 							updateForm(
// 								"cssClassName",
// 								form.cssClassName + " " + v,
// 							)
// 						}
// 					/>
// 					<VerticalAlignment
// 						app={plugin.app}
// 						value={form.verticalAlignment}
// 						onChange={(e) =>
// 							updateForm("verticalAlignment", e.target.value)
// 						}
// 					/>
// 					<HorizontalAlignment
// 						app={plugin.app}
// 						value={form.horizontalAlignment}
// 						onChange={(e) =>
// 							updateForm("horizontalAlignment", e.target.value)
// 						}
// 					/>
// 					<AlignmentByType
// 						app={plugin.app}
// 						value={form.alignmentByType}
// 						updateForm={updateForm}
// 					/>
// 					<ColumnAliases
// 						app={plugin.app}
// 						value={form.columnAliases}
// 						updateForm={updateForm}
// 					/>
// 				</>
// 			)}
// 		</div>
// 	);
// };

export const BlockConfig = ({
	id,
	filePath,
	open,
	setOpen,
	hideGhLinks,
}: {
	id: string;
	filePath: string;
	open: boolean;
	setOpen: (b: boolean) => void;
	hideGhLinks?: boolean;
	// onChange: (bc: z.infer<typeof PluginSettingsSchema>) => void;
}) => {
	const { plugin } = useBlock();
	// const { blockConfigs } = plugin.settings;
	const { settings, setSettings } = usePluginSettings();
	if (!settings)
		throw new Error(
			"Tried opening block config when settings are undefined. This should be impossible because App initialization should have set it",
		);
	const { blockConfigs } = settings;
	const existingConfig = blockConfigs[id] ?? blockConfigs["default"];
	const defaultForm = existingConfig ?? defaultDefaultBlockConfig;
	if (defaultForm.filePath) {
		if (defaultForm.filePath !== filePath) {
			new Notice(
				"Error: duplicate id found, please change it and try again",
			);
			return;
		}
	}
	const [form, setForm] = useState({ ...defaultForm, filePath, id });
	const [isSaving, setIsSaving] = useState(false);
	const updateForm = <T extends keyof typeof form>(
		key: T,
		value: (typeof form)[T],
	) => {
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	useEffect(() => {
		setIsSaving(true);
		(async () => {
			const newSettings = await plugin.updateBlockConfig(id, form);
			setSettings(() => newSettings);
			// console.log("newSettings: ", newSettings);
			setIsSaving(false);
		})();
	}, [form]);

	// const debouncer = debounce(
	// async (newForm: typeof form) => {
	// 	const newSettings = await plugin.updateBlockConfig(id, newForm);
	// 	setSettings(() => newSettings);
	// 	console.log("newSettings: ", newSettings);
	// 	setIsSaving(false);
	// },
	// 	500,
	// 	true,
	// );

	// useEffect(() => {
	// 	setIsSaving(true);
	// 	debouncer(form);
	// }, [form]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="vertical-tab-content">
				<DialogHeader>
					<DialogTitle>Dataedit block config</DialogTitle>
					<DialogDescription className="flex flex-col gap-2">
						<span className="flex flex-col">
							<span>
								id:&nbsp;
								<span className="text-normal">{id}</span>
							</span>
							<span className="flex">
								note:&nbsp;
								<span className="text-normal">{filePath}</span>
							</span>
						</span>
						{!hideGhLinks && (
							<span className="flex flex-col">
								<span>
									Plugin repository:{" "}
									<a href="https://github.com/unxok/dataedit">
										github.com/unxok/dataedit
									</a>
								</span>
								<span>
									Dataview docs:{" "}
									<a href="https://blacksmithgu.github.io/obsidian-dataview/">
										blacksmithgu.github.io/obsidian-dataview/
									</a>
								</span>
							</span>
						)}
					</DialogDescription>
				</DialogHeader>
				<SettingDescription className="py-3">
					{isSaving && (
						<div className="text-error">
							Saving config{" "}
							<LoaderCircle
								className="animate-spin"
								size={"1em"}
							/>
						</div>
					)}
					{!isSaving && (
						<div className="text-success">
							Config saved <CircleCheck size={"1em"} />
						</div>
					)}
					<details>
						<summary>Actions</summary>
						<button>Export</button>
						<button>Import</button>
						<button
							onClick={() =>
								setForm({
									...defaultDefaultBlockConfig,
									id: form.id,
									filePath: form.filePath,
								})
							}
						>
							Reset
						</button>
					</details>
				</SettingDescription>
				<ToolbarSetting items={form.toolbarConfig} setForm={setForm} />
				<StandardSetting
					title={"Toolbar position"}
					description={
						"Set whether the position of the toolbar or disable it entirely.\n\nNote: if disabled, the settings gear will still be present"
					}
					control={
						<select
							className="dropdown"
							defaultValue={form.toolbarPosition}
							onChange={(v) =>
								updateForm(
									"toolbarPosition",
									v.target
										.value as typeof form.toolbarPosition,
								)
							}
						>
							<option value="top">Top</option>
							<option value="bottom">Bottom</option>
							<option value="disabled">disabled</option>
						</select>
					}
				/>
				<TdPaddingSetting
					tdPadding={form.tdPadding}
					updateForm={(num: number) => updateForm("tdPadding", num)}
				/>
				<StandardSetting
					title={"Auto suggest"}
					description={
						"Automatically suggest values from the existing values used for that property.\nOnly works on Text and Multitext."
					}
					control={
						<SettingToggle
							checked={form.showAutoComplete}
							onCheckedChange={(b) =>
								updateForm("showAutoComplete", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Number buttons"}
					description={
						"Show buttons below number type table cells that let you add, substract, or enter an expression."
					}
					control={
						<SettingToggle
							checked={form.showNumberButtons}
							onCheckedChange={(b) =>
								updateForm("showNumberButtons", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Type icons"}
					description={
						"Show an icon next to each header representing the set type of that property. Inline and nested properties have a special symbol.\n\nTip: For custom icons, turn this off and use the Iconize plugin to set an icon in the column alias."
					}
					control={
						<SettingToggle
							checked={form.showTypeIcons}
							onCheckedChange={(b) =>
								updateForm("showTypeIcons", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Render markdown"}
					description={
						"Render markdown as HTML.\n\nNote: this only works in text, multitext, inline, and nested property types.\n\nAnother note: This is only rendered when not currently editing the table cell."
					}
					control={
						<SettingToggle
							checked={form.renderMarkdown}
							onCheckedChange={(b) =>
								updateForm("renderMarkdown", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Allow full size images"}
					description={
						"Allows image embeds to grow to their actual size."
					}
					control={
						<SettingToggle
							checked={form.allowImageFullSize}
							onCheckedChange={(b) =>
								updateForm("allowImageFullSize", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Column and Row Labels"}
					description={
						"Shows excel/sheets like labels for column and row numbers."
					}
					control={
						<SettingToggle
							checked={form.showColAndRowLabels}
							onCheckedChange={(b) =>
								updateForm("showColAndRowLabels", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Lock editing"}
					description={
						"Lock the table from being able to be edited.\nWhen locked, links and tags are clickable."
					}
					control={
						<SettingToggle
							checked={form.lockEditing}
							onCheckedChange={(b) =>
								updateForm("lockEditing", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Use toggle for checkbox"}
					description={
						"Uses toggles instead of checkboxes for checkbox type properties."
					}
					control={
						<SettingToggle
							checked={form.useToggleForCheckbox}
							onCheckedChange={(b) =>
								updateForm("useToggleForCheckbox", b)
							}
						/>
					}
				/>
				<StandardSetting
					title={"Page size"}
					description={"The number of results to display per page."}
					control={
						<input
							defaultValue={form.pageSize}
							placeholder="∞"
							type="number"
							step={1}
							onBlur={(e) => {
								const possibleNum = Number(e.target.value);
								const num = Number.isNaN(possibleNum)
									? 0
									: possibleNum;
								updateForm("pageSize", num);
							}}
						/>
					}
				/>
				{/* <StandardSetting
					title={"Query links property name"}
					description={
						"If set, will cause Dataedit blocks to update that property name with the links for the queried notes.\nThis will cause queried notes to show in graph view"
					}
					control={
						<input
							defaultValue={form.queryLinkPropertyName}
							placeholder="unset"
							type="text"
							onBlur={(e) =>
								updateForm(
									"queryLinkPropertyName",
									e.target.value,
								)
							}
						/>
					}
				/> */}
				<StandardSetting
					title={"List item prefix"}
					description={
						<>
							<span>
								What symbol to show prefixed to list items
								within multitext properties.
							</span>
							<ul
								style={{
									listStyleType: form.listItemPrefix,
								}}
							>
								<li>item</li>
								<li>another item</li>
								<li>and one more item</li>
							</ul>
						</>
					}
					control={
						<select
							className="dropdown"
							defaultValue={form.listItemPrefix}
							onChange={(e) => {
								updateForm(
									"listItemPrefix",
									e.currentTarget.value,
								);
							}}
						>
							{LIST_STYLE_TYPES.map((v, i) => (
								<option key={i} value={v}>
									{v}
								</option>
							))}
						</select>
					}
				/>
				<StandardSetting
					title={"Horizontal alignment"}
					description={"Align table cells horizontally"}
					control={
						<select
							className="dropdown"
							defaultValue={form.horizontalAlignment}
							onChange={(e) => {
								let a = "start";
								const { value } = e.currentTarget;
								if (
									["start", "center", "end"].includes(value)
								) {
									a = value;
								}
								updateForm(
									"horizontalAlignment",
									a as "start" | "center" | "end",
								);
							}}
						>
							<option value="start">Left</option>
							<option value="center">Center</option>
							<option value="end">Right</option>
						</select>
					}
				/>
				<StandardSetting
					title={"Vertical alignment"}
					description={"Align table cells vertically"}
					control={
						<select
							className="dropdown"
							defaultValue={form.verticalAlignment}
							onChange={(e) => {
								let a = "left";
								const { value } = e.currentTarget;
								if (
									["start", "center", "end"].includes(value)
								) {
									a = value;
								}
								updateForm(
									"verticalAlignment",
									a as "start" | "center" | "end",
								);
							}}
						>
							<option value="start">Top</option>
							<option value="center">Middle</option>
							<option value="end">Bottom</option>
						</select>
					}
				/>
			</DialogContent>
		</Dialog>
	);
};

const StandardSetting = ({
	title,
	description,
	control,
}: {
	title: ReactNode;
	description: ReactNode;
	control: ReactNode;
}) => (
	<SettingRoot>
		<SettingInfo>
			<SettingName>{title}</SettingName>
			<SettingDescription className="whitespace-pre-line">
				{description}
			</SettingDescription>
		</SettingInfo>
		<SettingControl>{control}</SettingControl>
	</SettingRoot>
);

const ToolbarSetting = ({
	items,
	setForm,
}: {
	items: z.infer<typeof BlockConfigSchema>["toolbarConfig"];
	setForm: React.Dispatch<
		React.SetStateAction<z.infer<typeof BlockConfigSchema>>
	>;
}) => {
	//
	return (
		<SettingRoot className="flex-col justify-start gap-4">
			<SettingInfo className="flex w-full flex-col justify-start">
				<SettingName>Toolbar configuration</SettingName>
				<SettingDescription className="whitespace-pre-line">
					Select and reorder the items to show in the toolbar of the
					table
				</SettingDescription>
			</SettingInfo>
			<div className="flex w-full flex-col gap-3">
				{items.map(({ componentName, displayText, enabled }, i) => (
					<div key={i} className="flex items-center gap-1">
						<input
							type="checkbox"
							defaultChecked={enabled}
							className="disabled:opacity-50 disabled:hover:cursor-not-allowed"
							disabled={componentName === SETTINGS_GEAR}
							onChange={(e) => {
								setForm((prev) => {
									const copy = [...prev.toolbarConfig];
									copy[i].enabled = e.target.checked;
									return {
										...prev,
										toolbarConfig: [...copy],
									};
								});
							}}
						/>
						<div>{displayText}</div>
						<div className="flex">
							<div
								className="clickable-icon"
								onClick={() => {
									if (i === 0) return;
									setForm((prev) => {
										const copy = [...prev.toolbarConfig];
										return {
											...prev,
											toolbarConfig: arrayMove(
												copy,
												i,
												i - 1,
											),
										};
									});
								}}
							>
								<ArrowUp className="svg-icon" />
							</div>
							<div
								className="clickable-icon"
								onClick={() => {
									setForm((prev) => {
										const copy = [...prev.toolbarConfig];
										if (i === copy.length - 1) return;
										return {
											...prev,
											toolbarConfig: arrayMove(
												copy,
												i,
												i + 1,
											),
										};
									});
								}}
							>
								<ArrowDown className="svg-icon" />
							</div>
						</div>
					</div>
				))}
			</div>
			{/* <SettingControl>
				<input type="text" />
			</SettingControl> */}
		</SettingRoot>
	);
};

const TdPaddingSetting = ({
	tdPadding,
	updateForm,
}: {
	tdPadding: number;
	updateForm: (num: number) => void;
}) => {
	const [value, setValue] = useState(tdPadding);

	const update = (
		e:
			| React.MouseEvent<HTMLInputElement, MouseEvent>
			| React.FocusEvent<HTMLInputElement, Element>,
	) => {
		const n = Number(e.currentTarget.value);
		const num = Number.isNaN(n) || n < 0 ? 0 : n;
		updateForm(num);
	};

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const n = Number(e.currentTarget.value);
		const num = Number.isNaN(n) || n < 0 ? 0 : n;
		setValue(num);
	};

	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>Table cell padding</SettingName>
				<SettingDescription className="whitespace-pre-line">
					Override the default padding for table cells. Leave as 0 to
					use the default padding from Obsidian or your theme.
				</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<div className="flex flex-col gap-4">
					<input
						type="range"
						min={0}
						max={50}
						value={value}
						onChange={onChange}
						onMouseUp={update}
					/>
					<div className="flex items-center gap-3">
						<input
							placeholder="auto"
							type="number"
							value={value}
							min={0}
							max={50}
							onChange={onChange}
							onBlur={update}
						/>
						<span>px</span>
					</div>
				</div>
			</SettingControl>
		</SettingRoot>
	);
};

// export const BlockSettings = ({
// 	plugin,
// 	savedSettings,
// 	ctx,
// 	query,
// 	open,
// 	onOpenChange,
// }: {
// 	plugin: DataEdit;
// 	savedSettings: Settings;
// 	ctx: MarkdownPostProcessorContext;
// 	query: string;
// 	open: boolean;
// 	onOpenChange: (b: boolean) => void;
// }) => {
// 	const [errors, setErrors] = useState<(string | number)[][]>();
// 	const prePotentialSettings = addNewKeyValues(
// 		savedSettings,
// 		plugin.settings,
// 	);
// 	const potentialSettings = addNewKeyValues(
// 		prePotentialSettings,
// 		defaultSettings,
// 	);
// 	const potentialParsed = SettingsSchema.safeParse(potentialSettings);
// 	const [form, setForm] = useState<Settings>(potentialParsed.data);
// 	const [dialog, setDialog] = useState({ open: false, type: "" });
// 	const updateForm = <T,>(key: string, value: T) => {
// 		console.log("updateForm: ", key, " ", value);
// 		setForm((prev) => ({
// 			...prev,
// 			[key]: value,
// 		}));
// 	};

// 	useEffect(() => console.log("set form called: ", form), [form]);

// 	const updateConfig = async (newConfig: string) => {
// 		const f = plugin.app.vault.getFileByPath(ctx.sourcePath);
// 		const contents = await plugin.app.vault.read(f);
// 		const contentArr = contents.split("\n");
// 		// @ts-ignore
// 		const { lineStart, lineEnd } = ctx.getSectionInfo(ctx.el);
// 		const preBlockContent = contentArr.slice(0, lineStart);
// 		const postBlockContent = contentArr.slice(lineEnd + 1);
// 		// console.log("pre: ", preBlockContent);
// 		// console.log("post: ", postBlockContent);
// 		const newContent = `${preBlockContent.join("\n")}\n\`\`\`dataedit\n${query}\n---\n${newConfig}\`\`\`\n${postBlockContent.join("\n")}`;
// 		await plugin.app.vault.modify(f, newContent);
// 	};

// 	// useEffect(() => {
// 	// 	// console.log("setForm called: ", form);
// 	// 	// adds key/values from default if form is missing keys
// 	// 	// useful for when new settings are added
// 	// 	const copyForm = addNewKeyValues(form, defaultSettings);
// 	// 	const parsed = SettingsSchema.safeParse(copyForm);
// 	// 	if (parsed.success) {
// 	// 		console.log("parse successful");
// 	// 		(async () => await plugin.updateSettings(copyForm))();
// 	// 	}
// 	// 	if (!parsed.success) {
// 	// 		parsed.error.issues.forEach(({ code, message, path, fatal }) =>
// 	// 			console.error(`
// 	//         Zod validation error on Plugin Settings form\n
// 	//         code: ${code}\n
// 	//         message: ${message}\n
// 	//         path: ${path}\n
// 	//         fatal: ${fatal}\n
// 	//         `),
// 	// 		);
// 	// 	}
// 	// }, [form]);

// 	return (
// 		<DialogRoot open={open} onOpenChange={onOpenChange} modal={false}>
// 			<DialogContent className="vertical-tab-content">
// 				<DialogClose />
// 				<h2>Dataedit Settings for block</h2>
// 				<div
// 					className="callout overflow-visible"
// 					data-callout="caution"
// 					data-callout-metadata
// 					data-callout-fold
// 				>
// 					<div className="callout-title">
// 						<div className="callout-icon">
// 							<TriangleAlert />
// 						</div>
// 						<div className="callout-title-inner">Caution</div>
// 					</div>
// 					<div className="callout-content">
// 						<p>Remember to press save at the bottom!</p>
// 					</div>
// 				</div>
// 				<div className="pb-3">
// 					<SettingDescription>
// 						Plugin repository:{" "}
// 						<a href="https://github.com/unxok/dataedit">
// 							https://github.com/unxok/dataedit
// 						</a>
// 					</SettingDescription>
// 					<SettingDescription>
// 						Dataview docs:{" "}
// 						<a href="https://blacksmithgu.github.io/obsidian-dataview/">
// 							https://blacksmithgu.github.io/obsidian-dataview/
// 						</a>
// 					</SettingDescription>
// 					<br />
// 					<div className="flex gap-2">
// 						<button
// 							className="text-modifier-error hover:bg-modifier-error-hover hover:text-normal"
// 							onClick={() =>
// 								setDialog({ open: true, type: "plugin" })
// 							}
// 						>
// 							Copy from plugin settings
// 						</button>
// 						{dialog.type === "plugin" && (
// 							<DialogRoot
// 								open={dialog.open}
// 								onOpenChange={(b) =>
// 									setDialog({ open: false, type: "" })
// 								}
// 							>
// 								<DialogContent>
// 									<DialogClose />
// 									<DialogTitle>
// 										Copy from plugin settings
// 									</DialogTitle>
// 									<DialogDescription>
// 										Are you absolutely sure? You cannot
// 										reverse this!
// 									</DialogDescription>
// 									<div className="flex w-full items-center justify-end gap-3">
// 										<button
// 											onClick={() =>
// 												setDialog({
// 													open: false,
// 													type: "",
// 												})
// 											}
// 										>
// 											back to safety
// 										</button>
// 										<button
// 											className="bg-accent text-on-accent"
// 											onClick={() => {
// 												setForm(plugin.settings);
// 												setDialog({
// 													open: false,
// 													type: "",
// 												});
// 											}}
// 										>
// 											go for it
// 										</button>
// 									</div>
// 								</DialogContent>
// 							</DialogRoot>
// 						)}
// 						<button
// 							className="text-modifier-error hover:bg-modifier-error-hover hover:text-normal"
// 							onClick={() =>
// 								setDialog({ open: true, type: "default" })
// 							}
// 						>
// 							Reset to default settings
// 						</button>
// 						{dialog.type === "default" && (
// 							<DialogRoot
// 								open={dialog.open}
// 								onOpenChange={(b) =>
// 									setDialog({ open: false, type: "" })
// 								}
// 							>
// 								<DialogContent>
// 									<DialogClose />
// 									<DialogTitle>
// 										Copy from default settings
// 									</DialogTitle>
// 									<DialogDescription>
// 										Are you absolutely sure? You cannot
// 										reverse this!
// 									</DialogDescription>
// 									<div className="flex w-full items-center justify-end gap-3">
// 										<button
// 											onClick={() =>
// 												setDialog({
// 													open: false,
// 													type: "",
// 												})
// 											}
// 										>
// 											back to safety
// 										</button>
// 										<button
// 											className="bg-accent text-on-accent"
// 											onClick={() => {
// 												setForm(defaultSettings);
// 												setDialog({
// 													open: false,
// 													type: "",
// 												});
// 											}}
// 										>
// 											go for it
// 										</button>
// 									</div>
// 								</DialogContent>
// 							</DialogRoot>
// 						)}
// 					</div>
// 				</div>
// 				{!potentialParsed.success && (
// 					<SettingRoot>
// 						<SettingInfo>
// 							<SettingName>Invalid Settings!</SettingName>
// 							<SettingDescription>
// 								<>
// 									{errors?.map(([property, message]) => (
// 										<div key={property}>
// 											Invalid setting{" "}
// 											<code>{property}</code>: {message}
// 										</div>
// 									))}
// 								</>
// 								The only way you should be able have invalid
// 								settings would be if you:
// 								<ul>
// 									<li>
// 										You manually changed the{" "}
// 										<code>data.json</code> file of this
// 										plugin
// 									</li>
// 									<li>
// 										Another plugin changed this plugins
// 										settings incorrectly
// 									</li>
// 									<li>
// 										There's a bug in this plugin causing an
// 										invalid setting value
// 									</li>
// 								</ul>
// 							</SettingDescription>
// 						</SettingInfo>
// 					</SettingRoot>
// 				)}
// 				{potentialParsed.success && (
// 					<>
// 						<AutoSuggest
// 							value={form.autoSuggest}
// 							onChange={(b) => updateForm("autoSuggest", b)}
// 						/>
// 						<RenderMarkdown
// 							value={form.renderMarkdown}
// 							onChange={(b) => updateForm("renderMarkdown", b)}
// 						/>
// 						<ShowNumberButtons
// 							value={form.showNumberButtons}
// 							onChange={(b) => updateForm("showNumberButtons", b)}
// 						/>
// 						<ShowTypeIcons
// 							value={form.showTypeIcons}
// 							onChange={(b) => updateForm("showTypeIcons", b)}
// 						/>
// 						<EmptyValueDisplay
// 							value={form.emptyValueDisplay}
// 							onChange={(e) =>
// 								updateForm("emptyValueDisplay", e.target.value)
// 							}
// 						/>
// 						<QueryLinksPropertyName
// 							value={form.queryLinksPropertyName}
// 							onChange={(e) =>
// 								updateForm(
// 									"queryLinksPropertyName",
// 									e.target.value,
// 								)
// 							}
// 						/>
// 						<CssClassName
// 							app={plugin.app}
// 							value={form.cssClassName}
// 							onChange={(e) =>
// 								updateForm("cssClassName", e.target.value)
// 							}
// 							onSelect={(v) =>
// 								updateForm(
// 									"cssClassName",
// 									form.cssClassName + " " + v,
// 								)
// 							}
// 						/>
// 						<VerticalAlignment
// 							app={plugin.app}
// 							value={form.verticalAlignment}
// 							onChange={(e) =>
// 								updateForm("verticalAlignment", e.target.value)
// 							}
// 						/>
// 						<HorizontalAlignment
// 							app={plugin.app}
// 							value={form.horizontalAlignment}
// 							onChange={(e) =>
// 								updateForm(
// 									"horizontalAlignment",
// 									e.target.value,
// 								)
// 							}
// 						/>
// 						<AlignmentByType
// 							app={plugin.app}
// 							value={form.alignmentByType}
// 							updateForm={updateForm}
// 						/>
// 						<ColumnAliases
// 							app={plugin.app}
// 							value={form.columnAliases}
// 							updateForm={updateForm}
// 						/>
// 					</>
// 				)}
// 				<span
// 					className="flex w-full justify-end pt-4"
// 					style={{
// 						borderTop:
// 							"1px solid var(--background-modifier-border)",
// 					}}
// 				>
// 					<button
// 						className="bg-accent text-on-accent"
// 						onClick={async () => {
// 							const str = stringifyYaml(form);
// 							await updateConfig(str);
// 							onOpenChange(false);
// 						}}
// 					>
// 						save to block
// 					</button>
// 				</span>
// 			</DialogContent>
// 		</DialogRoot>
// 	);
// };

// class ConfirmationDialog extends Modal {
// 	isConfirmed: boolean;
// 	constructor(
// 		app: App,
// 		title: string,
// 		message: string,
// 		cancelText: string,
// 		confirmText: string,
// 		onClose: (isConfirmed: boolean) => void,
// 	) {
// 		super(app);
// 		this.setTitle(title);
// 		this.isConfirmed = false;
// 		const contentEl = new DocumentFragment();
// 		const messageEl = document.createElement("div");
// 		contentEl.appendChild(messageEl);
// 		messageEl.textContent = message;
// 		const buttonContainerEl = document.createElement("div");
// 		buttonContainerEl.style.display = "flex";
// 		buttonContainerEl.style.justifyContent = "end";
// 		buttonContainerEl.style.width = "100%";
// 		buttonContainerEl.style.gap = "8px";
// 		contentEl.appendChild(buttonContainerEl);
// 		const cancelEl = document.createElement("button");
// 		cancelEl.textContent = cancelText;
// 		cancelEl.onclick = () => {
// 			this.close();
// 		};
// 		buttonContainerEl.appendChild(cancelEl);
// 		const confirmEl = document.createElement("button");
// 		confirmEl.textContent = confirmText;
// 		confirmEl.style.color = "var(--text-error)";
// 		confirmEl.onclick = () => {
// 			this.isConfirmed = true;
// 			this.close();
// 		};
// 		buttonContainerEl.appendChild(confirmEl);
// 		this.setContent(contentEl);
// 		this.onClose = () => onClose(this.isConfirmed);
// 	}
// }

// const DisableToggle = ({
// 	checked,
// 	onSetTrue,
// 	onSetFalse,
// }: {
// 	checked: boolean;
// 	onSetTrue: () => void;
// 	onSetFalse: () => void;
// }) => {
// 	//
// 	return (
// 		<span className="flex w-fit items-center justify-center gap-1 py-1 text-sm">
// 			<span>Enabled</span>
// 			<input
// 				defaultChecked={checked}
// 				onChange={(e) => {
// 					if (e.target.checked) {
// 						return onSetTrue();
// 					}
// 					onSetFalse();
// 				}}
// 				type="checkbox"
// 			/>
// 		</span>
// 	);
// };

// const AutoSuggest = <T,>({
// 	value,
// 	onChange,
// }: {
// 	value: T;
// 	onChange: (value: T) => void;
// }) => (
// 	<SettingRoot>
// 		<SettingInfo>
// 			<SettingName>Auto suggest</SettingName>
// 			<SettingDescription>
// 				<div>
// 					Automatically suggest values from the existing values used
// 					for that property.
// 				</div>
// 				<br />
// 				<div className="flex items-center gap-1">
// 					<b>Note:</b>
// 					<span>this only works for text and multitext</span>
// 					<div
// 						className="flex items-center hover:cursor-help"
// 						aria-label="Obsidian's properties natively only support auto suggest on text and multitext type properties. This plugin uses that same API to get suggestions."
// 					>
// 						<CircleHelp size={"1em"} className="text-accent" />
// 					</div>
// 				</div>
// 			</SettingDescription>
// 		</SettingInfo>
// 		<SettingControl>
// 			<SettingToggle
// 				checked={value as boolean}
// 				onCheckedChange={onChange as (b: boolean) => void}
// 			/>
// 		</SettingControl>
// 	</SettingRoot>
// );

// const RenderMarkdown = <T,>({
// 	value,
// 	onChange,
// }: {
// 	value: T;
// 	onChange: (value: T) => void;
// }) => (
// 	<SettingRoot>
// 		<SettingInfo>
// 			<SettingName>Render markdown</SettingName>
// 			<SettingDescription>
// 				<div>
// 					Render markdown syntax plain text to HTML when not editing
// 				</div>
// 				<br />
// 				<div className="flex items-center gap-1">
// 					<b>Note:</b>
// 					<span>
// 						This is <i>not</i> live preview markdown.
// 					</span>
// 					<div
// 						className="flex items-center hover:cursor-help"
// 						aria-label="I have almost figured out the best way to implement live preview markdown editing, but not yet!"
// 					>
// 						<CircleHelp size={"1em"} className="text-accent" />
// 					</div>
// 				</div>
// 				<br />
// 				<div>
// 					Also, clicking links and tags will edit the cell currently
// 					rather than allowing you to follow navigation, unless the{" "}
// 					<i>only</i> thing in the cell is the link
// 				</div>
// 			</SettingDescription>
// 		</SettingInfo>
// 		<SettingControl>
// 			<SettingToggle
// 				checked={value as boolean}
// 				onCheckedChange={onChange as (b: boolean) => void}
// 			/>
// 		</SettingControl>
// 	</SettingRoot>
// );

// const ShowNumberButtons = <T,>({
// 	value,
// 	onChange,
// }: {
// 	value: T;
// 	onChange: (value: T) => void;
// }) => (
// 	<SettingRoot>
// 		<SettingInfo>
// 			<SettingName>Number buttons</SettingName>
// 			<SettingDescription>
// 				Show a minus, plus, and expression button below each input for a
// 				number type property
// 			</SettingDescription>
// 		</SettingInfo>
// 		<SettingControl>
// 			<SettingToggle
// 				checked={value as boolean}
// 				onCheckedChange={onChange as (b: boolean) => void}
// 			/>
// 		</SettingControl>
// 	</SettingRoot>
// );

// const ShowTypeIcons = <T,>({
// 	value,
// 	onChange,
// }: {
// 	value: T;
// 	onChange: (value: T) => void;
// }) => (
// 	<SettingRoot>
// 		<SettingInfo>
// 			<SettingName>Type icons</SettingName>
// 			<SettingDescription>
// 				Show an icon on each column header for the chosen type of that
// 				property
// 			</SettingDescription>
// 		</SettingInfo>
// 		<SettingControl>
// 			<SettingToggle
// 				checked={value as boolean}
// 				onCheckedChange={onChange as (b: boolean) => void}
// 			/>
// 		</SettingControl>
// 	</SettingRoot>
// );

// const EmptyValueDisplay = <T,>({
// 	value,
// 	onChange,
// }: {
// 	value: string;
// 	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }) => {
// 	return (
// 		<SettingRoot>
// 			<SettingInfo>
// 				<SettingName>Empty value display</SettingName>
// 				<SettingDescription>
// 					What to show when a property is unset, undefined, or null
// 				</SettingDescription>
// 			</SettingInfo>
// 			<SettingControl>
// 				<input type="text" value={value} onChange={onChange} />
// 			</SettingControl>
// 		</SettingRoot>
// 	);
// };

// const QueryLinksPropertyName = <T,>({
// 	value,
// 	onChange,
// }: {
// 	value: T;
// 	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }) => (
// 	<SettingRoot>
// 		<SettingInfo>
// 			<SettingName>Query links property name</SettingName>
// 			<SettingDescription>
// 				<div>
// 					The frontmatter property name for the property Dataedit
// 					tables will update with links from files returned in the
// 					query
// 				</div>
// 				<br />
// 				<div>
// 					<b>Note:</b> If you have multiple dataedit blocks, this may
// 					be updated arbitrarily. To circumvent this, set a specific
// 					property name for each block's configuration
// 				</div>
// 				<br />
// 				<div>
// 					<b>Don't want this? </b>
// 					<span>Leave as blank</span>
// 				</div>
// 			</SettingDescription>
// 		</SettingInfo>
// 		<SettingControl>
// 			<input
// 				type="text"
// 				tabIndex={0}
// 				placeholder="unset"
// 				value={value as string}
// 				onChange={onChange}
// 			/>
// 		</SettingControl>
// 	</SettingRoot>
// );

// const CssClassName = <T,>({
// 	app,
// 	value,
// 	onChange,
// 	onSelect,
// }: {
// 	app: App;
// 	value: T;
// 	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// 	onSelect: (v: string) => void;
// }) => {
// 	const measuredRef = useCallback((node: HTMLInputElement) => {
// 		if (node === null) return;
// 		new Suggest(
// 			app,
// 			node,
// 			(q) => [
// 				q,
// 				// @ts-ignore
// 				...app.metadataCache.getFrontmatterPropertyValuesForKey(
// 					"cssclasses",
// 				),
// 			],
// 			onSelect,
// 		);
// 	}, []);
// 	return (
// 		<SettingRoot>
// 			<SettingInfo>
// 				<SettingName>CSS class name</SettingName>
// 				<SettingDescription>
// 					Add additional CSS class names to the Dataedit HTML table
// 					element
// 				</SettingDescription>
// 			</SettingInfo>
// 			<SettingControl>
// 				<input
// 					type="text"
// 					tabIndex={0}
// 					placeholder="classA classB"
// 					value={value as string}
// 					onChange={onChange}
// 					ref={measuredRef}
// 				/>
// 			</SettingControl>
// 		</SettingRoot>
// 	);
// };

// const ColumnAliases = <T,>({
// 	app,
// 	value,
// 	updateForm,
// }: {
// 	app: App;
// 	value: Settings["columnAliases"];
// 	updateForm: <T>(key: string, value: T) => void;
// }) => {
// 	return (
// 		<SettingRoot className="flex flex-col gap-3">
// 			<SettingInfo>
// 				<SettingName>Column aliases</SettingName>
// 				<SettingDescription>
// 					<span>Setup aliases for frontmatter property names.</span>
// 					&nbsp;
// 					<span>
// 						Property names will be replaced by their aliases set
// 						here in the column headers of Dataedit tables.
// 					</span>
// 				</SettingDescription>
// 			</SettingInfo>
// 			<div className="flex w-full flex-col justify-end gap-3">
// 				{value.map((arr, i) => (
// 					<div
// 						key={i + "-setting-control-columnAlias"}
// 						className="flex items-center justify-end gap-1"
// 					>
// 						<SettingControl className="flex-none">
// 							<button
// 								className="group border-none bg-transparent shadow-none"
// 								onClick={() => {
// 									const newValue = value.filter(
// 										(_, k) => k !== i,
// 									);
// 									updateForm("columnAliases", newValue);
// 								}}
// 							>
// 								<X
// 									size={"1em"}
// 									className="text-faint group-hover:text-normal"
// 								/>
// 							</button>
// 							<PropertyNameInput
// 								app={app}
// 								aliasArr={value}
// 								property={arr[0]}
// 								index={i}
// 								updateForm={updateForm}
// 							/>
// 						</SettingControl>
// 						<ArrowRight size={"1em"} />
// 						<SettingControl className="flex-none">
// 							<PropertyValueInput
// 								key={i}
// 								app={app}
// 								aliasArr={value}
// 								property={arr[0]}
// 								value={arr[1]}
// 								index={i}
// 								updateForm={updateForm}
// 							/>
// 						</SettingControl>
// 					</div>
// 				))}
// 			</div>
// 			<div className="flex w-full justify-end">
// 				<button
// 					className="flex items-center"
// 					onClick={() => {
// 						const newValue = [...value, ["", ""]];
// 						updateForm("columnAliases", newValue);
// 					}}
// 				>
// 					Add new alias&nbsp;
// 					<Plus size={"1em"} />
// 				</button>
// 			</div>
// 		</SettingRoot>
// 	);
// };

// const PropertyNameInput = <T,>({
// 	app,
// 	aliasArr,
// 	property,
// 	updateForm,
// 	index,
// }: {
// 	app: App;
// 	aliasArr: Settings["columnAliases"];
// 	property: string;
// 	updateForm: <T>(key: string, value: T) => void;
// 	index: number;
// }) => {
// 	const updateFormValue = (newPropName) => {
// 		const copyAliasArr = [...aliasArr];
// 		copyAliasArr[index][0] = newPropName;
// 		updateForm("columnAliases", copyAliasArr);
// 	};
// 	const measuredRef = useCallback((node: HTMLInputElement) => {
// 		if (node === null) return;
// 		new Suggest(
// 			app,
// 			node,
// 			(q) => {
// 				const existingProps = Object.keys(
// 					// @ts-ignore
// 					app.metadataCache.getAllPropertyInfos(),
// 				).sort((a, b) => a.localeCompare(b));
// 				return [q, ...existingProps];
// 			},
// 			(v) => updateFormValue(v),
// 		);
// 	}, []);

// 	return (
// 		<input
// 			type="text"
// 			tabIndex={0}
// 			ref={measuredRef}
// 			placeholder="property name"
// 			value={property}
// 			onChange={(e) => updateFormValue(e.target.value)}
// 		/>

// 		// <SettingInput
// 		// 	app={app}
// 		// 	placeholder="property name"
// 		// 	value={property as string}
// 		// 	onChange={(e) => {
// 		// 		updateFormValue(e.target.value);
// 		// 	}}
// 		// 	getSuggestions={() =>
// 		// 		// @ts-ignore
// 		// 		Object.keys(app.metadataCache.getAllPropertyInfos()).sort(
// 		// 			(a, b) => a.localeCompare(b),
// 		// 		)
// 		// 	}
// 		// 	onSelect={(v, e) => updateFormValue(v)}
// 		// />
// 	);
// };

// const PropertyValueInput = <T,>({
// 	app,
// 	aliasArr,
// 	property,
// 	value,
// 	updateForm,
// 	index,
// }: {
// 	app: App;
// 	aliasArr: Settings["columnAliases"];
// 	property: string;
// 	value: string;
// 	updateForm: <T>(key: string, value: T) => void;
// 	index: number;
// }) => {
// 	const updateFormValue = (newValue) => {
// 		const copyAliasArr = [...aliasArr];
// 		copyAliasArr[index][1] = newValue;
// 		updateForm("columnAliases", copyAliasArr);
// 	};
// 	return (
// 		<input
// 			tabIndex={0}
// 			type="text"
// 			placeholder="alias to show"
// 			value={value as string}
// 			onChange={(e) => {
// 				updateFormValue(e.target.value);
// 			}}
// 		/>
// 	);
// };

// const VerticalAlignment = <T,>({
// 	app,
// 	value,
// 	onChange,
// }: {
// 	app: App;
// 	value: T;
// 	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
// }) => {
// 	return (
// 		<SettingRoot>
// 			<SettingInfo>
// 				<SettingName>Vertical alignment</SettingName>
// 				<SettingDescription>
// 					Applies to all table cells
// 				</SettingDescription>
// 			</SettingInfo>
// 			<SettingControl>
// 				<select
// 					className="dropdown"
// 					value={value as string}
// 					onChange={onChange}
// 				>
// 					<option value="top">top</option>
// 					<option value="middle">middle</option>
// 					<option value="bottom">bottom</option>
// 				</select>
// 			</SettingControl>
// 		</SettingRoot>
// 	);
// };

// const AlignmentByType = <T,>({
// 	app,
// 	value,
// 	updateForm,
// }: {
// 	app: App;
// 	value: Settings["alignmentByType"];
// 	updateForm: <T>(key: string, value: T) => void;
// }) => {
// 	return (
// 		<SettingRoot className="flex flex-col gap-3">
// 			<SettingInfo className="m-0 w-full">
// 				<SettingName>Alignment by type</SettingName>
// 				<SettingDescription>
// 					<span>
// 						Align table cells based on property type. Vertical
// 						alignment is the first dropdown and horizontal is the
// 						second.
// 					</span>
// 					<br />
// 					<br />
// 					<span>
// 						This will override the alignment set in the{" "}
// 						<b>Vertical alignment</b> and{" "}
// 						<b>Horizontal alignment</b> settings
// 					</span>
// 				</SettingDescription>
// 			</SettingInfo>
// 			<div className="flex w-full flex-col justify-end gap-3">
// 				{Object.keys(value).map((typeName, i) => (
// 					<div
// 						key={i + "-setting-control-alignmentByType"}
// 						className="flex items-center justify-end gap-2 "
// 						style={{
// 							color: value[typeName].enabled
// 								? "var(--text-normal)"
// 								: "var(--text-faint)",
// 						}}
// 					>
// 						<span>{typeName}: </span>
// 						<div className="flex justify-end gap-3">
// 							<SettingControl className="flex-none">
// 								<select
// 									name="vertical"
// 									disabled={!value[typeName].enabled}
// 									className="dropdown"
// 									value={value[typeName].vertical}
// 									onChange={(e) => {
// 										const copyValue = {
// 											...value,
// 											[typeName]: {
// 												...value[typeName],
// 												vertical: e.target.value,
// 											},
// 										};
// 										updateForm(
// 											"alignmentByType",
// 											copyValue,
// 										);
// 									}}
// 								>
// 									<option value="top">top</option>
// 									<option value="middle">middle</option>
// 									<option value="bottom">bottom</option>
// 								</select>
// 							</SettingControl>
// 							<SettingControl className="flex-none">
// 								<select
// 									name="horizontal"
// 									disabled={!value[typeName].enabled}
// 									className="dropdown"
// 									value={value[typeName].horizontal}
// 									onChange={(e) => {
// 										const copyValue = {
// 											...value,
// 											[typeName]: {
// 												...value[typeName],
// 												horizontal: e.target.value,
// 											},
// 										};
// 										updateForm(
// 											"alignmentByType",
// 											copyValue,
// 										);
// 									}}
// 								>
// 									<option value="start">left</option>
// 									<option value="center">center</option>
// 									<option value="end">end</option>
// 								</select>
// 							</SettingControl>
// 							<SettingControl className="flex-none">
// 								<input
// 									type="checkbox"
// 									data-indeterminate="false"
// 									checked={value[typeName].enabled}
// 									onChange={(e) => {
// 										const copyValue = {
// 											...value,
// 											[typeName]: {
// 												...value[typeName],
// 												enabled: e.target.checked,
// 											},
// 										};
// 										updateForm(
// 											"alignmentByType",
// 											copyValue,
// 										);
// 									}}
// 								/>
// 							</SettingControl>
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 		</SettingRoot>
// 	);
// };

// const HorizontalAlignment = <T,>({
// 	app,
// 	value,
// 	onChange,
// }: {
// 	app: App;
// 	value: T;
// 	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
// }) => {
// 	return (
// 		<SettingRoot>
// 			<SettingInfo>
// 				<SettingName>Horizontal alignment</SettingName>
// 				<SettingDescription>
// 					Applies to all table cells
// 				</SettingDescription>
// 			</SettingInfo>
// 			<SettingControl>
// 				<select
// 					className="dropdown"
// 					value={value as "start" | "center" | "end"}
// 					onChange={onChange}
// 				>
// 					<option value="start">left</option>
// 					<option value="center">center</option>
// 					<option value="end">right</option>
// 				</select>
// 			</SettingControl>
// 		</SettingRoot>
// 	);
// };
