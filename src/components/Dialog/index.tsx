import { App, Modal } from "obsidian";
import React, { ReactNode, useCallback, useEffect, useRef } from "react";
import { Root, createRoot } from "react-dom/client";
import * as Portal from "@radix-ui/react-portal";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const DialogSample = ({
	defaultOpen,
	open,
	onOpenChange,
	modal,
}: Dialog.DialogProps) => (
	<Dialog.Root
		defaultOpen={defaultOpen}
		open={open}
		onOpenChange={onOpenChange}
		modal={modal}
	>
		<Dialog.Portal>
			<div className="twcss modal-container">
				<Dialog.Overlay className="modal-bg" />
				<Dialog.Content className="modal">
					<Dialog.Title className="m-0">Sample Dialog</Dialog.Title>
					<Dialog.DialogDescription>
						This is a sample dialog
					</Dialog.DialogDescription>
					<Dialog.Close className="modal-close-button border-none bg-transparent shadow-none" />
				</Dialog.Content>
			</div>
		</Dialog.Portal>
	</Dialog.Root>
);

const DialogRoot = (props: Dialog.DialogProps) => (
	<Dialog.Root
		defaultOpen={props.defaultOpen}
		open={props.open}
		onOpenChange={props.onOpenChange}
		modal={true}
	>
		<Dialog.Portal>
			<div className="twcss modal-container">
				<Dialog.Overlay className="modal-bg" />
				{props.children}
			</div>
		</Dialog.Portal>
	</Dialog.Root>
);
const DialogTrigger = (props: Dialog.DialogTriggerProps) => (
	<Dialog.Trigger {...props}>{props.children}</Dialog.Trigger>
);
const DialogContent = (props: Dialog.DialogContentProps) => (
	<Dialog.Content {...props} className={cn("modal", props.className)}>
		{props.children}
	</Dialog.Content>
);
const DialogTitle = (props: Dialog.DialogTitleProps) => (
	<Dialog.Title className="m-0" {...props} />
);
const DialogDescription = (props: Dialog.DialogDescriptionProps) => (
	<Dialog.Description {...props} />
);
const DialogClose = (props: Dialog.DialogCloseProps) => (
	<Dialog.Close
		className="modal-close-button border-none bg-transparent shadow-none"
		{...props}
	/>
);

export {
	DialogRoot,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogClose,
};

export class DialogClass extends Modal {
	isConfirmed: boolean;
	root: Root;
	children: ReactNode;

	constructor(
		app: App,
		title: string,
		onClose: (isConfirmed: boolean) => void,
		children: ReactNode,
	) {
		super(app);
		this.setTitle(title);
		this.isConfirmed = false;
		this.root = createRoot(this.containerEl);
		this.onClose = () => onClose(this.isConfirmed);
		this.children = children;
	}

	onOpen(): void {
		this.root.render(this.children);
	}
}
