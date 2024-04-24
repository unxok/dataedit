import { loadDependencies } from "@/main";
import {
	CircleAlertIcon,
	File,
	Link,
	LucideFile,
	Plus,
	TagsIcon,
	X,
} from "lucide-react";
import { Debouncer, Notice, debounce, setIcon } from "obsidian";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
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

const useDebounce = (callback: () => void, state: any, delay: number) => {
	useEffect(() => {
		const timeout = setTimeout(() => callback(), delay);
		return () => clearTimeout(timeout);
	}, [state, delay]);
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
			<input
				className="metadata-input metadata-input-text mod-datetime"
				max="9999-12-31T23:59"
				type="datetime-local"
				placeholder="Empty"
			></input>
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

/**
 * Use this to convert Data Arrays from Dataview to regular arrays
 * @param arr A Dataview Data Array
 * @returns A plain js array
 */
const toPlainArray = (arr: any) => {
	try {
		return arr.array();
	} catch (e) {
		return arr;
	}
};

const getPropertyType = (propertyName: string) => {
	// @ts-ignore
	const { metadataTypeManager } = app;
	return metadataTypeManager.properties[propertyName]?.type as
		| string
		| undefined;
};

const PropertyIcon = ({ propertyName }: { propertyName: string }) => {
	const ref = useRef<HTMLSpanElement>(null);

	const propertyType = getPropertyType(propertyName);
	const propertyIcon =
		// @ts-ignore
		app.metadataTypeManager.registeredTypeWidgets[propertyType]?.icon;

	useEffect(() => {
		if (!ref.current || !propertyIcon) return;
		console.log("icon: ", propertyIcon);
		try {
			setIcon(ref.current, propertyIcon);
			console.log("icon should be set");
		} catch (e) {
			console.error("Failed to setIcon: ", e);
		}
	}, [propertyIcon]);

	return (
		<span
			ref={ref}
			className="metadata-property-icon"
			aria-label={propertyType}
			data-tooltip-position="right"
		></span>
	);
};

type QueryResults = {
	headers: string[];
	values: any;
};

type UpdateMetaData = (k: number, value: any, v: any[]) => void;

const EditableTable = ({ data }: { data: string }) => {
	const [queryResults, setQueryResults] = useState<QueryResults>();

	// useEffect(
	// 	() => console.log("query results: ", queryResults),
	// 	[queryResults],
	// );

	// @ts-ignore
	const meApi = app.plugins.plugins.metaedit.api;

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

	// @ts-ignore
	app.metadataCache.on("dataview:index-ready", async () => {
		// console.log("index ready");
		await doQuery();
	});
	// @ts-ignore
	app.metadataCache.on("dataview:metadata-change", async () => {
		// console.log("metadata changed");
		await doQuery();
	});

	const updateMetaData: UpdateMetaData =
		// I would prefer to use debounce here but it doesn't work nicely across different components
		// debounce(
		(k, value, v) => {
			console.log("updated?", v, queryResults.headers[k]);
			const link = v.find((d) => d && d.path);
			if (!link) {
				// this shouldn't be possible but whatever
				return;
			}
			const { path } = link;
			if (v[k] !== undefined || v[k] !== null) {
				meApi.update(queryResults.headers[k], value, path);
				doQuery();
				return;
			}
			meApi.createYamlProperty(queryResults.headers[k], value, path);
			doQuery();
		};
	// 	,
	// 	1500,
	// 	true,
	// );

	useEffect(() => {
		doQuery();
	}, []);

	if (!queryResults) return <Error>{"Invalid query"}</Error>;
	return (
		<table className="data-edit w-full">
			<TableHead queryResults={queryResults} />
			<tbody className="w-fit">
				{queryResults.values.map((v, i) => (
					<tr key={i + "table-row"} className="w-fit">
						{v.map((d, k) => (
							<td key={i + k} className="relative w-fit">
								<EditableTableData
									d={d}
									i={i}
									k={k}
									v={v}
									queryResults={queryResults}
									setQueryResults={setQueryResults}
									updateMetaData={updateMetaData}
								/>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};

const EditableTableData = ({
	d,
	i,
	k,
	v,
	queryResults,
	setQueryResults,
	updateMetaData,
}: {
	d: any;
	i: number;
	k: number;
	v: QueryResults["values"];
	queryResults: QueryResults;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
}) => {
	const propertyType = getPropertyType(queryResults.headers[k]);

	if (d?.__proto__?.constructor?.name === "Link") {
		return <LinkTableData d={d} />;
	}

	// console.log("prop type:", propertyType);

	if (propertyType === "multitext" || propertyType === "tags") {
		return (
			<ArrayInput
				d={d}
				v={v}
				i={i}
				k={k}
				setQueryResults={setQueryResults}
				updateMetaData={updateMetaData}
			/>
		);
	}

	if (propertyType === "date") {
		return <div>date</div>;
	}

	if (propertyType === "datetime") {
		return <div>datetime</div>;
	}

	if (propertyType === "checkbox") {
		return (
			<CheckboxInput
				v={v}
				d={d}
				i={i}
				k={k}
				setQueryResults={setQueryResults}
				updateMetaData={updateMetaData}
			/>
		);
	}

	return (
		<StringOrNumberInput
			v={v}
			d={d}
			i={i}
			k={k}
			isNumber={propertyType === "number"}
			setQueryResults={setQueryResults}
			updateMetaData={updateMetaData}
		/>
	);
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
									<File
										style={{
											width: "var(--icon-size)",
											height: "var(--icon-size)",
										}}
									/>
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

const LinkTableData = ({ d }: { d: { path: string } }) => (
	<span className="flex h-full items-center p-1">
		<a
			href={d.path}
			data-tooltip-position="top"
			aria-label={d.path}
			data-href={d.path}
			className={"internal-link"}
			target="_blank"
			rel="noopener"
			data-test={d}
		>
			{d.path.slice(0, -3)}
		</a>
	</span>
);

const StringOrNumberInput = ({
	v,
	d,
	i,
	k,
	isNumber,
	setQueryResults,
	updateMetaData,
}: {
	v: QueryResults["values"];
	d: string | number;
	i: number;
	k: number;
	isNumber: boolean;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
}) => {
	const [value, setValue] = useState<typeof d>();
	useDebounce(
		() => {
			if (value === undefined || value === null) return;
			const newVal = isNumber ? Number(value) : value;
			updateMetaData(k, newVal, v);
		},
		value,
		1500,
	);

	return (
		<input
			disabled={!v.some((data) => data && data.path)}
			aria-label={
				!v.some((data) => data && data.path)
					? "You must have a file.link in one of the columns!"
					: undefined
			}
			// defaultValue={d}
			type={isNumber ? "number" : "text"}
			value={d}
			onChange={(e) => {
				// console.log("changed");
				setQueryResults((prev) => {
					const copyPrev = { ...prev };
					copyPrev.values[i][k] = e.target.value;
					return copyPrev;
				});
				setValue(e.target.value);
				// updateMetaData(k, e.target.value, v);
			}}
			className="m-0 w-fit border-transparent bg-transparent p-0 text-start"
		/>
	);
};

const ArrayInput = ({
	d,
	v,
	i,
	k,
	setQueryResults,
	updateMetaData,
}: {
	d: (string | number)[];
	v: QueryResults["values"];
	i: number;
	k: number;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
}) => {
	const [value, setValue] = useState<any>();
	useDebounce(
		() => {
			if (value === undefined || value === null) return;
			updateMetaData(k, value, v);
		},
		value,
		1500,
	);

	return (
		<ul className="m-0 p-0">
			{d?.map((dd, n) => (
				<li key={i + k + n.toString()} className="flex">
					<span
						className="multi-select-pill-remove-button"
						onClick={() => {
							const copyValues = toPlainArray(v);
							const copyList = toPlainArray(copyValues[k]).filter(
								(_, index) => index !== n,
							);
							copyValues[k] = copyList;
							setQueryResults((prev) => {
								const copyPrev = { ...prev };
								copyPrev.values[i] = copyValues;
								return copyPrev;
							});
							setValue(copyList);
						}}
					>
						<X
							style={{
								width: "var(--icon-size)",
								height: "var(--icon-size)",
							}}
						/>
					</span>
					<input
						disabled={!v.some((data) => data && data.path)}
						aria-label={
							!v.some((data) => data && data.path)
								? "You must have a file.link in one of the columns!"
								: undefined
						}
						// defaultValue={dd}
						type="text"
						value={dd}
						onChange={(e) => {
							const copyValues = toPlainArray(v);
							console.log("e.value: ", e.target.value);
							const copyList = toPlainArray(copyValues[k]);
							copyList[n] = e.target.value;
							copyValues[k] = copyList;
							setQueryResults((prev) => {
								const copyPrev = { ...prev };
								copyPrev.values[i] = copyValues;
								return copyPrev;
							});
							setValue(copyList);
						}}
						className="m-0 w-fit border-transparent bg-transparent p-0 text-start"
					/>
					{/* 
					TODO Can't get this to look quite pretty and usable enough
					{queryResults.headers[k] ===
						"tags" && (
						<a
							href={"#" + dd}
							className="tag"
							target="_blank"
							rel="noopener"
						>
							#{dd}
						</a>
					)} */}
				</li>
			))}
			{/* <li>
				<input
					disabled={!v.some((data) => data && data.path)}
					aria-label={
						!v.some((data) => data && data.path)
							? "You must have a file.link in one of the columns!"
							: undefined
					}
					// defaultValue={dd}
					type="text"
					placeholder="new item"
					value={""}
					onChange={(e) => {
						setQueryResults((prev) => {
							const copyValues = toPlainArray(prev.values);
							const copyList = toPlainArray(copyValues[i][k]);
							copyList.push(e.target.value);
							copyValues[i][k] = copyList;
							updateMetaData(k, copyList, v);
							return {
								...prev,
								values: copyValues,
							};
						});
						//
					}}
					className="m-0 w-fit border-transparent bg-transparent p-0 text-start"
				/>
			</li> */}
			<span
				className="multi-select-pill-remove-button"
				onClick={() => {
					const copyValues = toPlainArray(v);
					const copyList = toPlainArray(copyValues[k]);
					copyList.push("");
					copyValues[k] = copyList;
					setQueryResults((prev) => {
						const copyPrev = { ...prev };
						copyPrev.values[i] = copyValues;
						return copyPrev;
					});
					setValue(copyList);
				}}
			>
				<Plus
					style={{
						width: "var(--icon-size)",
						height: "var(--icon-size)",
					}}
				/>
			</span>
		</ul>
	);
};

const CheckboxInput = ({
	v,
	d,
	i,
	k,
	setQueryResults,
	updateMetaData,
}: {
	v: QueryResults["values"];
	d: string | number;
	i: number;
	k: number;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
}) => {
	const [value, setValue] = useState<boolean>();
	const debouncedValue = useDebounce(
		() => {
			if (value !== false && !value) return;
			updateMetaData(k, value, v);
		},
		value,
		1500,
	);

	useEffect(() => {
		console.log("i am checked? ", d);
	}, [d]);

	return (
		<span className="absolute inset-0 flex items-center justify-center">
			<input
				disabled={!v.some((data) => data && data.path)}
				aria-label={
					!v.some((data) => data && data.path)
						? "You must have a file.link in one of the columns!"
						: undefined
				}
				// defaultValue={d}
				type={"checkbox"}
				// value={d}
				data-indeterminate="false"
				checked={!!d}
				onChange={(e) => {
					// console.log("changed");
					setQueryResults((prev) => {
						const copyPrev = { ...prev };
						copyPrev.values[i][k] = e.target.checked;
						return copyPrev;
					});
					setValue(e.target.checked);
					// updateMetaData(k, e.target.value, v);
				}}
				className="metadata-input-checkbox"
			/>
		</span>
	);
};

const DateTimeInput = ({}) => {};
