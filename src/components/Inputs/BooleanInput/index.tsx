import { updateMetaData } from "@/lib/utils";
import React from "react";
import { InputSwitchProps } from "..";
import { useBlock } from "@/components/BlockProvider";

export const BooleanInput = (props: InputSwitchProps<boolean>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { plugin } = useBlock();

	return (
		<input
			type="checkbox"
			disabled={!!isLocked}
			defaultChecked={!!propertyValue}
			className={isLocked ? "opacity-50" : ""}
			onClick={(e) => {
				updateMetaData(
					propertyName,
					e.currentTarget.checked,
					filePath,
					plugin,
				);
			}}
		/>
	);
};
