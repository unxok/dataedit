import { Markdown } from "@/components/Markdown";
import {
	getAlignItemsClass,
	getJustifyContentClass,
	updateMetaData,
} from "@/lib/utils";
import React, { useState } from "react";
import { InputSwitchProps } from "..";
import { useBlock } from "@/components/BlockProvider";
import { usePluginSettings } from "@/stores/global";
import { Minus, Parentheses, Plus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/Dialog";

export const NumberInput = (props: InputSwitchProps<number>) => {
	const { propertyName, propertyValue, filePath } = props;
	const num = Number.isNaN(Number(propertyValue)) ? 0 : Number(propertyValue);
	const { ctx, plugin, blockId } = useBlock();
	const {
		settings: { renderNullAs },
		getBlockConfig,
	} = usePluginSettings();
	const {
		horizontalAlignment,
		verticalAlignment,
		renderMarkdown,
		lockEditing,
		showNumberButtons,
	} = getBlockConfig(blockId);
	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setDialogOpen] = useState(false);
	const [calculated, setCalculated] = useState(num);

	const doCalculation = (expression: string) => {
		let result = 0;
		try {
			result = eval(`((x) => (${expression}))(${num})`);
		} catch (e) {
			result = NaN;
		}
		setCalculated(result);
	};

	const justify = getJustifyContentClass(horizontalAlignment);
	const vertical = getAlignItemsClass(verticalAlignment).split("-")[1];

	if (!isEditing || lockEditing) {
		return (
			<div
				className={
					"flex h-full w-full flex-col " + "justify-" + vertical
				}
			>
				<Markdown
					disabled={!renderMarkdown}
					app={plugin.app}
					filePath={ctx.sourcePath}
					plainText={propertyValue?.toString() || renderNullAs}
					className={
						"flex h-fit min-h-4 w-full break-keep [&_*]:my-0 " +
						justify
					}
					onClick={() => {
						!lockEditing && setIsEditing(true);
					}}
				/>
				{!lockEditing && showNumberButtons && (
					<div className={"flex w-full " + justify}>
						<div
							aria-label="Subtract 1"
							className="clickable-icon"
							onClick={async () => {
								await updateMetaData(
									propertyName,
									num - 1,
									filePath,
									plugin,
								);
								setIsEditing(false);
							}}
						>
							<Minus className="svg-icon" />
						</div>
						<div
							aria-label="Enter expression"
							className="clickable-icon"
							onClick={() => setDialogOpen(true)}
						>
							<Parentheses className="svg-icon" />
							{isDialogOpen && (
								<Dialog
									open={isDialogOpen}
									onOpenChange={(b) => {
										setCalculated(num);
										setDialogOpen(b);
									}}
								>
									<DialogContent className="flex flex-col gap-3">
										<DialogHeader>
											<DialogTitle>
												Expression input
											</DialogTitle>
											<DialogDescription>
												Enter any valid{" "}
												<a href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Math">
													Javascript math expression
													<span className="external-link" />
												</a>
												. You may use <code>x</code> to
												use the current value in your
												expressions
											</DialogDescription>
										</DialogHeader>
										<input
											autoFocus
											type="text"
											placeholder="(x + 5)**2 - Math.PI"
											className="w-full"
											onChange={(e) =>
												doCalculation(e.target.value)
											}
											onKeyDown={async (e) => {
												if (
													e.key !== "Enter" ||
													Number.isNaN(calculated)
												)
													return;
												await updateMetaData(
													propertyName,
													calculated,
													filePath,
													plugin,
												);
												setDialogOpen(false);
											}}
										/>
										<div>
											Calculated:{" "}
											{Number.isNaN(calculated) ? (
												<span className="text-error">
													Invalid
												</span>
											) : (
												<span className="text-success">
													{calculated}
												</span>
											)}
										</div>
										<DialogFooter>
											<button
												onClick={() =>
													setDialogOpen(false)
												}
											>
												cancel
											</button>
											<button
												disabled={Number.isNaN(
													calculated,
												)}
												onClick={async () => {
													await updateMetaData(
														propertyName,
														calculated,
														filePath,
														plugin,
													);
													setDialogOpen(false);
												}}
												className="mod-cta"
											>
												update
											</button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							)}
						</div>
						<div
							aria-label="Add 1"
							className="clickable-icon"
							onClick={async () => {
								const val = Number(propertyValue);
								const num = Number.isNaN(val) ? 0 : val;
								await updateMetaData(
									propertyName,
									num + 1,
									filePath,
									plugin,
								);
								setIsEditing(false);
							}}
						>
							<Plus className="svg-icon" />
						</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<input
			type="number"
			defaultValue={propertyValue}
			autoFocus
			onBlur={async (e) => {
				const num = Number(e.target.value);
				if (Number.isNaN(num)) return;
				await updateMetaData(propertyName, num, filePath, plugin);
				setIsEditing(false);
			}}
		/>
	);
};
