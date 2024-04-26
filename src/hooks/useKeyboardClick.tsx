import React, { useEffect } from "react";

export const useKeyboardClick = (
	ref: React.MutableRefObject<HTMLDivElement | HTMLSpanElement | null>,
) => {
	const keyboardFocusClick = (e: KeyboardEvent) => {
		if (!(e.key === "Enter" || e.key === " ")) return;
		e.preventDefault();
		ref?.current?.click();
	};

	useEffect(() => {
		if (!ref?.current) return;
		// @ts-ignore TODO ???
		ref.current.addEventListener("keydown", keyboardFocusClick);

		return () =>
			ref?.current &&
			// @ts-ignore TODO ???
			ref.current.removeEventListener("keydown", keyboardFocusClick);
	}, [ref]);
};
