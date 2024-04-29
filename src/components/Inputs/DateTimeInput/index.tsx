import React, { useEffect, useRef, useState } from "react";
import {
	CommonEditableProps,
	DataviewFile,
	QueryResults,
} from "../../../lib/types";
import { PropertySuggester } from "../../PropertySuggester";
import { useEnter } from "../../../hooks/useEnter";
import { LinkTableData } from "@/components/LinkTableData";
import { checkIsLink, getPropertyType } from "@/lib/utils";

export const DateTimeInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyName,
	file,
	plugin,
	setQueryResults,
	updateMetaData,
	isTime,
}: CommonEditableProps & { isTime: boolean }) => {
	const ref = useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const isoString = (() => {
		try {
			return new Date(propertyValue).toISOString();
		} catch (e) {
			console.error("error in datetime: ", e);
			return new Date().toISOString();
		}
	})();
	const parsedDateString = isTime
		? isoString.substring(0, 16)
		: isoString.substring(0, 9);

	const [value, setValue] = useState(parsedDateString);

	const updateProperty = async () => {
		await updateMetaData(propertyName, propertyValue, file.path);
	};
	useEnter(ref, updateProperty);

	return (
		<div className="relative">
			{!isEditing && (
				<span className="flex h-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt">
					<span
						className="flex w-full"
						style={{
							justifyContent: plugin.settings.alignmentByType[
								getPropertyType(propertyName)
							]?.enabled
								? plugin.settings.alignmentByType[
										getPropertyType(propertyName)
									].horizontal
								: plugin.settings.horizontalAlignment,
						}}
						onClick={() => setIsEditing(true)}
						onFocus={() => setIsEditing(true)}
					>
						{!propertyValue
							? plugin.settings.emptyValueDisplay
							: isTime
								? new Date(propertyValue).toLocaleString()
								: new Date(propertyValue).toLocaleDateString()}
					</span>
				</span>
			)}
			{isEditing && (
				<input
					ref={ref}
					className={
						"metadata-input metadata-input-text m-0 border-transparent bg-transparent " +
						isTime
							? "mod-datetime"
							: "mod-date"
					}
					autoFocus
					// max="9999-12-31T23:59"
					type={isTime ? "datetime-local" : "date"}
					value={value}
					placeholder="Empty"
					onChange={(e) => {
						if (!e.target.validity.valid || !e.target.value) return;
						setValue(e.target.value);
						// console.log("changed");
						// setQueryResults((prev) => {
						// 	const copyPrev = { ...prev };
						// 	const newValue = new Date(e.target.value)
						// 		.toISOString()
						// 		.substring(0, 16);
						// 	copyPrev.values[propertyValueArrIndex][
						// 		propertyValueIndex
						// 	] = newValue;
						// 	return copyPrev as QueryResults;
						// });
					}}
					onBlur={async (e) => {
						setIsEditing(false);
						const newVal = isTime
							? new Date(e.target.value).toLocaleString()
							: new Date(e.target.value).toLocaleDateString();
						updateMetaData(propertyName, newVal, file.path);
					}}
				></input>
			)}
		</div>
	);
};
