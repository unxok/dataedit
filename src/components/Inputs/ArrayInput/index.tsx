import { Hash, Plus, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useEnter } from "../../../hooks/useEnter";
import {
	CommonEditableProps,
	DataviewFile,
	QueryResults,
} from "../../../lib/types";
import {
	toPlainArray,
	iconStyle,
	checkIsTag,
	checkIsLink,
	tryToMarkdownLink,
} from "../../../lib/utils";
import { useKeyboardClick } from "../../../hooks/useKeyboardClick";
import { PropertySuggester } from "@/components/PropertySuggester";
import { LinkTableData } from "@/components/LinkTableData";

export const ArrayInputWrapper = (props: CommonEditableProps) => {
	const {
		propertyValue,
		propertyValueArrIndex,
		propertyValueIndex,
		propertyValueArr,
		propertyName,
		file,
		setQueryResults,
		updateMetaData,
	} = props;

	const plusRef = useRef<HTMLSpanElement>(null);
	useKeyboardClick(plusRef);

	return (
		<ul className="m-0 p-0">
			{propertyValue?.map((val, n) => (
				<ArrayInput
					key={
						propertyValueArrIndex +
						propertyValueIndex +
						n.toString()
					}
					itemValue={val}
					itemIndex={n}
					{...props}
				/>
			))}
			<li className="flex">
				<span
					ref={plusRef}
					tabIndex={0}
					className="multi-select-pill-remove-button focus:border-[1px] focus:border-solid focus:border-secondary-alt"
					onClick={async () => {
						const copyValues = toPlainArray(propertyValueArr);
						const copyList =
							toPlainArray(copyValues[propertyValueIndex]) ?? [];
						copyList.push("");
						copyValues[propertyValueIndex] = copyList;
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							copyPrev.values[propertyValueArrIndex] = copyValues;
							return copyPrev as QueryResults;
						});
						await updateMetaData(propertyName, copyList, file.path);
					}}
				>
					<Plus style={iconStyle} />
				</span>
				<input
					disabled
					type="text"
					className="m-0 border-transparent bg-transparent p-0"
				/>
			</li>
		</ul>
	);
};

const ArrayInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyValueArr,
	propertyName,
	file,
	setQueryResults,
	updateMetaData,
	itemValue,
	itemIndex,
	plugin,
}: CommonEditableProps & { itemValue: string; itemIndex: number }) => {
	const [rect, setRect] = useState<{ top: number; left: number }>();
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState("");
	const ref = useRef<HTMLInputElement>(null);
	const xRef = useRef<HTMLSpanElement>(null);
	// @ts-ignore
	const isLink = checkIsLink(itemValue);

	// console.log("isLink? ", isLink, itemValue);

	// const setEditingTrue = () => {
	// 	// this is so the potential tag anchor can be clicked
	// 	setIsEditing(true);
	// 	tagRef.current.click();
	// };
	useKeyboardClick(xRef);
	const updateProperty = async () => {
		const preNewItemValue = value || itemValue;
		const preNewValue = [...propertyValue];
		preNewValue[itemIndex] = preNewItemValue;
		const newValue = preNewValue.map((v) => tryToMarkdownLink(v));
		console.log("newValue: ", newValue);
		await updateMetaData(propertyName, newValue, file.path);
	};

	useEnter(ref, updateProperty);

	return (
		<li className="flex items-center">
			<span
				className="multi-select-pill-remove-button focus:border-[1px] focus:border-solid focus:border-secondary-alt"
				tabIndex={0}
				ref={xRef}
				onClick={async () => {
					const copyValues = toPlainArray(propertyValueArr);
					const copyList = toPlainArray(
						copyValues[propertyValueIndex],
					).filter((_, index) => index !== itemIndex);
					copyValues[propertyValueIndex] = copyList;
					setQueryResults((prev) => {
						const copyPrev = { ...prev };
						copyPrev.values[propertyValueArrIndex] = copyValues;
						return copyPrev as QueryResults;
					});
					await updateMetaData(propertyName, copyList, file.path);
				}}
			>
				<X style={iconStyle} />
			</span>
			{rect && (
				<PropertySuggester
					propertyName={propertyName}
					position={rect}
					onMouseEnter={(e) => {
						const newValue = e?.currentTarget?.textContent;
						setValue(newValue);
					}}
					onMouseLeave={(e) => setValue("")}
				/>
			)}
			{!isEditing && (
				<span className="flex h-full w-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt">
					{isLink ? (
						<>
							<LinkTableData file={itemValue} />
							<span
								className="w-full"
								onClick={() => setIsEditing(true)}
								onFocus={() => setIsEditing(true)}
							>
								&nbsp;
							</span>
						</>
					) : propertyName.toLowerCase() === "tags" ? (
						<>
							<a
								// ref={tagRef}
								href={"#" + itemValue}
								aria-label={"#" + itemValue}
								className="tag whitespace-nowrap"
								target="_blank"
								rel="noopener"
								tabIndex={0}
								// onClick={(e) => setIsEditing(true)}
								// onFocus={() => setIsEditing(true)}
							>
								#{itemValue}
							</a>
							<span
								className="h-full w-full"
								tabIndex={0}
								onClick={() => setIsEditing(true)}
								onFocus={() => setIsEditing(true)}
							>
								&nbsp;
							</span>
						</>
					) : (
						<span
							className="w-full"
							tabIndex={0}
							onClick={() => setIsEditing(true)}
							onFocus={() => setIsEditing(true)}
						>
							{itemValue || <>&nbsp;</>}
						</span>
					)}
				</span>
			)}
			{isEditing && (
				<input
					ref={ref}
					autoFocus
					// defaultValue={dd}
					type="text"
					value={itemValue}
					onChange={(e) => {
						const copyValues = toPlainArray(propertyValueArr);
						console.log("e.value: ", e.target.value);
						const copyList = toPlainArray(
							copyValues[propertyValueIndex],
						);
						copyList[itemIndex] = e.target.value;
						copyValues[propertyValueIndex] = copyList;
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							copyPrev.values[propertyValueArrIndex] = copyValues;
							return copyPrev as QueryResults;
						});
					}}
					onBlur={async () => {
						await updateProperty();
						setRect(undefined);
						setIsEditing(false);
					}}
					onFocus={(e) => {
						const rect = e.target.getBoundingClientRect();
						setRect({
							top: rect.top,
							left: rect.left,
						});
					}}
					className="m-0 border-transparent bg-transparent p-0 text-start"
				/>
			)}
		</li>
	);
};
