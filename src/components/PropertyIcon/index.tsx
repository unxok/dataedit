import React, { useRef, useEffect } from "react";
import { getPropertyType } from "../../lib/utils";
import { setIcon } from "obsidian";

export const PropertyIcon = ({ propertyName }: { propertyName: string }) => {
	const ref = useRef<HTMLSpanElement>(null);

	const propertyType = getPropertyType(propertyName);
	const propertyIcon =
		// @ts-ignore
		app.metadataTypeManager.registeredTypeWidgets[propertyType]?.icon;

	useEffect(() => {
		if (!ref.current || !propertyIcon) return;
		// console.log("icon: ", propertyIcon);
		try {
			setIcon(ref.current, propertyIcon);
			// console.log("icon should be set");
		} catch (e) {
			// console.error("Failed to setIcon: ", e);
		}
	}, [propertyIcon]);

	return (
		<span
			ref={ref}
			className="metadata-property-icon"
			aria-label={propertyType}
			data-tooltip-position="right"
		></span>
	);
};
