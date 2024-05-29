import React, { useEffect, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * Use `prompt-instruction` and `prompt-instruction-command`
 */
const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			ref={ref}
			align={align}
			sideOffset={sideOffset}
			className={cn("suggestion-container", className)}
			{...props}
		/>
	</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };

export const Suggester = ({
	children,
	query,
	renderSuggestions,
	open,
	onSelect,
}: {
	children: React.ReactNode;
	query: string;
	renderSuggestions: (query: string) => string[] | undefined;
	open: boolean;
	onSelect: (text: string, index: number) => void;
	// onOpenChange: (b: boolean) => boolean;
}) => {
	const [selected, setSelected] = useState<number>();
	const suggestions = renderSuggestions(query);

	const selectNext = () => {
		setSelected((prev) => {
			if (prev === undefined || prev + 1 >= suggestions.length) {
				return 0;
			}
			return prev + 1;
		});
	};

	const selectPrev = () => {
		setSelected((prev) => {
			if (prev === undefined || prev - 1 < 0) {
				return suggestions.length - 1;
			}
			return prev - 1;
		});
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			return selectNext();
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			return selectPrev();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			return setSelected(undefined);
		}
	};

	useEffect(() => {
		onSelect(suggestions[selected], selected);
	}, [selected]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);

		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, []);

	return (
		<Popover open={open}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				className="twcss"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				{renderSuggestions(query)?.map((v, i) => (
					<div key={i} className="suggestion">
						<div
							className={`suggestion-item ${selected === i ? "is-selected" : ""}`}
						>
							<span
								className="suggestion-highlight"
								onMouseEnter={(e) => {
									setSelected(i);
								}}
								onMouseLeave={(e) => {
									setSelected(undefined);
									// onSelect(e.currentTarget.textContent);
								}}
							>
								{v}
							</span>
						</div>
					</div>
				))}
				<div className="prompt-instructions flex-nowrap text-nowrap">
					<div className="prompt-instruction">
						<span className="prompt-instruction-command">
							Type [[
						</span>
						<span>to link note</span>
					</div>
					<div className="prompt-instruction">
						<span className="prompt-instruction-command">esc</span>
						<span>to dismiss</span>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
