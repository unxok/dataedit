import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useEnter } from "../../../hooks/useEnter";
import { CommonEditableProps, QueryResults } from "../../../lib/types";
import { Minus, Parentheses, Plus } from "lucide-react";
import { getPropertyType, iconStyle } from "@/lib/utils";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogRoot,
	DialogSample,
	DialogTitle,
} from "@/components/Dialog";

export const NumberInput = ({
	propertyValue,
	propertyValueArrIndex,
	propertyValueIndex,
	propertyName,
	file,
	plugin,
	config,
	setQueryResults,
	updateMetaData,
}: CommonEditableProps) => {
	const ref = useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setDialogOpen] = useState(false);
	const [expression, setExpression] = useState("");
	const [calculated, setCalculated] = useState<{
		error: boolean;
		message: string | number;
	}>({ error: false, message: "" });

	useEffect(() => {
		try {
			const x = propertyValue;
			const possibleNum = eval(expression);
			const num = Number(possibleNum);
			if (Number.isNaN(num)) {
				throw new Error("Not a valid expression");
			}
			setCalculated({ error: false, message: num });
		} catch (e) {
			setCalculated({ error: true, message: e.message });
		}
	}, [expression]);

	useEnter(ref, async () => {
		await updateMetaData(propertyName, Number(propertyValue), file.path);
		// await doQuery();
	});

	return (
		<span className="relative">
			{!isEditing && (
				<span
					className="flex h-full items-center whitespace-nowrap p-1 focus:border-[1px] focus:border-solid focus:border-secondary-alt"
					style={{
						justifyContent: config.alignmentByType[
							getPropertyType(propertyName)
						]?.enabled
							? config.alignmentByType[
									getPropertyType(propertyName)
								].horizontal
							: config.horizontalAlignment,
					}}
					tabIndex={0}
					onClick={() => setIsEditing(true)}
					onFocus={() => setIsEditing(true)}
				>
					{propertyValue ?? config.emptyValueDisplay}
				</span>
			)}
			{isEditing && (
				<input
					ref={ref}
					autoFocus
					// defaultValue={d}
					type={"number"}
					value={propertyValue}
					onChange={(e) => {
						// console.log("changed");
						setQueryResults((prev) => {
							const copyPrev = { ...prev };
							copyPrev.values[propertyValueArrIndex][
								propertyValueIndex
							] = Number(e.target.value);
							return copyPrev as QueryResults;
						});
						// updateMetaData(k, e.target.value, v);
					}}
					onBlur={async () => {
						await updateMetaData(
							propertyName,
							Number(propertyValue),
							file.path,
						);
						setIsEditing(false);
					}}
					className="m-0 border-transparent bg-transparent p-0 text-start"
				/>
			)}
			{config.showNumberButtons && (
				<>
					<span className="flex w-full items-center justify-center gap-1 p-2">
						<button>
							<Minus
								style={iconStyle}
								onClick={() => {
									updateMetaData(
										propertyName,
										Number(propertyValue) - 1,
										file.path,
									);
								}}
							/>
						</button>
						<button onClick={() => setDialogOpen(true)}>
							<Parentheses style={iconStyle} />
						</button>
						<button>
							<Plus
								style={iconStyle}
								onClick={() => {
									updateMetaData(
										propertyName,
										Number(propertyValue) + 1,
										file.path,
									);
								}}
							/>
						</button>
					</span>
					<DialogRoot
						open={isDialogOpen}
						onOpenChange={setDialogOpen}
					>
						<DialogContent>
							<DialogTitle>Expression</DialogTitle>
							<DialogDescription>
								<span>
									Enter a valid js math expression. Use{" "}
									<code>x</code> as the current number value
								</span>
							</DialogDescription>
							<span>
								<ul className="mt-0">
									<li>
										<a
											href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Math#assignment_operators"
											rel="noopener"
											target="_blank"
											aria-label="MDN JS mathematic reference"
										>
											MDN JS mathematic reference
										</a>
										<span className="external-link" />
									</li>
									<li>
										<a
											href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math"
											rel="noopener"
											target="_blank"
											aria-label="MDN JS Math namespace"
										>
											MDN JS Math namespace
										</a>
										<span className="external-link" />
									</li>
								</ul>
							</span>

							<div className="flex w-full flex-col gap-3 pb-3">
								<input
									type="text"
									placeholder="(1 + x) * 3"
									className="w-full"
									onChange={(e) =>
										setExpression(e.target.value)
									}
								/>
								<div>Calculated: {calculated.message}</div>
							</div>
							<div className="flex w-full items-center justify-end gap-2">
								<button onClick={() => setDialogOpen(false)}>
									cancel
								</button>
								<button
									className="bg-accent text-on-accent"
									disabled={calculated.error}
									onClick={() => {
										setDialogOpen(false);
										updateMetaData(
											propertyName,
											calculated.message,
											file.path,
										);
									}}
								>
									update
								</button>
							</div>

							<DialogClose />
						</DialogContent>
					</DialogRoot>
				</>
			)}
		</span>
	);
};
