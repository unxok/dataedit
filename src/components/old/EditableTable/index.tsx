import React, { useEffect, useState } from "react";
import {
	MarkdownPostProcessorContext,
	Notice,
	Plugin,
	parseYaml,
} from "obsidian";
import {
	addNewKeyValues,
	checkIsLink,
	getPropertyType,
	iconStyle,
	tryToMarkdownLink,
} from "../../../lib/utils";
import {
	CommonEditableProps,
	QueryResults,
	UpdateMetaData,
} from "../../../lib/types";
import { PropertyIcon } from "../../components/PropertyIcon";
import { Error } from "../Error";
import { File, Settings as SettingsIcon } from "lucide-react";
import {
	ArrayInputWrapper,
	CheckboxInput,
	DateTimeInput,
	NumberInput,
	StringInput,
	FileInput,
} from "../Inputs";
import { LinkTableData } from "../LinkTableData";
import DataEdit from "@/main";
import {
	BlockSettings,
	Settings,
	SettingsSchema,
	defaultSettings,
} from "../../PluginSettings";

export const EditableTable = ({
	data,
	// config,
	plugin,
	ctx,
}: {
	data: string;
	// config: string;
	plugin: DataEdit;
	ctx: MarkdownPostProcessorContext;
}) => {
	const [queryResults, setQueryResults] = useState<QueryResults>();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	console.log("got settings: ", plugin.settings);

	const reg = new RegExp(/\n^---$\n/gm);
	const [query, config] = data.split(reg);

	const potentialConfigJson: () => Record<string, any> = (() => {
		try {
			return parseYaml(config);
		} catch (e) {
			return {};
		}
	})();

	console.log("potential json: ", potentialConfigJson);

	const parsedConfig = (() => {
		const configWithSettings = addNewKeyValues(
			potentialConfigJson,
			plugin.settings,
		);
		console.log("configWithSettings: ", configWithSettings);
		const parsed = SettingsSchema.safeParse(configWithSettings);
		if (!parsed.success) {
			const msg =
				"Invalid block config detected. Reverting to use the plugin settings";
			new Notice(msg);
			console.error(msg);
			return plugin.settings;
		}
		return parsed.data;
	})();

	console.log("parsed config: ", parsedConfig);

	useEffect(() => {
		// console.log("query results: ", queryResults);
		const asyncDoQuery = async () => {
			await doQuery();
			await updateDataeditLinks();
		};
		plugin.app.metadataCache.on(
			"dataview:index-ready" as "changed",
			asyncDoQuery,
		);
		plugin.app.metadataCache.on(
			"dataview:metadata-change" as "changed",
			asyncDoQuery,
		);
		return () => {
			plugin.app.metadataCache.off(
				"dataview:index-ready" as "changed",
				asyncDoQuery,
			);
			plugin.app.metadataCache.off(
				"dataview:metadata-change" as "changed",
				asyncDoQuery,
			);
		};
	}, [queryResults]);

	const doQuery = async () => {
		// @ts-ignore
		const dv = app.plugins.plugins.dataview.api;
		if (query.split(" ")[0].toLowerCase() !== "table") {
			const result = eval(`(() => {${query}})()`);
			// console.log("result: ", result);
			if (!result) return;
			return setQueryResults(result);
		}
		const qr = await dv.query(query);
		if (!qr.successful) {
			return;
		}
		// console.log(qr.value);
		setQueryResults(qr.value);
	};

	const updateDataeditLinks = async () => {
		const propName = parsedConfig.queryLinksPropertyName;
		if (!propName) return;
		const values = queryResults?.values;
		if (!values) return;
		if (!ctx) return;
		const links = values
			.flat(2)
			.filter((v) => checkIsLink(v))
			.map((v) => tryToMarkdownLink(v));
		const setLinks = new Set([...links]);
		const readyLinks = Array.from(setLinks);
		const file = plugin.app.vault.getFileByPath(ctx.sourcePath);
		if (!file) return;
		await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter[propName] = readyLinks;
			// console.log("fm: ", frontmatter);
		});
	};

	const updateMetaData: UpdateMetaData = async (
		propertyName,
		propertyValue,
		filePath,
	) => {
		// console.log("updated?", v, queryResults.headers[k]);
		const file = plugin.app.vault.getFileByPath(filePath);
		if (!file) return;
		await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
			// console.log("fm: ", frontmatter);
			frontmatter[propertyName] = propertyValue;
		});
		await updateDataeditLinks();
	};

	useEffect(() => {
		doQuery();
	}, []);

	if (!queryResults) return <Error>{"Invalid query"}</Error>;
	return (
		<>
			<table
				className={
					"dataedit max-w-full whitespace-nowrap " +
					parsedConfig.cssClassName
				}
			>
				<TableHead
					queryResults={queryResults}
					settings={parsedConfig}
				/>
				<tbody className="">
					{queryResults.values.map(
						(propertyValueArr, propertyValueArrIndex) => (
							<tr
								key={propertyValueArrIndex + "table-row"}
								className=""
							>
								{propertyValueArr.map(
									(propertyValue, propertyValueIndex) => (
										<td
											key={
												propertyValueArrIndex +
												propertyValueIndex
											}
											className="relative"
											style={{
												verticalAlign: parsedConfig
													.alignmentByType[
													getPropertyType(
														queryResults.headers[
															propertyValueIndex
														],
													)
												]?.enabled
													? parsedConfig
															.alignmentByType[
															getPropertyType(
																queryResults
																	.headers[
																	propertyValueIndex
																],
															)
														].vertical
													: parsedConfig.verticalAlignment,
											}}
										>
											<EditableTableData
												propertyValue={propertyValue}
												propertyValueArrIndex={
													propertyValueArrIndex
												}
												propertyValueIndex={
													propertyValueIndex
												}
												propertyValueArr={
													propertyValueArr
												}
												propertyName={
													queryResults.headers[
														propertyValueIndex
													]
												}
												// TODO index determined by config
												// file={propertyValueArr[0]}
												file={
													propertyValueArr[
														queryResults.headers.findIndex(
															(v) =>
																v === "File" ||
																v ===
																	"file.link",
														)
													]
												}
												plugin={plugin}
												config={parsedConfig}
												setQueryResults={
													setQueryResults
												}
												updateMetaData={updateMetaData}
											/>
										</td>
									),
								)}
							</tr>
						),
					)}
				</tbody>
			</table>
			<div
				className="edit-block-button bottom-[4px] top-[unset]"
				aria-label="Edit table settings"
				onClick={() => setIsDialogOpen(true)}
			>
				<SettingsIcon />
			</div>
			<BlockSettings
				plugin={plugin}
				savedSettings={parsedConfig}
				ctx={ctx}
				query={query}
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</>
	);
};

