import React, { useRef } from "react";

export const BuyMeCoffee = () => {
	const ref = useRef<HTMLAnchorElement>(null);

	return (
		<div aria-label="https://buymeacoffee.com/unxok" className="w-fit">
			<button
				onClick={() => {
					if (!ref?.current) return;
					ref.current.click();
				}}
			>
				Buy me a coffee ☕
			</button>
			<a
				ref={ref}
				className="sr-only"
				href="https://buymeacoffee.com/unxok"
				target="_blank"
			></a>
		</div>
	);
};
