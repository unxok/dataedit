import { getJustifyContentClass, updateMetaData } from "@/lib/utils";
import React from "react";
import { InputSwitchProps } from "..";
import { useBlock } from "@/components/BlockProvider";
import { usePluginSettings } from "@/stores/global";

export const BooleanInput = (props: InputSwitchProps<boolean>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { plugin, blockId } = useBlock();
	const { getBlockConfig } = usePluginSettings();
	const { horizontalAlignment } = getBlockConfig(blockId);
	return (
		<div
			className={
				"flex h-fit w-full " +
				getJustifyContentClass(horizontalAlignment)
			}
		>
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
		</div>
	);
};
