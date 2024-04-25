import { loadDependencies } from "@/main";
import {
	CircleAlertIcon,
	Divide,
	File,
	FunctionSquare,
	Link,
	LucideFile,
	Minus,
	Parentheses,
	Plus,
	TagsIcon,
	X,
} from "lucide-react";
import { Debouncer, Notice, Plugin, debounce, setIcon } from "obsidian";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import * as Portal from "@radix-ui/react-portal";

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

const useEnter = (
	ref: React.MutableRefObject<HTMLInputElement>,
	callback: () => void,
) => {
	const eventCallback = (e: KeyboardEvent) => {
		if (e.key !== "Enter") return;
		callback();
	};
	useEffect(() => {
		if (!ref.current) return;
		ref.current.addEventListener("keydown", eventCallback);
		return () =>
			ref.current &&
			ref.current.removeEventListener("keydown", eventCallback);
	}, [ref, callback]);
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
					plugin={plugin}
				/>
			</div>
		</div>
	);
};

const PropertySuggester = ({
	property,
	top,
	left,
	callback,
}: {
	property: string;
	top: number;
	left: number;
	callback: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) => {
	console.log("got property: ", property);
	const suggestions =
		// @ts-ignore
		app.metadataCache.getFrontmatterPropertyValuesForKey(property);

	console.log("suggestions: ", suggestions);
	useEffect(() => {
		console.log("suggester rendered");
	});
	return (
		<Portal.Root id="twcss">
			<div
				className="border-secondary-alt absolute z-[99999] flex flex-col gap-2 rounded-md border-[1px] border-solid bg-primary-alt p-1 text-normal"
				style={{
					top: top + 40,
					left: left,
				}}
			>
				{suggestions?.map((s, i) => (
					<div
						key={i + s + "suggestion"}
						className="rounded-md p-2 hover:bg-secondary-alt"
						onClick={async (e) => callback(e)}
					>
						{s}
					</div>
				)) ?? "No suggestions"}
			</div>
		</Portal.Root>
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

const iconStyle = {
	width: "var(--icon-size)",
	height: "var(--icon-size)",
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

type UpdateMetaData = (k: number, value: any, v: any[]) => Promise<void>;
type DoQuery = () => Promise<void>;

const EditableTable = ({ data, plugin }: { data: string; plugin: Plugin }) => {
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

	const updateMetaData: UpdateMetaData = async (k, value, v) => {
		// console.log("updated?", v, queryResults.headers[k]);
		const link = v.find((d) => d && d.path);
		if (!link) {
			// this shouldn't be possible but whatever
			return console.error("no file link found");
		}
		const { path } = link;
		const file = plugin.app.vault.getFileByPath(path);
		const propName = queryResults.headers[k];
		// if (v[k] !== undefined || v[k] !== null) {
		// 	await meApi.update(queryResults.headers[k], value, path);
		// 	// doQuery();
		// 	return;
		// }
		// await meApi.createYamlProperty(
		// 	queryResults.headers[k],
		// 	value,
		// 	path,
		// );
		// doQuery();
		await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
			console.log("fm: ", frontmatter);
			frontmatter[propName] = value;
		});
		console.log("did it process?");
	};

	// const updateMetaData: UpdateMetaData =
	// 	// I would prefer to use debounce here but it doesn't work nicely across different components
	// 	// debounce(
	// 	async (k, value, v) => {
	// 		console.log("updated?", v, queryResults.headers[k]);
	// 		const link = v.find((d) => d && d.path);
	// 		if (!link) {
	// 			// this shouldn't be possible but whatever
	// 			return;
	// 		}
	// 		const { path } = link;
	// 		if (v[k] !== undefined || v[k] !== null) {
	// 			await meApi.update(queryResults.headers[k], value, path);
	// 			// doQuery();
	// 			return;
	// 		}
	// 		await meApi.createYamlProperty(
	// 			queryResults.headers[k],
	// 			value,
	// 			path,
	// 		);
	// 		// doQuery();
	// 	};
	// // 	,
	// // 	1500,
	// // 	true,
	// // );

	useEffect(() => {
		doQuery();
	}, []);

	if (!queryResults) return <Error>{"Invalid query"}</Error>;
	return (
		<>
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
										doQuery={doQuery}
									/>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</>
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
	doQuery,
}: {
	d: any;
	i: number;
	k: number;
	v: QueryResults["values"];
	queryResults: QueryResults;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
	doQuery: DoQuery;
}) => {
	const propertyType = getPropertyType(queryResults.headers[k]);

	if (d?.__proto__?.constructor?.name === "Link") {
		return <LinkTableData d={d} />;
	}

	// console.log("prop type:", propertyType);

	if (propertyType === "multitext" || propertyType === "tags") {
		return (
			<ArrayInputWrapper
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

	if (propertyType === "number") {
		return (
			<NumberInput
				v={v}
				d={d}
				i={i}
				k={k}
				setQueryResults={setQueryResults}
				updateMetaData={updateMetaData}
				queryResults={queryResults}
			/>
		);
	}

	return (
		<StringInput
			v={v}
			d={d}
			i={i}
			k={k}
			setQueryResults={setQueryResults}
			updateMetaData={updateMetaData}
			queryResults={queryResults}
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

const StringInput = ({
	v,
	d,
	i,
	k,
	setQueryResults,
	updateMetaData,
	queryResults,
}: {
	v: QueryResults["values"];
	d: string | number;
	i: number;
	k: number;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
	queryResults: any;
}) => {
	const ref = useRef<HTMLInputElement>();
	const [rect, setRect] = useState<{ top: number; left: number }>();
	useEnter(ref, async () => {
		await updateMetaData(k, d, v);
		// await doQuery();
	});

	return (
		<div className="relative">
			{rect && (
				<PropertySuggester
					property={queryResults.headers[k]}
					top={rect.top}
					left={rect.left}
					callback={async (e) => {
						const newValue = e.currentTarget.textContent;
						await updateMetaData(k, newValue, v);
					}}
				/>
			)}
			<input
				ref={ref}
				disabled={!v.some((data) => data && data.path)}
				aria-label={
					!v.some((data) => data && data.path)
						? "You must have a file.link in one of the columns!"
						: undefined
				}
				// defaultValue={d}
				type={"text"}
				value={d}
				onChange={(e) => {
					// console.log("changed");
					setQueryResults((prev) => {
						const copyPrev = { ...prev };
						copyPrev.values[i][k] = e.target.value;
						return copyPrev;
					});
					// updateMetaData(k, e.target.value, v);
				}}
				onBlur={async () => {
					await updateMetaData(k, d, v);
					setRect(undefined);
				}}
				onFocus={(e) => {
					const rect = e.target.getBoundingClientRect();
					setRect({
						top: rect.top,
						left: rect.left,
					});
				}}
				className="relative m-0 w-fit border-transparent bg-transparent p-0 text-start"
			/>
		</div>
	);
};

const NumberInput = ({
	v,
	d,
	i,
	k,
	setQueryResults,
	updateMetaData,
	queryResults,
}: {
	v: QueryResults["values"];
	d: string | number;
	i: number;
	k: number;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
	queryResults: any;
}) => {
	const ref = useRef<HTMLInputElement>();
	useEnter(ref, async () => {
		await updateMetaData(k, d, v);
		// await doQuery();
	});

	return (
		<span className="relative">
			<input
				ref={ref}
				disabled={!v.some((data) => data && data.path)}
				aria-label={
					!v.some((data) => data && data.path)
						? "You must have a file.link in one of the columns!"
						: undefined
				}
				// defaultValue={d}
				type={"number"}
				value={d}
				onChange={(e) => {
					// console.log("changed");
					setQueryResults((prev) => {
						const copyPrev = { ...prev };
						copyPrev.values[i][k] = Number(e.target.value);
						return copyPrev;
					});
					// updateMetaData(k, e.target.value, v);
				}}
				onBlur={async () => {
					await updateMetaData(k, Number(d), v);
				}}
				className="m-0 w-fit border-transparent bg-transparent p-0 text-start"
			/>
			{/* <span className="flex w-full items-center justify-center gap-1 p-2">
				<button>
					<Minus
						style={iconStyle}
						onClick={() => {
							const newValue = (Number(d) ?? 0) - 1;
							setQueryResults((prev) => {
								const copyPrev = { ...prev };
								copyPrev.values[i][k] = newValue;
								return copyPrev;
							});
							setValue(newValue);
						}}
					/>
				</button>
				<button>
					<Parentheses style={iconStyle} />
				</button>
				<button>
					<Plus
						style={iconStyle}
						onClick={() => {
							const newValue = (Number(d) ?? 0) + 1;
							setQueryResults((prev) => {
								const copyPrev = { ...prev };
								copyPrev.values[i][k] = newValue;
								return copyPrev;
							});
							setValue(newValue);
						}}
					/>
				</button>
			</span> */}
		</span>
	);
};

const ArrayInputWrapper = ({
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
	// const [value, setValue] = useState<any>();
	// useDebounce(
	// 	() => {
	// 		if (value === undefined || value === null) return;
	// 		updateMetaData(k, value, v);
	// 	},
	// 	value,
	// 	1500,
	// );

	return (
		<ul className="m-0 p-0">
			{d?.map((dd, n) => (
				// <li key={i + k + n.toString()} className="flex">
				// 	<span
				// 		className="multi-select-pill-remove-button"
				// 		onClick={() => {
				// 			const copyValues = toPlainArray(v);
				// 			const copyList = toPlainArray(copyValues[k]).filter(
				// 				(_, index) => index !== n,
				// 			);
				// 			copyValues[k] = copyList;
				// 			setQueryResults((prev) => {
				// 				const copyPrev = { ...prev };
				// 				copyPrev.values[i] = copyValues;
				// 				return copyPrev;
				// 			});
				// 			setValue(copyList);
				// 		}}
				// 	>
				// 		<X style={iconStyle} />
				// 	</span>
				// 	<input
				// 		disabled={!v.some((data) => data && data.path)}
				// 		aria-label={
				// 			!v.some((data) => data && data.path)
				// 				? "You must have a file.link in one of the columns!"
				// 				: undefined
				// 		}
				// 		// defaultValue={dd}
				// 		type="text"
				// 		value={dd}
				// 		onChange={(e) => {
				// 			const copyValues = toPlainArray(v);
				// 			console.log("e.value: ", e.target.value);
				// 			const copyList = toPlainArray(copyValues[k]);
				// 			copyList[n] = e.target.value;
				// 			copyValues[k] = copyList;
				// 			setQueryResults((prev) => {
				// 				const copyPrev = { ...prev };
				// 				copyPrev.values[i] = copyValues;
				// 				return copyPrev;
				// 			});
				// 			setValue(copyList);
				// 		}}
				// 		className="m-0 w-fit border-transparent bg-transparent p-0 text-start"
				// 	/>
				// 	{/*
				// 	TODO Can't get this to look quite pretty and usable enough
				// 	{queryResults.headers[k] ===
				// 		"tags" && (
				// 		<a
				// 			href={"#" + dd}
				// 			className="tag"
				// 			target="_blank"
				// 			rel="noopener"
				// 		>
				// 			#{dd}
				// 		</a>
				// 	)} */}
				// </li>
				<ArrayInput
					key={i + k + n.toString()}
					d={d}
					v={v}
					i={i}
					k={k}
					n={n}
					dd={dd}
					setQueryResults={setQueryResults}
					updateMetaData={updateMetaData}
				/>
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
			<li className="flex">
				<span
					className="multi-select-pill-remove-button"
					onClick={async () => {
						const copyValues = toPlainArray(v);
						const copyList = toPlainArray(copyValues[k]);
						copyList.push("");
						copyValues[k] = copyList;
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							copyPrev.values[i] = copyValues;
							return copyPrev;
						});
						await updateMetaData(k, copyList, v);
					}}
				>
					<Plus style={iconStyle} />
				</span>
				<input
					disabled
					type="text"
					className="m-0 w-fit border-transparent bg-transparent p-0"
				/>
			</li>
		</ul>
	);
};

const ArrayInput = ({
	d,
	v,
	i,
	k,
	n,
	dd,
	setQueryResults,
	updateMetaData,
}: {
	d: (string | number)[];
	v: QueryResults["values"];
	i: number;
	k: number;
	n: number;
	dd: string | number;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	updateMetaData: UpdateMetaData;
}) => {
	const ref = useRef<HTMLInputElement>();
	useEnter(ref, async () => {
		await updateMetaData(k, d, v);
		// await doQuery();
	});
	return (
		<li className="flex">
			<span
				className="multi-select-pill-remove-button"
				onClick={async () => {
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
					await updateMetaData(k, copyList, v);
				}}
			>
				<X style={iconStyle} />
			</span>
			<input
				ref={ref}
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
				}}
				onBlur={async () => {
					await updateMetaData(k, d, v);
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
		async () => {
			if (value !== false && !value) return;
			await updateMetaData(k, value, v);
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
