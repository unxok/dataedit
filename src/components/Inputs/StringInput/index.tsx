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

export const StringInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyName,
	file,
	setQueryResults,
	updateMetaData,
}: CommonEditableProps) => {
	const ref = useRef<HTMLInputElement>(null);
	const [rect, setRect] = useState<{ top: number; left: number }>();
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState("");

	const isLink = checkIsLink(propertyValue);

	useEffect(() => console.log("value: ", value), [value]);
	const updateProperty = async () => {
		const preNewValue = value || propertyValue;
		const newValue = isLink ? preNewValue.markdown() : preNewValue;
		await updateMetaData(propertyName, newValue, file.path);
	};
	useEnter(ref, updateProperty);

	return (
		<div className="relative">
			{rect && (
				<PropertySuggester
					propertyName={propertyName}
					position={rect}
					onMouseEnter={(e) => {
						const newValue = e?.currentTarget?.textContent;
						setValue(newValue ?? "");
					}}
					onMouseLeave={(e) => setValue("")}
				/>
			)}
			{!isEditing && (
				<span className="flex h-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt">
					{isLink ? (
						<>
							<LinkTableData file={propertyValue} />
							<span
								className="w-full"
								onClick={() => setIsEditing(true)}
								onFocus={() => setIsEditing(true)}
							>
								&nbsp;
							</span>
						</>
					) : (
						<span
							className="w-full"
							onClick={() => setIsEditing(true)}
							onFocus={() => setIsEditing(true)}
						>
							{propertyValue || <>&nbsp;</>}
						</span>
					)}
				</span>
			)}
			{isEditing && (
				<input
					ref={ref}
					autoFocus
					// defaultValue={d}
					type={"text"}
					value={isLink ? propertyValue.markdown() : propertyValue}
					onChange={(e) => {
						// console.log("changed");
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							copyPrev.values[propertyValueArrIndex][
								propertyValueIndex
							] = e.target.value;
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
					className="relative m-0 border-transparent bg-transparent p-0 text-start"
				/>
			)}
		</div>
	);
};
