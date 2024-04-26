import { loadDependencies } from "@/main";
import { CircleAlertIcon, File, Plus, X } from "lucide-react";
import { Notice, Plugin, setIcon } from "obsidian";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { Error } from "./Error";
import { EditableTable } from "./EditableTable";

const RequiedDepsError = () => (
	<>
		<h3>Failed to load dependencies!</h3>
		<div>
			Plugins required:
			<ul>
				<li>
					<a href="https://github.com/blacksmithgu/obsidian-dataview">
						Dataview
					</a>
				</li>
			</ul>
		</div>
	</>
);

const App = (props: any) => {
	const { data, getSectionInfo, settings, plugin } = props;
	// console.log(props);
	const [ErrMsg, setErrMsg] = useState<() => React.JSX.Element>(undefined);

	useEffect(() => {
		new Notice("App rendered");
		(async () => {
			const b = await loadDependencies();
			if (!b) return setErrMsg(() => RequiedDepsError);
		})();

		// plugin.addCommand({
		// 	id: `reload-data-edit`,
		// 	name: `Reload Data Edit`,
		// 	callback: () => forceUpdate(),
		// });
	}, []);

	if (ErrMsg) {
		return (
			<Error>
				<ErrMsg />
			</Error>
		);
	}

	return (
		<div id="twcss">
			<input
				className="metadata-input metadata-input-text mod-datetime"
				max="9999-12-31T23:59"
				type="datetime-local"
				placeholder="Empty"
			></input>
			<div className="w-full overflow-x-scroll">
				<EditableTable data={data} plugin={plugin} />
			</div>
		</div>
	);
};

export default App;
