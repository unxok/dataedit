import React from "react";
import * as Portal from "@radix-ui/react-portal";

/*****************
# TO DO    
- Add keyboard nav
  - make into select/options?
  
*****************/

export const PropertySuggester = ({
	propertyName,
	position,
	onMouseEnter,
	onMouseLeave,
	initial,
}: {
	propertyName: string;
	position: { top: number; left: number } | undefined;
	onMouseEnter: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	onMouseLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	initial?: string;
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
		<Portal.Root className="twcss">
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
						onMouseEnter={async (e) => onMouseEnter(e)}
						onMouseLeave={async (e) => onMouseLeave(e)}
					>
						{s}
					</div>
				)) ?? "No suggestions"}
			</div>
		</Portal.Root>
	);
};
