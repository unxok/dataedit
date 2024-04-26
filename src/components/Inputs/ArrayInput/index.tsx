import { Plus, X } from "lucide-react";
import React, { useRef } from "react";
import { useEnter } from "../../../hooks/useEnter";
import { CommonEditableProps, QueryResults } from "../../../lib/types";
import { toPlainArray, iconStyle } from "../../../lib/utils";
import { useKeyboardClick } from "../../../hooks/useKeyboardClick";

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
}: CommonEditableProps & { itemValue: string; itemIndex: number }) => {
	const ref = useRef<HTMLInputElement>(null);
	const xRef = useRef<HTMLSpanElement>(null);

	useKeyboardClick(xRef);
	useEnter(ref, async () => {
		await updateMetaData(propertyName, propertyValue, file.path);
		// await doQuery();
	});
	return (
		<li className="flex">
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
			<input
				ref={ref}
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
					await updateMetaData(
						propertyName,
						propertyValue,
						file.path,
					);
				}}
				className="m-0 border-transparent bg-transparent p-0 text-start"
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
