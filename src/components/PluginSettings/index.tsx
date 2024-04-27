import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
	SampleSetting,
	SettingControl,
	SettingDescription,
	SettingInfo,
	SettingInput,
	SettingName,
	SettingRoot,
	SettingToggle,
} from "../Setting";
import { App, Notice, Plugin } from "obsidian";
import { z } from "zod";
import {
	ArrowRight,
	CircleHelp,
	FileWarning,
	Info,
	MessageCircleQuestion,
	MessageCircleWarning,
	Plus,
	X,
} from "lucide-react";
import DataEdit from "@/main";
import { useSuggest } from "@/hooks/useSuggest";
import { BuyMeCoffee } from "../BuyMeCoffee";

const StartCenterEnd = z.union([
	z.literal("start"),
	z.literal("center"),
	z.literal("end"),
]);

const FormSchema = z.object({
	autoSuggest: z.boolean(),
	showTypeIcons: z.boolean(),
	queryLinksPropertyName: z.string(),
	cssClassName: z.string(),
	columnAliases: z.array(z.array(z.string(), z.string())),
	verticalAlignment: StartCenterEnd,
	horizontalAlignment: StartCenterEnd,
});

export type Settings = z.infer<typeof FormSchema>;

const defaultFormData: Settings = {
	autoSuggest: true,
	showTypeIcons: true,
	queryLinksPropertyName: "dataedit-links",
	cssClassName: "",
	columnAliases: [["thisColumn", "showThisAlias"]],
	verticalAlignment: "start",
	horizontalAlignment: "start",
};

