import { Markdown } from "@/components/Markdown";
import {
	dvRenderNullAs,
	getJustifyContentClass,
	updateMetaData,
} from "@/lib/utils";
import React, { useState } from "react";
import { InputSwitchProps } from "..";
import { useBlock } from "@/components/BlockProvider";
import { usePluginSettings } from "@/stores/global";

export const NumberInput = (props: InputSwitchProps<number>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { ctx, plugin, blockId } = useBlock();
	const { getBlockConfig } = usePluginSettings();
	const { horizontalAlignment, renderMarkdown } = getBlockConfig(blockId);
	const [isEditing, setIsEditing] = useState(false);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				disabled={!renderMarkdown}
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={propertyValue?.toString() || dvRenderNullAs}
				className={
					"flex h-fit min-h-4 w-full break-keep [&_*]:my-0 " +
					getJustifyContentClass(horizontalAlignment)
				}
				onClick={() => {
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	return (
		<input
			type="number"
			defaultValue={propertyValue}
			autoFocus
			onBlur={async (e) => {
				const num = Number(e.target.value);
				if (Number.isNaN(num)) return;
				await updateMetaData(propertyName, num, filePath, plugin);
				setIsEditing(false);
			}}
		/>
	);
};
