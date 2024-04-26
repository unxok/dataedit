import React, { useRef, useState } from "react";
import { useEnter } from "../../../hooks/useEnter";
import { CommonEditableProps, QueryResults } from "../../../lib/types";

export const NumberInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyName,
	file,
	setQueryResults,
	updateMetaData,
}: CommonEditableProps) => {
	const ref = useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);

	useEnter(ref, async () => {
		await updateMetaData(propertyName, Number(propertyValue), file.path);
		// await doQuery();
	});

	return (
		<span className="relative">
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
					type={"number"}
					value={propertyValue}
					onChange={(e) => {
						// console.log("changed");
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							copyPrev.values[propertyValueArrIndex][
								propertyValueIndex
							] = Number(e.target.value);
							return copyPrev as QueryResults;
						});
						// updateMetaData(k, e.target.value, v);
					}}
					onBlur={async () => {
						await updateMetaData(
							propertyName,
							Number(propertyValue),
							file.path,
						);
						setIsEditing(false);
					}}
					className="m-0 border-transparent bg-transparent p-0 text-start"
				/>
			)}
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
