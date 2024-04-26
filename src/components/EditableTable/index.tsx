import React, { useEffect, useState } from "react";
import { Plugin } from "obsidian";
import { getPropertyType, iconStyle } from "../../lib/utils";
import {
	CommonEditableProps,
	QueryResults,
	UpdateMetaData,
} from "../../lib/types";
import { PropertyIcon } from "../../components/PropertyIcon";
import { Error } from "../Error";
import { File } from "lucide-react";
import {
	ArrayInputWrapper,
	CheckboxInput,
	DateTimeInput,
	NumberInput,
	StringInput,
} from "../Inputs";
import { LinkTableData } from "../LinkTableData";

export const EditableTable = ({
	data,
	plugin,
}: {
	data: string;
	plugin: Plugin;
}) => {
	const [queryResults, setQueryResults] = useState<QueryResults>();

	useEffect(() => {
		console.log("query results: ", queryResults);
		const asyncDoQuery = async () => {
			await doQuery();
			console.log("asyncquery");
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
		if (data.split(" ")[0] !== "TABLE") {
			const result = eval(`(() => {${data}})()`);
			// console.log("result: ", result);
			if (!result) return;
			return setQueryResults(result);
		}
		const qr = await dv.query(data);
		if (!qr.successful) {
			return;
		}
		// console.log(qr.value);
		setQueryResults(qr.value);
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
		// console.log("did it process?");
	};

	useEffect(() => {
		doQuery();
	}, []);

	if (!queryResults) return <Error>{"Invalid query"}</Error>;
	return (
		<>
			<table className="data-edit max-w-full whitespace-nowrap">
				<TableHead queryResults={queryResults} />
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
												file={propertyValueArr[0]}
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
		</>
	);
};

const EditableTableData = (props: CommonEditableProps) => {
	const { propertyValue, propertyName, file } = props;
	const propertyType = getPropertyType(propertyName);

	if (propertyValue?.__proto__?.constructor?.name === "Link") {
		return <LinkTableData file={file} />;
	}

	if (propertyType === "multitext" || propertyType === "tags") {
		return <ArrayInputWrapper {...props} />;
	}

	if (propertyType === "date") {
		return <div>date</div>;
	}

	if (propertyType === "datetime") {
		return <div>datetime</div>;
	}

	if (propertyType === "checkbox") {
		return <CheckboxInput {...props} />;
	}

	if (propertyType === "number") {
		return <NumberInput {...props} />;
	}

	return <StringInput {...props} />;
};

const TableHead = ({ queryResults }: { queryResults: any }) => {
	//
	return (
		<thead className="w-fit">
			<tr className="w-fit">
				{queryResults.headers.map((h) => (
					<th key={h} className="w-fit">
						{h.toUpperCase() === "FILE" ? (
							<span className="flex w-fit items-center text-nowrap">
								{h}
								<span
									className="metadata-property-icon"
									aria-label={"file"}
									data-tooltip-position="right"
								>
									<File style={iconStyle} />
								</span>
								{/* <span className="dataview small-text">
										{queryResults.values.length}
									</span> */}
							</span>
						) : (
							<span className="flex w-fit items-center">
								{h}
								<PropertyIcon propertyName={h} />
							</span>
						)}
					</th>
				))}
			</tr>
		</thead>
	);
};
