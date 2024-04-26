import React from "react";
import { DataviewFile } from "../../lib/types";

export const LinkTableData = ({ file }: { file: DataviewFile | string }) => {
	// console.log("got file: ", file);
	if (typeof file === "string") return;
	let fileName = undefined;
	try {
		fileName = file.fileName();
	} catch (e) {
		console.error("failed to get file name: ", e);
	}

	return (
		<span className="flex h-full items-center p-1">
			<a
				href={file.path}
				data-tooltip-position="top"
				aria-label={file.path}
				data-href={file.path}
				className={"internal-link"}
				target="_blank"
				rel="noopener"
				data-test={file}
			>
				{fileName ?? "failed to load file name"}
			</a>
		</span>
	);
};
