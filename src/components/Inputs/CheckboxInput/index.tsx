import React from "react";
import { CommonEditableProps, QueryResults } from "../../../lib/types";

export const CheckboxInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyName,
	file,
	setQueryResults,
	updateMetaData,
}: CommonEditableProps) => {
	return (
		<span className="flex items-center justify-center p-2">
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
