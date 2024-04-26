import react, { useEffect } from "react";

export const useDebounce = (
	callback: () => void,
	state: any,
	delay: number,
) => {
	useEffect(() => {
		const timeout = setTimeout(() => callback(), delay);
		return () => clearTimeout(timeout);
	}, [state, delay]);
};
