import React, { useEffect } from "react";

export const useEnter = (
	ref: React.MutableRefObject<HTMLInputElement | null>,
	callback: () => void,
) => {
	const eventCallback = (e: KeyboardEvent) => {
		if (e.key !== "Enter") return;
		callback();
	};

	useEffect(() => {
		if (!ref?.current) return;
		ref.current.addEventListener("keydown", eventCallback);
		return () => {
			ref?.current &&
				ref.current.removeEventListener("keydown", eventCallback);
		};
	}, [ref, callback]);
};

export const useEnterEl = (el: HTMLInputElement, callback: () => void) => {
	const eventCallback = (e: KeyboardEvent) => {
		if (e.key !== "Enter") return;
		callback();
	};

	useEffect(() => {
		el.addEventListener("keydown", eventCallback);
		return () => {
			el.removeEventListener("keydown", eventCallback);
		};
	}, [el, callback]);
};
