import { loadDependencies } from "@/main";
import { CircleAlertIcon } from "lucide-react";
import { Notice, debounce } from "obsidian";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
const RequiedDepsError = () => (
	<>
		<h3>Failed to load dependencies!</h3>
		<div>
			Plugins required:
			<ul>
				<li>
					<a href="https://github.com/blacksmithgu/obsidian-dataview">
						Dataview
					</a>
				</li>
				<li>
					<a href="https://github.com/chhoumann/MetaEdit">MetaEdit</a>
				</li>
			</ul>
		</div>
	</>
);

const Error = ({ children }: { children: ReactNode }) => {
	return (
		<div id="twcss">
			<div className="rounded-md border-dashed border-[var(--text-error)] p-4">
				<h2 className="mt-0 flex items-center justify-start gap-2">
					<CircleAlertIcon color="var(--text-error)" size={25} />
					Error
				</h2>
				{children}
			</div>
		</div>
	);
};

const App = (props: any) => {
	const { data, getSectionInfo, settings, plugin } = props;
	// console.log(props);
	const [ErrMsg, setErrMsg] = useState<() => React.JSX.Element>(undefined);

	const [, updateEmpty] = useState({});
	const forceUpdate = useCallback(() => updateEmpty({}), []);
	// plugin.registerEvent(
	// 	plugin.app.metadataCache.on("dataview:index-ready", () => {
	// 		console.log("index ready");
	// 		forceUpdate();
	// 	}),
	// );
	// plugin.registerEvent(
	// 	plugin.app.metadataCache.on("dataview:metadata-change", () => {
	// 		console.log("metadata changed");
	// 		forceUpdate();
	// 	}),
	// );

	useEffect(() => {
		new Notice("App rendered");
		(async () => {
			const b = await loadDependencies();
			if (!b) return setErrMsg(() => RequiedDepsError);
		})();

		plugin.addCommand({
			id: `reload-data-edit`,
			name: `Reload Data Edit`,
			callback: () => forceUpdate(),
		});
	}, []);

	if (ErrMsg) {
		return (
			<Error>
				<ErrMsg />
			</Error>
		);
	}

	return (
		<div id="twcss">
			<div className="w-full overflow-x-scroll">
				<EditableTable
					// key={new Date().toLocaleTimeString("en-US")}
					data={data}
				/>
			</div>
		</div>
	);
};

export default App;

const EditableTable = ({ data }: { data: string }) => {
	const [queryResults, setQueryResults] = useState<any>();

	useEffect(
		() => console.log("query results: ", queryResults),
		[queryResults],
	);

	// @ts-ignore
	const meApi = app.plugins.plugins.metaedit.api;

	const doQuery = async () => {
		// @ts-ignore
		const dv = app.plugins.plugins.dataview.api;
		if (data.split(" ")[0] !== "TABLE") {
			const result = eval(`(() => {${data}})()`);
			console.log("result: ", result);
			if (!result) return;
			return setQueryResults(result);
		}
		const qr = await dv.query(data);
		if (!qr.successful) {
			return;
		}
		console.log(qr.value);
		setQueryResults(qr.value);
	};

	// @ts-ignore
	app.metadataCache.on("dataview:index-ready", async () => {
		console.log("index ready");
		await doQuery();
	});
	// @ts-ignore
	app.metadataCache.on("dataview:metadata-change", async () => {
		console.log("metadata changed");
		await doQuery();
	});

	const updateMetaData = debounce(
		(k: number, e: React.ChangeEvent<HTMLInputElement>, v: any[]) => {
			console.log("updated?", v, queryResults.headers[k]);
			const link = v.find((d) => d && d.path);
			if (!link) {
				// this shouldn't be possible but whatever
				return;
			}
			const { path } = link;
			if (v[k]) {
				return meApi.update(
					queryResults.headers[k],
					e.target.value,
					path,
				);
			}
			meApi.createYamlProperty(
				queryResults.headers[k],
				e.target.value,
				path,
			);
		},
		1500,
		true,
	);

	useEffect(() => {
		doQuery();
	}, []);

	if (!queryResults) return <Error>{"Invalid query"}</Error>;

	return (
		<table className="data-edit w-full">
			<thead className="w-fit">
				<tr className="w-fit">
					{queryResults.headers.map((h) => (
						<th key={h} className="w-fit">
							{h === "File" ? (
								<span className="w-fit text-nowrap">
									{h}
									<span className="dataview small-text">
										{queryResults.values.length}
									</span>
								</span>
							) : (
								h
							)}
						</th>
					))}
				</tr>
			</thead>
			<tbody className="w-fit">
				{queryResults.values.map((v, i) => (
					<tr key={i + "table-row"} className="w-fit">
						{v.map((d, k) => (
							<td key={i + k} className="w-fit">
								{d?.path ? (
									<a
										href={d.path}
										data-tooltip-position="top"
										aria-label={d.path}
										data-href={d.path}
										className={"internal-link"}
										target="_blank"
										rel="noopener"
									>
										{d.path.slice(0, -3)}
									</a>
								) : (
									// <div>
									<input
										disabled={
											!v.some((data) => data && data.path)
										}
										aria-label={
											!v.some((data) => data && data.path)
												? "You must have a file.link in one of the columns!"
												: undefined
										}
										// defaultValue={d}
										value={d}
										onChange={(e) => {
											console.log("changed");
											setQueryResults((prev) => {
												const copyPrev = { ...prev };
												copyPrev.values[i][k] =
													e.target.value;
												return copyPrev;
											});
											updateMetaData(k, e, v);
										}}
										className="m-0 w-fit border-transparent bg-transparent p-0 text-start"
									/>
									// </div>
								)}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};
