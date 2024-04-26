import React from "react";
import { DataviewFile } from "../../lib/types";

export const LinkTableData = ({ file }: { file: DataviewFile | string }) => {
	if (typeof file === "string") return;
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
				{file.fileName()}
			</a>
		</span>
	);
};
