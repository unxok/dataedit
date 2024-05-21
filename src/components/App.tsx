import { MarkdownPostProcessorContext, Notice } from "obsidian";
import { Settings } from "./PluginSettings";
import React, { ReactNode, useEffect, useState } from "react";
import DataEdit, { loadDependencies } from "@/main";
import { cn, getPropertyType, iconStyle, tryToMarkdownLink } from "@/lib/utils";
import { Markdown } from "./Markdown";
import {
	Binary,
	Calendar,
	CheckSquare,
	Clock,
	File,
	Forward,
	List,
	Tags,
	Text,
} from "lucide-react";
import { ClassValue } from "clsx";
import { create } from "zustand";

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

const Th = ({
	children,
	className,
}: {
	children: string;
	className?: ClassValue;
}) => {
	const { ctx, plugin, aliasObj } = useBlock();
	const propName = aliasObj[children] ?? children;
	// TODO check for different prop name set in dataview settings?
	const isFileProp =
		propName.toLowerCase() === "file" || propName === "file.link";
	const propertyType = isFileProp ? "file" : getPropertyType(propName);
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

const Td = ({
	children,
	propertyName,
	className,
}: {
	children: string;
	propertyName: string;
	className?: ClassValue;
}) => {
	const { ctx, plugin, aliasObj } = useBlock();
	const propName = aliasObj[propertyName] ?? propertyName;
	// TODO check for different prop name set in dataview settings?
	const isFileProp =
		propName.toLowerCase() === "file" || propName === "file.link";
	const propertyType = isFileProp ? "file" : getPropertyType(propName);
	const content = tryToMarkdownLink(children);
	return (
		<td className={cn(className)}>
			<div className="flex h-full w-full">
				{propertyType === "text" || isFileProp ? (
					<Markdown
						app={plugin.app}
						filePath={ctx.sourcePath}
						plainText={content}
					/>
				) : (
					<p>{content}</p>
				)}
			</div>
		</td>
	);
};

const getColAliasObj = (text: string) => {
	const regex = /\b([\w\.]+)\s+as\s+([\w\.]+)\b/gi;
	const matches = text.match(regex);
	return matches.reduce((acc, cur) => {
		const arr = cur.split(/\sas\s/gi);
		return {
			...acc,
			[arr[1].trim()]: arr[0].trim(),
		};
	}, {});
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
	const { setBlockState } = useBlock();

	const reg = new RegExp(/\n^---$\n/gm);
	const [query, config] = data.split(reg);
	const aliasObj = getColAliasObj(query);

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
	}, [queryResults]);

	if (!queryResults) {
		return <div>Query results undefined</div>;
	}
	return (
		<div className="twcss">
			<table>
				<thead>
					<tr>
						{queryResults?.headers?.map((h, i) => (
							<Th key={i + "table-header"} className="py-3">
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
								>
									{d}
								</Td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
