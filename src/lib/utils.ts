import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export /**
 * Use this to convert Data Arrays from Dataview to regular arrays
 * @param arr A Dataview Data Array
 * @returns A plain js array
 */
const toPlainArray = (arr: any) => {
	try {
		return arr.array();
	} catch (e) {
		return arr;
	}
};

export const getPropertyType = (propertyName: string) => {
	// @ts-ignore
	const { metadataTypeManager } = app;
	return metadataTypeManager.properties[propertyName]?.type as
		| string
		| undefined;
};

export const iconStyle = {
	width: "var(--icon-size)",
	height: "var(--icon-size)",
};
