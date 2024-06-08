import { getJustifyContentClass, updateMetaData } from "@/lib/utils";
import React from "react";
import { InputSwitchProps } from "..";
import { useBlock } from "@/components/BlockProvider";
import { usePluginSettings } from "@/stores/global";
import { SettingToggle } from "@/components/Setting";

export const BooleanInput = (props: InputSwitchProps<boolean>) => {
	const { propertyName, propertyValue, filePath } = props;
	const { plugin, blockId } = useBlock();
	const { getBlockConfig } = usePluginSettings();
	const { horizontalAlignment, lockEditing, useToggleForCheckbox } =
		getBlockConfig(blockId);
	return (
		<div
			className={
				"flex h-fit w-full " +
				getJustifyContentClass(horizontalAlignment)
			}
		>
			{!useToggleForCheckbox && (
				<input
					type="checkbox"
					disabled={!!lockEditing}
					defaultChecked={!!propertyValue}
					className={lockEditing ? "opacity-50" : ""}
					onClick={(e) => {
						updateMetaData(
							propertyName,
							e.currentTarget.checked,
							filePath,
							plugin,
						);
					}}
				/>
			)}
			{useToggleForCheckbox && (
				<SettingToggle
					checked={!!propertyValue}
					onCheckedChange={(b) => {
						updateMetaData(propertyName, b, filePath, plugin);
					}}
					disabled={lockEditing}
				/>
			)}
		</div>
	);
};
