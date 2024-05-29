import React from "react";
import { CommonEditableProps, QueryResults } from "../../../../lib/types";
import { getPropertyType } from "@/lib/utils";

export const CheckboxInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyName,
	file,
	config,
	plugin,
	setQueryResults,
	updateMetaData,
}: CommonEditableProps) => {
	return (
		<span
			className="flex items-center p-2"
			style={{
				justifyContent: config.alignmentByType[
					getPropertyType(propertyName)
				]?.enabled
					? config.alignmentByType[getPropertyType(propertyName)]
							.horizontal
					: config.horizontalAlignment,
			}}
		>
			<input
				// defaultValue={d}
				type={"checkbox"}
				// value={d}
				data-indeterminate="false"
				checked={!!propertyValue}
				onChange={async (e) => {
					// console.log("changed");
					setQueryResults((prev) => {
						const copyPrev = { ...prev };
						copyPrev.values[propertyValueArrIndex][
							propertyValueIndex
						] = e.target.checked;
						return copyPrev as QueryResults;
					});
					await updateMetaData(
						propertyName,
						e.target.checked,
						file.path,
					);
				}}
				className="metadata-input-checkbox"
			/>
		</span>
	);
};
