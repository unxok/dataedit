import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	SampleSetting,
	SettingControl,
	SettingDescription,
	SettingInfo,
	SettingName,
	SettingRoot,
	SettingToggle,
} from "../Setting";
import { App, Modal, Notice, Plugin } from "obsidian";
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
import { Suggest, useSuggest } from "@/hooks/useSuggest";
import { BuyMeCoffee } from "../BuyMeCoffee";
import { addNewKeyValues } from "@/lib/utils";

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

export const SettingsSchema = z.object({
	autoSuggest: z.boolean(),
	showTypeIcons: z.boolean(),
	emptyValueDisplay: z.string(),
	queryLinksPropertyName: z.string(),
	cssClassName: z.string(),
	columnAliases: z.array(z.array(z.string(), z.string())),
	verticalAlignment: TopMiddleBottom,
	horizontalAlignment: StartCenterEnd,
});

export type Settings = z.infer<typeof SettingsSchema>;

export const defaultSettings: Settings = {
	autoSuggest: true,
	showTypeIcons: true,
	emptyValueDisplay: "-",
	queryLinksPropertyName: "dataedit-links",
	cssClassName: "",
	columnAliases: [["thisColumn", "showThisAlias"]],
	verticalAlignment: "top",
	horizontalAlignment: "start",
};

