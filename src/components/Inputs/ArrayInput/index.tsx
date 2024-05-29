import { useBlock } from "@/components/App";
import { Markdown } from "@/components/Markdown";
import { updateMetaData, tryToMarkdownLink } from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { InputSwitchProps } from "..";

export const ArrayInput = (props: InputSwitchProps<(string | number)[]>) => {
	const { propertyName, propertyValue, filePath, isLocked } = props;
	const { plugin } = useBlock();

	const updateProperty = async (
		itemIndex: number,
		newValue: string | number,
		allowFalsey?: boolean,
	) => {
		const newArrayValue = [...propertyValue];
		newArrayValue[itemIndex] = newValue;
		const filtered = allowFalsey
			? newArrayValue
			: newArrayValue.filter((v) => !!v);
		await updateMetaData(propertyName, filtered, filePath, plugin);
	};

	return (
		<ul className="m-0 flex flex-col gap-1 p-0">
			{propertyValue?.map((item, i) => (
				<li key={i} className="flex">
					{"- "}
					<ArrayInputItem
						{...props}
						itemValue={item}
						itemIndex={i}
						updateProperty={updateProperty}
					/>
				</li>
			))}
			<li>
				<div
					className={`clickable-icon w-fit ${isLocked && "cursor-not-allowed opacity-50"}`}
					aria-label="New item"
					onClick={async () => {
						if (isLocked) return;
						await updateProperty(propertyValue.length, "", true);
					}}
				>
					<Plus className="svg-icon" />
				</div>
			</li>
		</ul>
	);
};

const ArrayInputItem = (
	props: InputSwitchProps<(string | number)[]> & {
		itemValue: string | number;
		itemIndex: number;
		updateProperty: (
			itemIndex: number,
			newValue: string | number,
		) => Promise<void>;
	},
) => {
	const { isLocked, itemValue, itemIndex, propertyType, updateProperty } =
		props;
	const { ctx, plugin } = useBlock();
	const [isEditing, setIsEditing] = useState(false);
	const plainText = tryToMarkdownLink(itemValue);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={
					propertyType === "tags" ? "#" + plainText : plainText
				}
				className="min-h-4 w-full [&_*]:my-0"
				onClick={() => {
					!isLocked && setIsEditing(true);
				}}
			/>
		);
	}

	return (
		<input
			type="text"
			defaultValue={itemValue}
			autoFocus
			onBlur={async (e) => {
				// console.log(e.target.value);
				await updateProperty(itemIndex, e.target.value);
				setIsEditing(false);
			}}
		/>
	);
};