const EditableTableData = (props: CommonEditableProps) => {
	const { propertyName, file, plugin, config } = props;
	const propertyType = getPropertyType(propertyName);

	if (propertyName.toLowerCase() === "file" || propertyName === "file.link") {
		return <FileInput file={file} plugin={plugin} config={config} />;
	}

	if (propertyType === "multitext" || propertyType === "tags") {
		return <ArrayInputWrapper {...props} />;
	}

	if (propertyType === "date") {
		return <DateTimeInput isTime={false} {...props} />;
	}

	if (propertyType === "datetime") {
		return <DateTimeInput isTime={true} {...props} />;
	}

	if (propertyType === "checkbox") {
		return <CheckboxInput {...props} />;
	}

	if (propertyType === "number") {
		return <NumberInput {...props} />;
	}

	return <StringInput {...props} />;
};

const TableHead = ({
	queryResults,
	settings,
}: {
	queryResults: any;
	settings: Settings;
}) => {
	const getAlias: (propertyName: string) => string | undefined = (
		propertyName,
	) => {
		const possibleArr = settings.columnAliases.find(
			(arr) => arr[0] === propertyName,
		);
		// console.log("possibleArr", possibleArr);
		if (!possibleArr) return;
		return possibleArr[1];
	};
	return (
		<thead className="w-fit">
			<tr className="w-fit">
				{queryResults.headers.map((h, i) => (
					<th key={i} className="w-fit">
						{h.toUpperCase() === "FILE" || h === "file.link" ? (
							<span className="flex w-fit items-center text-nowrap">
								{getAlias(h) ?? h}
								{settings.showTypeIcons && (
									<span
										className="metadata-property-icon"
										aria-label={"file"}
										data-tooltip-position="right"
									>
										<File style={iconStyle} />
									</span>
								)}
								{/* <span className="dataview small-text">
										{queryResults.values.length}
									</span> */}
							</span>
						) : (
							<span className="flex w-fit items-center">
								{getAlias(h) ?? h}
								{settings.showTypeIcons && (
									<PropertyIcon propertyName={h} />
								)}
							</span>
						)}
					</th>
				))}
			</tr>
		</thead>
	);
};
