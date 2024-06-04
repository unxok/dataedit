import React from "react";
import {
	getJustifyContentClass,
	isDateWithTime,
	tryToMarkdownLink,
} from "@/lib/utils";
import { DateTime } from "luxon";
import { Markdown } from "../Markdown";
import { ArrayInput } from "./ArrayInput";
import { BooleanInput } from "./BooleanInput";
import { DateTimeInput } from "./DateTimeInput";
import { NumberInput } from "./NumberInput";
import { StringInput } from "./StringInput";
import { useBlock } from "../BlockProvider";
import { TdProps } from "../App";
import { FILE } from "@/lib/consts";
import { usePluginSettings } from "@/stores/global";

export type InputSwitchProps<T> = {
	propertyType: string;
} & TdProps<T>;

export const InputSwitch = (props: InputSwitchProps<unknown>) => {
	const { plugin, ctx, blockId } = useBlock();
	const { propertyValue, propertyType, propertyName } = props;
	const { getBlockConfig } = usePluginSettings();
	const { horizontalAlignment } = getBlockConfig(blockId);

	if (
		propertyType.toLowerCase() === FILE ||
		propertyName.toLowerCase() === FILE ||
		propertyName.toLowerCase() === "file.link"
	) {
		return (
			<Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={propertyValue as string}
				className={
					"flex w-full flex-row [&_*]:my-0 " +
					getJustifyContentClass(horizontalAlignment)
				}
			/>
		);
	}

	// TODO if value is falsey, use property type to render input
	// it CANNOT be inline if it is falsey
	if (!propertyValue) {
		// console.log(
		// 	"got propertyType: ",
		// 	propertyType,
		// 	"for prop: ",
		// 	propertyValue,
		// );
		switch (propertyType) {
			case "aliases":
			case "text":
			case "object": {
				return <StringInput {...(props as InputSwitchProps<string>)} />;
			}
			case "checkbox": {
				return (
					<BooleanInput {...(props as InputSwitchProps<boolean>)} />
				);
			}
			case "date": {
				return (
					<DateTimeInput
						hasTime={false}
						{...(props as InputSwitchProps<DateTime>)}
					/>
				);
			}
			case "datetime": {
				return (
					<DateTimeInput
						hasTime={true}
						{...(props as InputSwitchProps<DateTime>)}
					/>
				);
			}
			case "multitext": {
				return (
					<ArrayInput
						{...(props as InputSwitchProps<(string | number)[]>)}
					/>
				);
			}
			case "number": {
				return <NumberInput {...(props as InputSwitchProps<number>)} />;
			}
			case "tags": {
				return (
					<ArrayInput
						{...(props as InputSwitchProps<(string | number)[]>)}
					/>
				);
			}
			default: {
				return <StringInput {...(props as InputSwitchProps<string>)} />;
			}
		}
	}

	// Dataview will sometimes parse property values to a different type than what is defined in the metadataTypeManager
	// As well, inline fields won't have a type and frontmatter objects will be considered the default of text
	// So the type of input to render is determined from the value's actual type instead of the property type itself
	switch (typeof propertyValue) {
		case "string":
			return <StringInput {...(props as InputSwitchProps<string>)} />;
		case "number":
			return <NumberInput {...(props as InputSwitchProps<number>)} />;
		case "object":
			if (Array.isArray(propertyValue)) {
				return (
					<ArrayInput
						{...(props as InputSwitchProps<(string | number)[]>)}
					/>
				);
			}

			if (DateTime.isDateTime(propertyValue)) {
				const hasTime = isDateWithTime(propertyValue);
				return (
					<DateTimeInput
						hasTime={hasTime}
						{...(props as InputSwitchProps<DateTime>)}
					/>
				);
			}

			const potentialMarkdownLink = tryToMarkdownLink(propertyValue);
			if (typeof potentialMarkdownLink === "string") {
				return (
					<StringInput
						{...(props as InputSwitchProps<string>)}
						propertyValue={potentialMarkdownLink}
					/>
				);
			}
			return <div>{"[Object object]"}</div>;

		case "boolean":
			return <BooleanInput {...(props as InputSwitchProps<boolean>)} />;
		default:
			return (
				<Markdown
					app={plugin.app}
					filePath={ctx.sourcePath}
					plainText={(propertyValue as string) ?? "null"}
					className="h-full min-h-4 w-full break-keep [&_*]:my-0"
				/>
			);
	}
};