export const PluginSettings = ({
	plugin,
	savedSettings,
}: {
	plugin: DataEdit;
	savedSettings: Settings;
}) => {
	const [errors, setErrors] = useState<(string | number)[][]>();
	const potentialSettings = addNewKeyValues(savedSettings, defaultSettings);
	const potentialParsed = SettingsSchema.safeParse(potentialSettings);
	const [form, setForm] = useState<Settings>(potentialParsed.data);
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
			const copyForm = addNewKeyValues(
				potentialSettings,
				defaultSettings,
			);
			const parsed = SettingsSchema.safeParse(copyForm);

			if (parsed.success) {
				setForm(parsed.data);
			}
			if (!parsed.success) {
				setErrors(() =>
					parsed.error.issues.map(({ path, message }) => [
						Array.isArray(path) ? path.join(", ") : path,
						message,
					]),
				);
				parsed.error.issues.forEach(({ code, message, path, fatal }) =>
					console.error(`
                Zod validation error on Plugin Settings form\n
                code: ${code}
                message: ${message}
                path: ${path}
                fatal: ${fatal}
                `),
				);
			}
		};
	}, []);

	useEffect(() => {
		console.log("setForm called: ", form);
		// adds key/values from default if form is missing keys
		// useful for when new settings are added
		const copyForm = addNewKeyValues(form, defaultSettings);
		const parsed = SettingsSchema.safeParse(copyForm);
		if (parsed.success) {
			console.log("parse successful");
			(async () => await plugin.updateSettings(copyForm))();
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
				<div className="flex gap-2">
					<BuyMeCoffee />
					<button
						className="text-modifier-error hover:bg-modifier-error-hover hover:text-normal"
						onClick={(e) => {
							new ConfirmationDialog(
								plugin.app,
								"Reset settings",
								"Are you absolutely sure? You cannot reverse this!",
								"back to safety",
								"go for it",
								(b) => {
									if (!b) return;
									setForm(defaultSettings);
								},
							).open();
						}}
					>
						Reset to default settings
					</button>
				</div>
			</div>
			{!potentialParsed.success && (
				<SettingRoot>
					<SettingInfo>
						<SettingName>Invalid Settings!</SettingName>
						<SettingDescription>
							<>
								{errors?.map(([property, message]) => (
									<div key={property}>
										Invalid setting <code>{property}</code>:{" "}
										{message}
									</div>
								))}
							</>
							The only way you should be able have invalid
							settings would be if you:
							<ul>
								<li>
									You manually changed the{" "}
									<code>data.json</code> file of this plugin
								</li>
								<li>
									Another plugin changed this plugins settings
									incorrectly
								</li>
								<li>
									There's a bug in this plugin causing an
									invalid setting value
								</li>
							</ul>
						</SettingDescription>
					</SettingInfo>
				</SettingRoot>
			)}
			{potentialParsed.success && (
				<>
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
					<EmptyValueDisplay
						value={form.emptyValueDisplay}
						onChange={(e) =>
							updateForm("emptyValueDisplay", e.target.value)
						}
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
						onChange={(e) =>
							updateForm("cssClassName", e.target.value)
						}
						onSelect={(v) =>
							updateForm(
								"cssClassName",
								form.cssClassName + " " + v,
							)
						}
					/>
					<VerticalAlignment
						app={plugin.app}
						value={form.verticalAlignment}
						onChange={(e) =>
							updateForm("verticalAlignment", e.target.value)
						}
					/>
					<VerticalAlignmentByType />
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
				</>
			)}
		</div>
	);
};

class ConfirmationDialog extends Modal {
	isConfirmed: boolean;
	constructor(
		app: App,
		title: string,
		message: string,
		cancelText: string,
		confirmText: string,
		onClose: (isConfirmed: boolean) => void,
	) {
		super(app);
		this.setTitle(title);
		this.isConfirmed = false;
		const contentEl = new DocumentFragment();
		const messageEl = document.createElement("div");
		contentEl.appendChild(messageEl);
		messageEl.textContent = message;
		const buttonContainerEl = document.createElement("div");
		buttonContainerEl.style.display = "flex";
		buttonContainerEl.style.justifyContent = "end";
		buttonContainerEl.style.width = "100%";
		buttonContainerEl.style.gap = "8px";
		contentEl.appendChild(buttonContainerEl);
		const cancelEl = document.createElement("button");
		cancelEl.textContent = cancelText;
		cancelEl.onclick = () => {
			this.close();
		};
		buttonContainerEl.appendChild(cancelEl);
		const confirmEl = document.createElement("button");
		confirmEl.textContent = confirmText;
		confirmEl.style.color = "var(--text-error)";
		confirmEl.onclick = () => {
			this.isConfirmed = true;
			this.close();
		};
		buttonContainerEl.appendChild(confirmEl);
		this.setContent(contentEl);
		this.onClose = () => onClose(this.isConfirmed);
	}
}

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

const EmptyValueDisplay = <T,>({
	value,
	onChange,
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>Empty value display</SettingName>
				<SettingDescription>
					What to show when a property is unset, undefined, or null
				</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<input type="text" value={value} onChange={onChange} />
			</SettingControl>
		</SettingRoot>
	);
};

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
					The frontmatter property name for the property Dataedit
					tables will update with links from files returned in the
					query
				</div>
				<br />
				<div>
					<b>Don't want this? </b>
					<span>Leave as blank</span>
				</div>
			</SettingDescription>
		</SettingInfo>
		<SettingControl>
			<input
				type="text"
				tabIndex={0}
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
	const measuredRef = useCallback((node: HTMLInputElement) => {
		if (node === null) return;
		new Suggest(
			app,
			node,
			(q) => [
				q,
				// @ts-ignore
				...app.metadataCache.getFrontmatterPropertyValuesForKey(
					"cssclasses",
				),
			],
			onSelect,
		);
	}, []);
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
				<input
					type="text"
					tabIndex={0}
					placeholder="classA classB"
					value={value as string}
					onChange={onChange}
					ref={measuredRef}
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
	const measuredRef = useCallback((node: HTMLInputElement) => {
		if (node === null) return;
		new Suggest(
			app,
			node,
			(q) => {
				const existingProps = Object.keys(
					// @ts-ignore
					app.metadataCache.getAllPropertyInfos(),
				).sort((a, b) => a.localeCompare(b));
				return [q, ...existingProps];
			},
			(v) => updateFormValue(v),
		);
	}, []);

	return (
		<input
			type="text"
			tabIndex={0}
			ref={measuredRef}
			placeholder="property name"
			value={property}
			onChange={(e) => updateFormValue(e.target.value)}
		/>

		// <SettingInput
		// 	app={app}
		// 	placeholder="property name"
		// 	value={property as string}
		// 	onChange={(e) => {
		// 		updateFormValue(e.target.value);
		// 	}}
		// 	getSuggestions={() =>
		// 		// @ts-ignore
		// 		Object.keys(app.metadataCache.getAllPropertyInfos()).sort(
		// 			(a, b) => a.localeCompare(b),
		// 		)
		// 	}
		// 	onSelect={(v, e) => updateFormValue(v)}
		// />
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
		<input
			tabIndex={0}
			type="text"
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
					value={value as string}
					onChange={onChange}
				>
					<option value="top">top</option>
					<option value="middle">middle</option>
					<option value="bottom">bottom</option>
				</select>
			</SettingControl>
		</SettingRoot>
	);
};

const VerticalAlignmentByType = <T,>(
	{
		// app,
		// value,
		// onChange,
	}: {
		// app: App;
		// value: T;
		// onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	},
) => {
	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>Vertical alignment by type</SettingName>
				<SettingDescription>
					Change vertical alignment of table cells based on the
					property type
				</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<input
					type="text"
					value={""}
					placeholder={"coming soon..."}
					disabled
				/>
				{/* <select
					className="dropdown"
					value={value as string}
					onChange={onChange}
				>
					<option value="top">top</option>
					<option value="middle">middle</option>
					<option value="bottom">bottom</option>
				</select> */}
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
