import { loadDependencies } from "@/main";
import { CircleAlertIcon, File, Plus, X } from "lucide-react";
import {
	MarkdownPostProcessorContext,
	Notice,
	Plugin,
	setIcon,
} from "obsidian";
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

const App = (props: {
	data: string;
	ctx: MarkdownPostProcessorContext;
	getSectionInfo: () => any;
	settings: any;
	plugin: Plugin;
}) => {
	const { data, getSectionInfo, settings, plugin, ctx } = props;
	// console.log(props);
	const [ErrMsg, setErrMsg] = useState<() => React.JSX.Element>(undefined);

	useEffect(() => {
		new Notice("App rendered");
		(async () => {
			const b = await loadDependencies();
			if (!b) return setErrMsg(() => RequiedDepsError);
		})();

		// plugin.addCommand({
		// 	id: `reload-dataedit`,
		// 	name: `Reload Dataedit`,
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
			<div className="w-full overflow-x-scroll">
				<EditableTable data={data} plugin={plugin} ctx={ctx} />
			</div>
		</div>
	);
};

export default App;
