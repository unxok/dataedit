import { Markdown } from "@/components/Markdown";
import {
	updateMetaData,
	tryToMarkdownLink,
	getJustifyContentClass,
} from "@/lib/utils";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { InputSwitchProps } from "..";
import { useBlock } from "@/components/BlockProvider";
import { usePluginSettings } from "@/stores/global";
import { Suggester } from "@/components/ui/Popover";

export const ArrayInput = (props: InputSwitchProps<(string | number)[]>) => {
	const { propertyName, propertyValue, filePath } = props;
	const { plugin, blockId } = useBlock();
	const { getBlockConfig } = usePluginSettings();
	const { listItemPrefix, horizontalAlignment, lockEditing } =
		getBlockConfig(blockId);

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
		<ul
			className="m-0 flex w-full flex-col gap-1 p-0 pl-0"
			style={{ listStyleType: listItemPrefix }}
		>
			{propertyValue?.map((item, i) => (
				<li key={i} className="ml-8">
					<div className="flex">
						<ArrayInputItem
							{...props}
							itemValue={item}
							itemIndex={i}
							updateProperty={updateProperty}
						/>
					</div>
				</li>
			))}
			{/* <li className="w-full list-none"> */}
			<div
				className={
					"flex w-full " + getJustifyContentClass(horizontalAlignment)
				}
			>
				<div
					className={`clickable-icon w-fit ${lockEditing && "cursor-not-allowed opacity-50"}`}
					aria-label="New item"
					onClick={async () => {
						if (lockEditing) return;
						await updateProperty(propertyValue.length, "", true);
					}}
				>
					<Plus className="svg-icon" />
				</div>
			</div>
			{/* </li> */}
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
	const { itemValue, itemIndex, propertyType, propertyName, updateProperty } =
		props;
	const { plugin, ctx, blockId } = useBlock();
	const { getBlockConfig } = usePluginSettings();
	const {
		showAutoComplete,
		renderMarkdown,
		horizontalAlignment,
		lockEditing,
	} = getBlockConfig(blockId);
	const [isEditing, setIsEditing] = useState(false);
	const [isSuggestShown, setIsSuggestShown] = useState(false);
	const [selectedSuggestion, setSelectedSuggestion] = useState<string>();
	const [query, setQuery] = useState(itemValue);
	const plainText = tryToMarkdownLink(itemValue);

	const onBlur = async (value: string) => {
		// console.log(e.target.value);
		await updateProperty(itemIndex, value);
		setIsEditing(false);
		setIsSuggestShown(false);
	};

	const onKeyDown = async (key: string, value: string) => {
		if (key === "Escape") {
			// console.log("esc");
			setIsSuggestShown(false);
		}
		if (key === "Enter") {
			await onBlur(value);
		}
	};

	const getSuggestions = (q: string) => {
		const suggestions: string[] =
			// @ts-ignore
			app.metadataCache.getFrontmatterPropertyValuesForKey(propertyName);
		if (!suggestions || suggestions?.length === 0) return;
		return suggestions.filter((s) => s.includes(q));
	};

	if (!isEditing || lockEditing) {
		return (
			<Markdown
				disabled={!renderMarkdown}
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={
					propertyType === "tags"
						? "#" + plainText
						: plainText.toString()
				}
				className={
					"flex h-fit min-h-4 w-full [&_*]:my-0 " +
					getJustifyContentClass(horizontalAlignment)
				}
				onClick={() => {
					if (!lockEditing) {
						setIsEditing(true);
						setIsSuggestShown(true);
					}
				}}
			/>
		);
	}

	return (
		<Suggester
			open={isSuggestShown}
			query={query.toString()}
			onSelect={(text) => {
				// console.log("selected: ", text);
				setSelectedSuggestion(text);
			}}
			getSuggestions={getSuggestions}
			plugin={plugin}
			disabled={!showAutoComplete}
		>
			<input
				type="text"
				defaultValue={itemValue}
				autoFocus
				onKeyDown={(e) => onKeyDown(e.key, e.currentTarget.value)}
				onBlur={(e) => onBlur(selectedSuggestion ?? e.target.value)}
				onChange={(e) => setQuery(e.target.value)}
			/>
		</Suggester>
	);
};
