import React, { useEffect, useRef, useState } from "react";
import { DataviewFile } from "../../../lib/types";
import { useEnter } from "../../../hooks/useEnter";
import { LinkTableData } from "../../LinkTableData";
import { Plugin } from "obsidian";
import DataEdit from "@/main";
import { Settings } from "@/components/PluginSettings";

export const FileInput = ({
	file,
	plugin,
	config,
}: {
	file: DataviewFile;
	plugin: DataEdit;
	config: Settings;
}) => {
	const ref = useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState(file.fileName());

	useEffect(() => console.log("value: ", value), [value]);

	const updateFileName = async () => {
		// console.log("update file name called");
		const thisFile = plugin.app.vault.getFileByPath(file.path);
		if (!thisFile) {
			return console.error("Tried renaming file when it doesn't exist?");
		}
		const pathNoFileReg = new RegExp(/^(.*)\//);
		const fileNoExtReg = new RegExp(/.+?(?=\.)/);
		console.log("value: ", value);
		console.log("filepath: ", file.path);
		const newFileNoExt = fileNoExtReg.exec(value)?.[1] ?? value;
		const oldPathNoFile = pathNoFileReg.exec(file.path)?.[1] ?? "";
		const newPath = oldPathNoFile + newFileNoExt + ".md";
		plugin.app.fileManager.renameFile(thisFile, newPath);
	};
	useEnter(ref, updateFileName);

	return (
		<div
			className="relative flex h-full w-full"
			style={{
				justifyContent: config.alignmentByType["text"]?.enabled
					? config.alignmentByType["text"].horizontal
					: config.horizontalAlignment,
			}}
		>
			{!isEditing && (
				<span className="flex h-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt">
					<LinkTableData file={file} />
					<span
						className="w-full"
						onClick={() => setIsEditing(true)}
						onFocus={() => setIsEditing(true)}
					>
						&nbsp;
					</span>
				</span>
			)}
			{isEditing && (
				<input
					ref={ref}
					autoFocus
					// defaultValue={d}
					type={"text"}
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
					}}
					onBlur={async () => {
						await updateFileName();
						setIsEditing(false);
					}}
					className="relative m-0 border-transparent bg-transparent p-0 text-start"
				/>
			)}
		</div>
	);
};
