import React, { useRef, useState } from "react";
import { CommonEditableProps, QueryResults } from "../../../lib/types";
import { PropertySuggester } from "../../PropertySuggester";
import { useEnter } from "../../../hooks/useEnter";

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

	useEnter(ref, async () => {
		await updateMetaData(propertyName, propertyValue, file.path);
		// await doQuery();
	});

	return (
		<div className="relative">
			{rect && (
				<PropertySuggester
					propertyName={propertyName}
					position={rect}
					callback={async (e) => {
						const newValue = e?.currentTarget?.textContent;
						if (!newValue) return;
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							copyPrev.values[propertyValueArrIndex][
								propertyValueIndex
							] = newValue;
							return copyPrev as QueryResults;
						});
					}}
				/>
			)}
			{!isEditing && (
				<span
					className="flex h-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt"
					tabIndex={0}
					onClick={() => setIsEditing(true)}
					onFocus={() => setIsEditing(true)}
				>
					{propertyValue}
				</span>
			)}
			{isEditing && (
				<input
					ref={ref}
					autoFocus
					// defaultValue={d}
					type={"text"}
					value={propertyValue}
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
						await updateMetaData(
							propertyName,
							propertyValue,
							file.path,
						);
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
