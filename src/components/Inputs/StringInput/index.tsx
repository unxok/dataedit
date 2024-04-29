import React, {
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	CommonEditableProps,
	DataviewFile,
	QueryResults,
} from "../../../lib/types";
import { PropertySuggester } from "../../PropertySuggester";
import { useEnter, useEnterEl } from "../../../hooks/useEnter";
import { LinkTableData } from "@/components/LinkTableData";
import { checkIsLink, getPropertyType } from "@/lib/utils";
import { Suggest, createSuggest, useSuggest } from "@/hooks/useSuggest";

export const StringInput = (props: CommonEditableProps) => {
	const {
		propertyValue,
		propertyName,
		file,
		config,
		setQueryResults,
		updateMetaData,
		plugin,
	} = props;
	const [isEditing, setIsEditing] = useState(false);
	const isLink = checkIsLink(propertyValue);

	const updateProperty = async () => {
		const newValue = isLink ? propertyValue.markdown() : propertyValue;
		await updateMetaData(propertyName, newValue, file.path);
	};

	const ref = useRef<HTMLInputElement>(null);

	return (
		<div className="relative">
			{!isEditing && (
				<span className="flex h-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt">
					{isLink ? (
						<>
							<LinkTableData file={propertyValue} />
							<span
								className="w-full"
								onClick={() => setIsEditing(true)}
								onFocus={() => setIsEditing(true)}
							>
								&nbsp;
							</span>
						</>
					) : (
						<span
							className="flex w-full"
							style={{
								justifyContent: config.alignmentByType[
									getPropertyType(propertyName)
								]?.enabled
									? config.alignmentByType[
											getPropertyType(propertyName)
										].horizontal
									: config.horizontalAlignment,
							}}
							onClick={() => {
								ref?.current?.focus();
								setIsEditing(true);
							}}
							onFocus={() => {
								ref?.current?.focus();
								setIsEditing(true);
							}}
						>
							{propertyValue || config.emptyValueDisplay}
						</span>
					)}
				</span>
			)}
			{isEditing && (
				<Input
					isLink={isLink}
					setQueryResults={setQueryResults}
					setIsEditing={setIsEditing}
					updateProperty={updateProperty}
					updateMetaData={updateMetaData}
					{...props}
				/>
				// <input
				// 	ref={ref}
				// 	// ref={measuredRef}
				// 	style={{
				// 		display: isEditing ? "block" : "none",
				// 	}}
				// 	autoFocus
				// 	// defaultValue={d}
				// 	type={"text"}
				// 	value={isLink ? propertyValue.markdown() : propertyValue}
				// 	onChange={(e) => {
				// 		// console.log("changed");
				// 		setQueryResults((prev) => {
				// 			const copyPrev = { ...prev };
				// 			copyPrev.values[propertyValueArrIndex][
				// 				propertyValueIndex
				// 			] = e.target.value;
				// 			return copyPrev as QueryResults;
				// 		});
				// 	}}
				// 	onBlur={async () => {
				// 		await updateProperty();
				// 		setIsEditing(false);
				// 	}}
				// 	onFocus={(e) => {}}
				// 	className="relative m-0 border-transparent bg-transparent p-0 text-start"
				// />
			)}
		</div>
	);
};

const Input = ({
	isLink,
	propertyValue,
	propertyName,
	propertyValueIndex,
	propertyValueArrIndex,
	plugin,
	file,
	setQueryResults,
	setIsEditing,
	updateProperty,
	updateMetaData,
}: {
	isLink: boolean;
	setQueryResults: (value: React.SetStateAction<QueryResults>) => void;
	setIsEditing: (value: React.SetStateAction<boolean>) => void;
	updateProperty: () => Promise<void>;
	updateMetaData: (p: string, v: any, f: string) => void;
} & CommonEditableProps) => {
	const ref = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (!ref?.current) return console.log("no ref");
		new Suggest(
			plugin.app,
			ref.current,
			(q) => {
				const sugg =
					// @ts-ignore
					plugin.app.metadataCache?.getFrontmatterPropertyValuesForKey(
						propertyName,
					);
				console.log("sug: ", sugg);
				return [q, ...sugg];
			},
			(v) => updateMetaData(propertyName, v, file.path),
		);
		ref.current.focus();
	}, []);
	return (
		<input
			ref={ref}
			type={"text"}
			value={isLink ? propertyValue.markdown() : propertyValue}
			onChange={(e) => {
				// console.log("changed");
				setQueryResults((prev) => {
					const copyPrev = { ...prev };
					copyPrev.values[propertyValueArrIndex][propertyValueIndex] =
						e.target.value;
					return copyPrev as QueryResults;
				});
			}}
			onBlur={async () => {
				await updateProperty();
				setIsEditing(false);
			}}
			onFocus={(e) => {}}
			className="relative m-0 border-transparent bg-transparent p-0 text-start"
		/>
	);
};
