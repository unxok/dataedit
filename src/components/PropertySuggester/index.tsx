import React from "react";
import * as Portal from "@radix-ui/react-portal";

export const PropertySuggester = ({
	propertyName,
	position,
	callback,
}: {
	propertyName: string;
	position: { top: number; left: number } | undefined;
	callback: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) => {
	// console.log("got property: ", propertyName);
	const suggestions =
		// @ts-ignore
		app.metadataCache.getFrontmatterPropertyValuesForKey(propertyName);

	// console.log("suggestions: ", suggestions);
	// useEffect(() => {
	//   console.log("suggester rendered");
	// });
	return (
		<Portal.Root id="twcss">
			<div
				className="absolute z-[99999] flex flex-col gap-2 rounded-md border-[1px] border-solid border-secondary-alt bg-primary-alt p-1 text-normal"
				style={{
					top: position?.top ? position.top + 60 : 0,
					left: position?.left ? position.left : 0,
					opacity: position ? 1 : 0,
				}}
			>
				{suggestions?.map((s, i) => (
					<div
						key={i + s + "suggestion"}
						className="rounded-md p-2 hover:bg-secondary-alt"
						onMouseEnter={async (e) => {
							console.log("callback called");
							callback(e);
						}}
					>
						{s}
					</div>
				)) ?? "No suggestions"}
			</div>
		</Portal.Root>
	);
};
