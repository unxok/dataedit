import DataEdit from "@/main";
import { clsx, type ClassValue } from "clsx";
import { TFile, stringifyYaml } from "obsidian";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Use this to convert Data Arrays from Dataview to regular arrays
 * @param arr A Dataview Data Array
 * @returns A plain js array
 */
export const toPlainArray = (arr: any) => {
	try {
		// console.log("preArray: ", arr);
		const postArr = arr.array();
		// console.log("postArr: ", postArr);
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
export const getPropertyType: (propertyName: string) => string | undefined = (
	propertyName,
) => {
	// @ts-ignore
	const { metadataTypeManager } = app;
	const preType = metadataTypeManager.properties[propertyName]?.type as
		| string
		| undefined;
	if (preType) return preType;
	if (propertyName.includes(".")) return "object";
	return "inline";
};

/**
 * Extracts property names and aliases from a dataview query
 * @param text The first line of a Dataview query
 * @returns An object with an alias as the key and property name for value
 * ---
 * ```js
 *
 * const line = 'TABLE property as alias, another AS "one here"';
 * getColAliasObj(line);
 * // {alias: property, "one here": another}
 * ```
 */
export const getColAliasObj: (text: string) => Record<string, string> = (
	text,
) => {
	const regex = new RegExp(/(\S+)\s+AS\s+"?([^\s,"]+)"?,?/gim);
	const matches = text.match(regex);
	if (!matches) return {};
	return matches.reduce((acc, cur) => {
		const match = regex.exec(cur);
		if (!match) return acc;
		const [_, property, alias] = match;
		return {
			...acc,
			[alias]: property,
		};
	}, {});
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

/**
 * Remove keys from old object if key is not in new object
 * @param oldObj The original object to add keys to
 * @param newObj The new object to take new key value pairs from
 * @returns The old object but with keys removed
 * ---
 * ```js
 *
 * const oldObj = {foo: 'bleh', fizz: 'buzz'}
 * const newObj = {foo: 'bar'};
 *
 * addNewKeyValues(oldObj, newObj) // {foo: 'bleh'}
 * ```
 */
export const removeKeys = (
	oldObj: Record<string, any>,
	newObj: Record<string, any>,
) => {
	const result = { ...oldObj };
	for (const key in oldObj) {
		if (!newObj.hasOwnProperty(key)) {
			delete result[key];
		}
	}
	return result;
};

/**
 * Using keys provided in a dot separated string, assign a value and return the object
 * @param obj The starting object
 * @param str Dot separated values corresponding to keys of `obj`
 * @param val The value to set for the final key from `str`
 * @returns A copy of `obj` but with `val` as a value for the key specified in `str`
 * ---
 * ```js
 * const keyStr = 'propName.some.nested.property'
 * iterateStringKeys({}, keyStr, 'value')
 * // { some: { nested: { property: 'value' } } }
 * ```
 */
export const iterateStringKeys = (
	obj: Record<string, any>,
	str: string,
	val: any,
) => {
	const keys = str.split(".");
	let current = obj;

	keys.forEach((key, index) => {
		// if (index === 0) return;
		if (index === keys.length - 1) {
			return (current[key] = val);
		}
		current[key] = current[key] || {};
		current = current[key];
	});

	return obj;
};

export const checkForInlineField = (
	propertyName: string,
	filePath: string,
	dataviewApi: any,
) => {
	const f = dataviewApi.page(filePath);
	if (f.file.frontmatter.hasOwnProperty(propertyName))
		return { success: false };
	if (f.hasOwnProperty(propertyName))
		return { success: true, value: f[propertyName] };
	return { success: false };
};

const parseLinesForInlineFields = (lines: string[]) => {
	const reg = new RegExp(
		/[\[\(]?([^\n\r\(\[]*)::[ ]*([^\)\]\n\r]*)[\]\)]?/gm,
	);
	return lines.reduce<
		{
			key: string;
			value: InlinePropertyValue;
			line: number;
			match: string;
		}[]
	>((prev, curr, index) => {
		let matches = reg.exec(curr);
		if (!matches) {
			return prev;
		}
		const key = matches[1].trim();
		const oldVal = matches[2].trim();
		return [
			...prev,
			{
				key: key,
				value: oldVal,
				line: index,
				match: matches[0],
			},
		];
	}, []);
};

type InlinePropertyValue = string | number | boolean | null | undefined;
/**
 * Updates an inline field. Will throw an error if inline field is not defined in the file
 * @param propertyName Property name to update
 * @param oldValue The previous property value
 * @param newValue The new property value to update to
 * @param file The file containing the inline field
 * @param plugin The Dataedit plugin
 */
const udpateInlineField = async (
	propertyName: string,
	oldValue: InlinePropertyValue,
	newValue: InlinePropertyValue,
	file: TFile,
	plugin: DataEdit,
) => {
	const pageContent = await plugin.app.vault.cachedRead(file);
	const lines = pageContent.split("\n");
	const inlineFields = parseLinesForInlineFields(lines);
	const foundField = inlineFields.find(({ key, value }) => {
		if (key !== propertyName) return false;
		if (value.toString() !== oldValue.toString()) return false;
		return true;
	});
	if (!foundField) {
		throw new Error(
			"Tried updating an inline field but couldn't find matching field. This should be impossible. Property name: " +
				propertyName,
		);
	}
	const oldLineContent = lines[foundField.line];
	const newLineContent = oldLineContent.replace(
		foundField.match,
		foundField.match.replace(oldValue?.toString(), newValue?.toString()),
	);
	lines[foundField.line] = newLineContent;

	// console.log("inlineFields: ", inlineFields);
	// console.log("found line: ", oldLineContent);
	// console.log("new line: ", newLineContent);

	await plugin.app.vault.modify(file, lines.join("\n"));
};

/**
 * Updates meta data properties in a given file
 * @param propertyName The property name to update the value for
 * @param propertyValue The new value to update to
 * @param filePath Path to the file containing the property
 * @param plugin The Dataedit plugin
 */
export const updateMetaData = async (
	propertyName: string,
	propertyValue: any,
	filePath: string,
	plugin: DataEdit,
) => {
	// console.log("updated?", v, queryResults.headers[k]);
	const file = plugin.app.vault.getFileByPath(filePath);
	if (!file) {
		throw new Error("Tried to update property but couldn't find file");
	}
	await plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
		// console.log("fm: ", frontmatter);
		const arr = propertyName.split(".");
		if (arr.length === 1) {
			// @ts-ignore
			const dv = app.plugins.plugins.dataview.api;
			const isInlineField = checkForInlineField(
				propertyName,
				filePath,
				dv,
			);
			if (isInlineField.success) {
				if (propertyValue === isInlineField.value) return;
				return udpateInlineField(
					propertyName,
					isInlineField.value,
					propertyValue,
					file,
					plugin,
				);
			}
			return (frontmatter[propertyName] = propertyValue);
		}
		const frontmatterObj = iterateStringKeys(
			frontmatter,
			propertyName,
			propertyValue,
		);
		return (frontmatter = stringifyYaml(frontmatterObj));
	});
	// await updateDataeditLinks();
};

// @ts-ignore
export const dv = app.plugins.plugins?.dataview?.api;

// TODO make this a setting
export const dvRenderNullAs = "\\-";

export const currentLocale = () => {
	if (typeof window === "undefined") return "en-US";
	return window.navigator.language;
};
