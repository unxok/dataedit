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
		console.log("preArray: ", arr);
		const postArr = arr.array();
		console.log("postArr: ", postArr);
		return postArr;
	} catch (e) {
		return arr;
	}
};

/**
 * Gets the obsidian property type for a frontmatter property
 * @param propertyName The frontmatter property name
 * @returns The corresponding Obsidian property type
 */
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

/**
 * Checks if a string is a tag
 * @param str The string to test
 * @returns `true` if a #tag or `false` if not
 * ---
 * ```js
 *
 * CheckIsTag('#hello') // true
 *
 * CheckIsTag('world') && CheckIsTag('# wrong') // false
 * ```
 */
export const checkIsTag = (str: string) => {
	const reg = new RegExp(/^#[^\s].*/);
	return reg.test(str);
};

export const checkIsLink = (val: any) => {
	if (!val) return false;
	if (val.hasOwnProperty("type")) {
		return val.type === "file";
	}
	return false;
};

export const tryToMarkdownLink = (val: any) => {
	if (checkIsLink(val)) {
		return val.markdown();
	}
	return val;
};

/**
 * Add key value pairs to an object if it doesn't have the keys
 * @param oldObj The original object to add keys to
 * @param newObj The new object to take new key value pairs from
 * @returns The old object but with key value pairs added form the new object
 * ---
 * ```js
 *
 * const oldObj = {foo: 'bar'};
 * const newObj = {foo: 'bleh', fizz: 'buzz'}
 *
 * addNewKeyValues(oldObj, newObj) // {foo: 'bar', fizz: 'buzz'}
 * ```
 */
export const addNewKeyValues = (
	oldObj: Record<string, any>,
	newObj: Record<string, any>,
) => {
	const result = { ...oldObj };
	for (const key in newObj) {
		if (!result.hasOwnProperty(key)) {
			result[key] = newObj[key];
		}
	}
	return result;
};
