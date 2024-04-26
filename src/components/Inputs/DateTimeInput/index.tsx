import React, { useEffect, useRef, useState } from "react";
import {
	CommonEditableProps,
	DataviewFile,
	QueryResults,
} from "../../../lib/types";
import { PropertySuggester } from "../../PropertySuggester";
import { useEnter } from "../../../hooks/useEnter";
import { LinkTableData } from "@/components/LinkTableData";
import { checkIsLink } from "@/lib/utils";

export const DateTimeInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyName,
	file,
	setQueryResults,
	updateMetaData,
	isTime,
}: CommonEditableProps & { isTime: boolean }) => {
	const ref = useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const thisDate = new Date(propertyValue);
	const dateString = !propertyValue
		? ""
		: isTime
			? thisDate.toLocaleString()
			: thisDate.toLocaleDateString();

	const updateProperty = async () => {
		await updateMetaData(propertyName, propertyValue, file.path);
	};
	useEnter(ref, updateProperty);

	return (
		<div className="relative">
			{!isEditing && (
				<span className="flex h-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt">
					<span
						className="w-full"
						onClick={() => setIsEditing(true)}
						onFocus={() => setIsEditing(true)}
					>
						{dateString || <>&nbsp;</>}
					</span>
				</span>
			)}
			{isEditing && (
				<input
					ref={ref}
					className="metadata-input metadata-input-text mod-datetime m-0 border-transparent bg-transparent"
					autoFocus
					max="9999-12-31T23:59"
					type="datetime-local"
					value={dateString}
					placeholder="Empty"
					onChange={(e) => {
						// console.log("changed");
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							const preNewValue = new Date(e.target.value);
							const newValue = isTime
								? preNewValue.toLocaleString()
								: preNewValue.toLocaleString();
							copyPrev.values[propertyValueArrIndex][
								propertyValueIndex
							] = newValue;
							return copyPrev as QueryResults;
						});
					}}
					onBlur={async () => {
						await updateProperty();
						setIsEditing(false);
					}}
				></input>
			)}
		</div>
	);
};
