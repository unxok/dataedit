import { useBlock } from "@/components/App";
import { Markdown } from "@/components/Markdown";
import { dvRenderNullAs, updateMetaData } from "@/lib/utils";
import React, { useState } from "react";
import { InputSwitchProps } from "..";

export const NumberInput = (props: InputSwitchProps<number>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { ctx, plugin } = useBlock();
	const [isEditing, setIsEditing] = useState(false);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={propertyValue?.toString() ?? dvRenderNullAs}
				className="h-full min-h-4 w-full break-keep [&_*]:my-0"
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