export const PluginSettings = ({
	plugin,
	savedSettings,
}: {
	plugin: DataEdit;
	savedSettings: Settings;
}) => {
	const defaultForm = FormSchema.safeParse(savedSettings).success
		? savedSettings
		: defaultFormData;
	const [form, setForm] = useState<Settings>(defaultForm);

	const updateForm = <T,>(key: string, value: T) => {
		console.log("updateForm: ", key, " ", value);
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	useEffect(() => {
		plugin.onExternalSettingsChange = async () => {
			const potentialSettings = await plugin.loadData();
			const parsed = FormSchema.safeParse(potentialSettings);

			if (parsed.success) {
				setForm(parsed.data);
			}

			parsed.error.issues.forEach(({ code, message, path, fatal }) =>
				console.error(`
                Zod validation error on Plugin Settings form\n
                code: ${code}\n
                message: ${message}\n
                path: ${path}\n
                fatal: ${fatal}\n
                `),
			);
		};
	}, []);

	useEffect(() => {
		console.log("setForm called: ", form);
		const parsed = FormSchema.safeParse(form);
		if (parsed.success) {
			console.log("parse successful");
			(async () => await plugin.updateSettings(form))();
		}
		if (!parsed.success) {
			parsed.error.issues.forEach(({ code, message, path, fatal }) =>
				console.error(`
            Zod validation error on Plugin Settings form\n
            code: ${code}\n
            message: ${message}\n
            path: ${path}\n
            fatal: ${fatal}\n
            `),
			);
		}
	}, [form]);

	return (
		<div className="">
			<h2>Dataedit Settings</h2>
			{/* <SettingDescription></SettingDescription> */}
			<div className="pb-3">
				<SettingDescription>
					Plugin repository:{" "}
					<a href="https://github.com/unxok/dataedit">
						https://github.com/unxok/dataedit
					</a>
				</SettingDescription>
				<SettingDescription>
					Dataview docs:{" "}
					<a href="https://blacksmithgu.github.io/obsidian-dataview/">
						https://blacksmithgu.github.io/obsidian-dataview/
					</a>
				</SettingDescription>
				<br />
				<BuyMeCoffee />
			</div>

			<AutoSuggest
				app={plugin.app}
				value={form.autoSuggest}
				onChange={(b) => updateForm("autoSuggest", b)}
			/>
			<ShowTypeIcons
				app={plugin.app}
				value={form.showTypeIcons}
				onChange={(b) => updateForm("showTypeIcons", b)}
			/>
			<QueryLinksPropertyName
				app={plugin.app}
				value={form.queryLinksPropertyName}
				onChange={(e) =>
					updateForm("queryLinksPropertyName", e.target.value)
				}
			/>
			<CssClassName
				app={plugin.app}
				value={form.cssClassName}
				onChange={(e) => updateForm("cssClassName", e.target.value)}
				onSelect={(v) =>
					updateForm("cssClassName", form.cssClassName + " " + v)
				}
			/>
			<VerticalAlignment
				app={plugin.app}
				value={form.verticalAlignment}
				onChange={(e) =>
					updateForm("verticalAlignment", e.target.value)
				}
			/>
			<HorizontalAlignment
				app={plugin.app}
				value={form.horizontalAlignment}
				onChange={(e) =>
					updateForm("horizontalAlignment", e.target.value)
				}
			/>
			<ColumnAliases
				app={plugin.app}
				value={form.columnAliases}
				updateForm={updateForm}
			/>
		</div>
	);
};

const AutoSuggest = <T,>({
	app,
	value,
	onChange,
}: {
	app: App;
	value: T;
	onChange: (value: T) => void;
}) => (
	<SettingRoot>
		<SettingInfo>
			<SettingName>Auto suggest</SettingName>
			<SettingDescription>
				<div>
					Automatically suggest values from the existing values used
					for that property.
				</div>
				<br />
				<div className="flex items-center gap-1">
					<b>Note:</b>
					<span>this only works for text and multitext</span>
					<div
						className="flex items-center hover:cursor-help"
						aria-label="Obsidian's properties natively only support auto suggest on text and multitext type properties. This plugin uses that same API to get suggestions."
					>
						<CircleHelp size={"1em"} className="text-accent" />
					</div>
				</div>
			</SettingDescription>
		</SettingInfo>
		<SettingControl>
			<SettingToggle
				app={app}
				checked={value as boolean}
				onCheckedChange={onChange as (b: boolean) => void}
			/>
		</SettingControl>
	</SettingRoot>
);

const ShowTypeIcons = <T,>({
	app,
	value,
	onChange,
}: {
	app: App;
	value: T;
	onChange: (value: T) => void;
}) => (
	<SettingRoot>
		<SettingInfo>
			<SettingName>Type icons</SettingName>
			<SettingDescription>
				Show an icon on each column header for the chosen type of that
				property
			</SettingDescription>
		</SettingInfo>
		<SettingControl>
			<SettingToggle
				app={app}
				checked={value as boolean}
				onCheckedChange={onChange as (b: boolean) => void}
			/>
		</SettingControl>
	</SettingRoot>
);

const QueryLinksPropertyName = <T,>({
	app,
	value,
	onChange,
}: {
	app: App;
	value: T;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
	<SettingRoot>
		<SettingInfo>
			<SettingName>Query links property name</SettingName>
			<SettingDescription>
				<div>
					The frontmatter property name for the property where
					Dataedit tables will update with links from files returned
					in the query
				</div>
				<br />
				<div>
					<b>Don't want this? </b>
					<span>Leave as blank</span>
				</div>
			</SettingDescription>
		</SettingInfo>
		<SettingControl>
			<SettingInput
				app={app}
				placeholder="unset"
				value={value as string}
				onChange={onChange}
			/>
		</SettingControl>
	</SettingRoot>
);

const CssClassName = <T,>({
	app,
	value,
	onChange,
	onSelect,
}: {
	app: App;
	value: T;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSelect: (v: string) => void;
}) => {
	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>CSS class name</SettingName>
				<SettingDescription>
					Add additional CSS class names to the Dataedit HTML table
					element
				</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<SettingInput
					app={app}
					placeholder="classA classB"
					value={value as string}
					onChange={onChange}
					getSuggestions={() =>
						// @ts-ignore
						app.metadataCache.getFrontmatterPropertyValuesForKey(
							"cssclasses",
						)
					}
					onSelect={onSelect}
				/>
			</SettingControl>
		</SettingRoot>
	);
};

const ColumnAliases = <T,>({
	app,
	value,
	updateForm,
}: {
	app: App;
	value: Settings["columnAliases"];
	updateForm: <T>(key: string, value: T) => void;
}) => {
	return (
		<SettingRoot className="flex flex-col gap-3">
			<SettingInfo>
				<SettingName>Column aliases</SettingName>
				<SettingDescription>
					<span>Setup aliases for frontmatter property names.</span>
					&nbsp;
					<span>
						Property names will be replaced by their aliases set
						here in the column headers of Dataedit tables.
					</span>
				</SettingDescription>
			</SettingInfo>
			<div className="flex w-full flex-col justify-end gap-3">
				{value.map((arr, i) => (
					<div
						key={i + "-setting-control-columnAlias"}
						className="flex items-center justify-end gap-1"
					>
						<SettingControl className="flex-none">
							<button
								className="group border-none bg-transparent shadow-none"
								onClick={() => {
									const newValue = value.filter(
										(_, k) => k !== i,
									);
									updateForm("columnAliases", newValue);
								}}
							>
								<X
									size={"1em"}
									className="text-faint group-hover:text-normal"
								/>
							</button>
							<PropertyNameInput
								app={app}
								aliasArr={value}
								property={arr[0]}
								index={i}
								updateForm={updateForm}
							/>
						</SettingControl>
						<ArrowRight size={"1em"} />
						<SettingControl className="flex-none">
							<PropertyValueInput
								key={i}
								app={app}
								aliasArr={value}
								property={arr[0]}
								value={arr[1]}
								index={i}
								updateForm={updateForm}
							/>
						</SettingControl>
					</div>
				))}
			</div>
			<div className="flex w-full justify-end">
				<button
					className="flex items-center"
					onClick={() => {
						const newValue = [...value, ["", ""]];
						updateForm("columnAliases", newValue);
					}}
				>
					Add new alias&nbsp;
					<Plus size={"1em"} />
				</button>
			</div>
		</SettingRoot>
	);
};

const PropertyNameInput = <T,>({
	app,
	aliasArr,
	property,
	updateForm,
	index,
}: {
	app: App;
	aliasArr: Settings["columnAliases"];
	property: string;
	updateForm: <T>(key: string, value: T) => void;
	index: number;
}) => {
	const updateFormValue = (newPropName) => {
		const copyAliasArr = [...aliasArr];
		copyAliasArr[index][0] = newPropName;
		updateForm("columnAliases", copyAliasArr);
	};
	return (
		<SettingInput
			app={app}
			placeholder="property name"
			value={property as string}
			onChange={(e) => {
				updateFormValue(e.target.value);
			}}
			getSuggestions={() =>
				// @ts-ignore
				Object.keys(app.metadataCache.getAllPropertyInfos()).sort(
					(a, b) => a.localeCompare(b),
				)
			}
			onSelect={(v, e) => updateFormValue(v)}
		/>
	);
};

const PropertyValueInput = <T,>({
	app,
	aliasArr,
	property,
	value,
	updateForm,
	index,
}: {
	app: App;
	aliasArr: Settings["columnAliases"];
	property: string;
	value: string;
	updateForm: <T>(key: string, value: T) => void;
	index: number;
}) => {
	const updateFormValue = (newValue) => {
		const copyAliasArr = [...aliasArr];
		copyAliasArr[index][1] = newValue;
		updateForm("columnAliases", copyAliasArr);
	};
	return (
		<SettingInput
			app={app}
			placeholder="alias to show"
			value={value as string}
			onChange={(e) => {
				updateFormValue(e.target.value);
			}}
		/>
	);
};

const VerticalAlignment = <T,>({
	app,
	value,
	onChange,
}: {
	app: App;
	value: T;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>Vertical alignment</SettingName>
				<SettingDescription>
					Applies to all table cells
				</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<select
					className="dropdown"
					value={value as "start" | "center" | "end"}
					onChange={onChange}
				>
					<option value="start">top</option>
					<option value="center">center</option>
					<option value="end">bottom</option>
				</select>
			</SettingControl>
		</SettingRoot>
	);
};

const HorizontalAlignment = <T,>({
	app,
	value,
	onChange,
}: {
	app: App;
	value: T;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>Horizontal alignment</SettingName>
				<SettingDescription>
					Applies to all table cells
				</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<select
					className="dropdown"
					value={value as "start" | "center" | "end"}
					onChange={onChange}
				>
					<option value="start">left</option>
					<option value="center">center</option>
					<option value="end">right</option>
				</select>
			</SettingControl>
		</SettingRoot>
	);
};
