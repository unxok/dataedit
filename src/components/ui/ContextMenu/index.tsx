import * as ContextMenu from "@radix-ui/react-context-menu";
import { ChevronRight } from "lucide-react";
import React, {
	ElementRef,
	PropsWithChildren,
	ReactNode,
	forwardRef,
} from "react";

const ContextMenuRoot = ({ children }: { children: ReactNode }) => (
	<ContextMenu.Root>{children}</ContextMenu.Root>
);

const ContextMenuTrigger = ({ children }: { children: ReactNode }) => (
	<ContextMenu.Trigger>{children}</ContextMenu.Trigger>
);

const ContextMenuPortal = ({ children }: { children: ReactNode }) => (
	<ContextMenu.Portal>{children}</ContextMenu.Portal>
);

const ContextMenuContent = forwardRef<any, { children: ReactNode }>(
	({ children }, ref) => (
		<ContextMenu.Content
			className="menu twcss"
			style={{ position: "relative" }}
			ref={ref}
		>
			{children}
		</ContextMenu.Content>
	),
);

const ContextMenuLabel = ({ children }: { children: ReactNode }) => (
	<ContextMenu.Label>{children}</ContextMenu.Label>
);

const ContextMenuItem = ({
	children,
	onSelect,
}: {
	children: ReactNode;
	onSelect?: (e: Event) => void;
}) => (
	<ContextMenu.Item
		className="menu-item hover:bg-secondary-alt"
		onSelect={onSelect}
		data-section="selection-link"
	>
		<div className="menu-item-title">{children}</div>
	</ContextMenu.Item>
);

const ContextMenuSub = ({ children }: { children: ReactNode }) => (
	<ContextMenu.Sub>{children}</ContextMenu.Sub>
);

const ContextMenuSubTrigger = ({ children }: { children: ReactNode }) => (
	<ContextMenu.SubTrigger>
		<div className="menu-item has-submenu hover:bg-secondary-alt">
			<div className="menu-item-title">{children}</div>
			<div className="menu-item-icon mod-submenu">
				<ChevronRight className="svg-icon lucide-chevron-right" />
			</div>
		</div>
	</ContextMenu.SubTrigger>
);

const ContextMenuSubContent = forwardRef<any, { children: ReactNode }>(
	({ children }, ref) => (
		<ContextMenu.SubContent
			className="menu twcss"
			style={{ position: "relative" }}
			ref={ref}
		>
			{children}
		</ContextMenu.SubContent>
	),
);

const ContextMenuRadioGroup = ContextMenu.RadioGroup;

const ContextMenuRadioItem = (props: ContextMenu.ContextMenuRadioItemProps) => (
	<ContextMenu.RadioItem {...props}>{props.children}</ContextMenu.RadioItem>
);

export {
	ContextMenuRoot,
	ContextMenuTrigger,
	ContextMenuPortal,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSub,
	ContextMenuSubTrigger,
	ContextMenuSubContent,
};

const Sample = ({ children }: { children: ReactNode }) => {
	//
	return (
		<ContextMenuRoot>
			<ContextMenuTrigger>{children}</ContextMenuTrigger>
			<ContextMenuPortal>
				<ContextMenuContent>
					<ContextMenuSub>
						<ContextMenuSubTrigger>
							Horizontal
						</ContextMenuSubTrigger>
						<ContextMenuPortal>
							<ContextMenuSubContent>
								<ContextMenuItem
									onSelect={(e) =>
										console.log(
											(e.target as HTMLDivElement)
												.textContent,
										)
									}
								>
									Left
								</ContextMenuItem>
								<ContextMenuItem
									onSelect={(e) =>
										console.log(
											(e.target as HTMLDivElement)
												.textContent,
										)
									}
								>
									Center
								</ContextMenuItem>
								<ContextMenuItem
									onSelect={(e) =>
										console.log(
											(e.target as HTMLDivElement)
												.textContent,
										)
									}
								>
									Right
								</ContextMenuItem>
							</ContextMenuSubContent>
						</ContextMenuPortal>
					</ContextMenuSub>
				</ContextMenuContent>
			</ContextMenuPortal>
		</ContextMenuRoot>
	);
};
