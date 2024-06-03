import { Markdown } from "@/components/Markdown";
import {
	currentLocale,
	dvRenderNullAs,
	getJustifyContentClass,
	updateMetaData,
} from "@/lib/utils";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { InputSwitchProps } from "..";
import { useBlock } from "@/components/BlockProvider";
import { usePluginSettings } from "@/stores/global";

export const DateTimeInput = (
	props: InputSwitchProps<DateTime> & { hasTime: boolean },
) => {
	const { propertyName, propertyValue, filePath, isLocked, hasTime } = props;
	const { ctx, plugin, blockId } = useBlock();
	const { getBlockConfig } = usePluginSettings();
	const { horizontalAlignment, renderMarkdown } = getBlockConfig(blockId);
	const [isEditing, setIsEditing] = useState(false);
	const [{ formattedDate, inputDate }, setDateStrings] = useState({
		formattedDate: null,
		inputDate: null,
	});
	const locale = currentLocale();
	const dvSettings: {
		defaultDateTimeFormat: string;
		defaultDateFormat: string;
		// @ts-ignore
	} = app.plugins.plugins?.dataview?.settings;
	const defaultFormat = hasTime
		? dvSettings.defaultDateTimeFormat
		: dvSettings.defaultDateFormat;
	const inputFormat = hasTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd";
	const max = hasTime ? "9999-12-31T23:59" : "9999-12-31";

	useEffect(() => {
		if (!DateTime.isDateTime(propertyValue)) {
			setDateStrings({
				formattedDate: null,
				inputDate: null,
			});
		}
		if (DateTime.isDateTime(propertyValue)) {
			const formattedDate = propertyValue
				.toLocal()
				.toFormat(defaultFormat, { locale });
			const inputDate = propertyValue.toLocal().toFormat(inputFormat);
			setDateStrings({ formattedDate, inputDate });
		}
	}, [propertyValue]);

	if (!isEditing || isLocked) {
		return (
			<Markdown
				disabled={!renderMarkdown}
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={formattedDate || dvRenderNullAs}
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
			type={hasTime ? "datetime-local" : "date"}
			defaultValue={inputDate}
			max={max}
			autoFocus
			onBlur={async (e) => {
				await updateMetaData(
					propertyName,
					e.target.value,
					filePath,
					plugin,
				);

				setIsEditing(false);
			}}
		/>
	);
};
