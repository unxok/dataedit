import React, {
	ReactNode,
	forwardRef,
	useEffect,
	useRef,
	useState,
} from "react";
import { App, Setting } from "obsidian";
import { useSuggest } from "@/hooks/useSuggest";

const SettingRoot = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => <div className={"setting-item " + className ?? ""}>{children}</div>;

const SettingInfo = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => <div className={"setting-item-info " + className ?? ""}>{children}</div>;

const SettingName = ({ children }: { children: ReactNode }) => (
	<div className="setting-item-name">{children}</div>
);

const SettingDescription = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div className={"setting-item-description " + className ?? ""}>
		{children}
	</div>
);

const SettingControl = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div className={"setting-item-control " + className ?? ""}>{children}</div>
);

const SettingToggle = ({
	app,
	checked,
	onCheckedChange = () => {},
}: {
	app: App;
	checked: boolean;
	onCheckedChange: (b: boolean) => void;
}) => {
	const [toggleClass, setToggleClass] = useState("");
	const [value, setValue] = useState(checked);
	// const [suggest, setSuggest] = useState<Suggest>();
	const ref = useRef<HTMLInputElement>(null);

	const setEnabledClass = (newValue?: boolean) => {
		const newClass = newValue ? "is-enabled" : "";
		setToggleClass(newClass);
	};

	useEffect(() => {
		setEnabledClass(value);
		onCheckedChange(value);
		if (!ref?.current) return;
		// setSuggest(new Suggest(app, ref.current));
	}, [value]);

	return (
		<div
			className={"checkbox-container " + toggleClass}
			onClick={() => {
				setValue((b) => {
					return !b;
				});
			}}
		>
			<input
				ref={ref}
				type="checkbox"
				checked={value}
				tabIndex={0}
				readOnly
			/>
		</div>
	);
};

// const SettingInput = forwardRef<HTMLInputElement>(
// 	(
// 		{
// 			value,
// 			placeholder,
// 			onChange,
// 		}: {
// 			value: string;
// 			placeholder?: string;
// 			onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// 		},
// 		ref,
// 	) => {
// 		return (
// 			<input
// 				ref={ref}
// 				type="text"
// 				placeholder={placeholder}
// 				value={value}
// 				onChange={onChange}
// 				tabIndex={0}
// 			/>
// 		);
// 	},
// );

export {
	SettingRoot,
	SettingInfo,
	SettingName,
	SettingDescription,
	SettingControl,
	// SettingInput,
	SettingToggle,
};

export const SampleSetting = ({ app }: { app: App }) => {
	const [inp, setInp] = useState("");

	return (
		<SettingRoot>
			<SettingInfo>
				<SettingName>Test toggle</SettingName>
				<SettingDescription>testing settings</SettingDescription>
			</SettingInfo>
			<SettingControl>
				<SettingToggle
					app={app}
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
