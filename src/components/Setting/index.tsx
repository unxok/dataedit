import React, {
	ReactNode,
	forwardRef,
	useEffect,
	useRef,
	useState,
} from "react";
import { App, Setting } from "obsidian";
import { useSuggest } from "@/hooks/useSuggest";
import { cn } from "@/lib/utils";

const SettingRoot = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => <div className={cn("setting-item", className)}>{children}</div>;

const SettingInfo = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => <div className={cn("setting-item-info", className)}>{children}</div>;

const SettingName = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => <div className={cn("setting-item-name", className)}>{children}</div>;

const SettingDescription = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div className={cn("setting-item-description", className)}>{children}</div>
);

const SettingControl = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => <div className={cn("setting-item-control", className)}>{children}</div>;

const SettingToggle = ({
	checked,
	onCheckedChange,
}: {
	checked: boolean;
	onCheckedChange: (b: boolean) => void;
}) => {
	const [toggleClass, setToggleClass] = useState("");
	// const [suggest, setSuggest] = useState<Suggest>();
	// const ref = useRef<HTMLInputElement>(null);

	const setEnabledClass = (newValue?: boolean) => {
		const newClass = newValue ? "is-enabled" : "";
		setToggleClass(newClass);
	};

	useEffect(() => {
		// console.log("value changed: ", checked);
		setEnabledClass(checked);
		onCheckedChange(checked);
		// if (!ref?.current) return;
		// setSuggest(new Suggest(app, ref.current));
	}, [checked]);

	return (
		<div
			className={"checkbox-container " + toggleClass}
			onClick={() => {
				onCheckedChange(!checked);
			}}
		>
			<input
				// ref={ref}
				type="checkbox"
				checked={checked}
				tabIndex={0}
				readOnly
			/>
		</div>
	);
};

export {
	SettingRoot,
	SettingInfo,
	SettingName,
	SettingDescription,
	SettingControl,
	// SettingInput,
	SettingToggle,
};

export const SampleSetting = () => {
	const [inp, setInp] = useState("");

	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>Test toggle</SettingName>
				<SettingDescription>testing settings</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<SettingToggle
					checked={true}
					onCheckedChange={(b) => console.log("toggle: ", b)}
				/>
			</SettingControl>
			<SettingControl>
				<input type="text" placeholder="type here..." tabIndex={0} />
			</SettingControl>
		</SettingRoot>
	);
};
