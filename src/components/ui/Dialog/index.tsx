import { App, Modal } from "obsidian";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Root, createRoot } from "react-dom/client";
import * as Portal from "@radix-ui/react-portal";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// export const DialogSample = ({
// 	defaultOpen,
// 	open,
// 	onOpenChange,
// 	modal,
// }: Dialog.DialogProps) => (
// 	<Dialog.Root
// 		defaultOpen={defaultOpen}
// 		open={open}
// 		onOpenChange={onOpenChange}
// 		modal={modal}
// 	>
// 		<Dialog.Portal>
// 			<div className="twcss modal-container">
// 				<Dialog.Overlay className="modal-bg" />
// 				<Dialog.Content className="modal">
// 					<Dialog.Title className="m-0">Sample Dialog</Dialog.Title>
// 					<Dialog.DialogDescription>
// 						This is a sample dialog
// 					</Dialog.DialogDescription>
// 					<Dialog.Close className="modal-close-button border-none bg-transparent shadow-none" />
// 				</Dialog.Content>
// 			</div>
// 		</Dialog.Portal>
// 	</Dialog.Root>
// );

// const DialogRoot = (props: Dialog.DialogProps) => (
// 	<Dialog.Root
// 		defaultOpen={props.defaultOpen}
// 		open={props.open}
// 		onOpenChange={props.onOpenChange}
// 		modal={true}
// 	>
// 		<Dialog.Portal>
// 			<div className="twcss modal-container">
// 				<Dialog.Overlay className="modal-bg" />
// 				{props.children}
// 			</div>
// 		</Dialog.Portal>
// 	</Dialog.Root>
// );
// const DialogTrigger = (props: Dialog.DialogTriggerProps) => (
// 	<Dialog.Trigger {...props}>{props.children}</Dialog.Trigger>
// );
// const DialogContent = (props: Dialog.DialogContentProps) => (
// 	<Dialog.Content {...props} className={cn("modal", props.className)}>
// 		{props.children}
// 	</Dialog.Content>
// );
// const DialogTitle = (props: Dialog.DialogTitleProps) => (
// 	<Dialog.Title className="m-0" {...props} />
// );
// const DialogDescription = (props: Dialog.DialogDescriptionProps) => (
// 	<Dialog.Description {...props} />
// );
// const DialogClose = (props: Dialog.DialogCloseProps) => (
// 	<Dialog.Close
// 		className="modal-close-button border-none bg-transparent shadow-none"
// 		{...props}
// 	/>
// );

// export {
// 	DialogRoot,
// 	DialogTrigger,
// 	DialogContent,
// 	DialogTitle,
// 	DialogDescription,
// 	DialogClose,
// };

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 modal-bg",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<div className="twcss modal-container">
			<DialogOverlay className="modal-bg" />
			<DialogPrimitive.Content
				ref={ref}
				className={cn("modal", className)}
				{...props}
			>
				{children}
				<DialogPrimitive.Close asChild>
					<div className="modal-close-button">
						{/* <X className="h-4 w-4" /> */}
						<span className="sr-only">Close</span>
					</div>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</div>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("m-0", className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm text-muted", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	// DialogPortal,
	// DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};

export const ConfirmationDialog = ({
	title,
	description,
	// onCancel,
	onConfirm,
	open,
	setOpen,
}: {
	title: string;
	description?: string;
	// onCancel?: () => void;
	onConfirm?: () => void;
	open: boolean;
	setOpen: (b: boolean) => void;
}) => {
	console.log("we out here");
	return (
		<Dialog open={open} onOpenChange={(b) => setOpen(b)} modal>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && (
						<DialogDescription>{description}</DialogDescription>
					)}
				</DialogHeader>
				<DialogFooter>
					<DialogClose>cancel</DialogClose>
					<DialogClose
						className="mod-cta"
						onClick={() => onConfirm()}
					>
						confirm
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
