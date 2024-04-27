import React, { ReactNode, useEffect, useRef, useState } from "react";
import { App, Setting } from "obsidian";
import { useSuggest } from "@/hooks/useSuggest";

const SettingRoot = ({ children }: { children: ReactNode }) => (
	<div className="setting-item">{children}</div>
);

const SettingInfo = ({ children }: { children: ReactNode }) => (
	<div className="setting-item-info">{children}</div>
);

const SettingName = ({ children }: { children: ReactNode }) => (
	<div className="setting-item-name">{children}</div>
);

const SettingDescription = ({ children }: { children: ReactNode }) => (
	<div className="setting-item-description">{children}</div>
);

const SettingControl = ({ children }: { children: ReactNode }) => (
	<div className="setting-item-control">{children}</div>
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
		if (!ref?.current) return;
		// setSuggest(new Suggest(app, ref.current));
	}, [value]);

	return (
		<div
			className={"checkbox-container " + toggleClass}
			onClick={() => {
				setValue((b) => {
					onCheckedChange(!b);
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

const SettingInput = ({
	app,
	value,
	onChange,
	onSelect,
}: {
	app: App;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSelect: (value: string, evt: MouseEvent | KeyboardEvent) => void;
}) => {
	const ref = useSuggest({
		app: app,
		getSuggestions: (q) => ["hello", "how", "are", "you"],
		onSelect: onSelect,
	});

	return (
		<input
			ref={ref}
			type="text"
			value={value}
			onChange={onChange}
			tabIndex={0}
		/>
	);
};

export {
	SettingRoot,
	SettingInfo,
	SettingName,
	SettingDescription,
	SettingControl,
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
				<SettingInput
					app={app}
					value={inp}
					onChange={(e) => {
						setInp(e.target.value);
					}}
					onSelect={(v) => {
						setInp(v);
					}}
				/>
			</SettingControl>
		</SettingRoot>
	);
};
