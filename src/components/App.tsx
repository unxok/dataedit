import DataEdit, { loadDependencies } from "@/main";
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
import { Settings } from "./PluginSettings";
import { Markdown } from "./Markdown";
import EmbeddableMarkdownEditorComponent, {
	MarkdownEditor,
	TestMdEditor,
} from "./MarkdownEditor";

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
	settings: Settings;
	plugin: DataEdit;
}) => {
	const { data, getSectionInfo, settings, plugin, ctx } = props;
	// console.log(props);
	const [ErrMsg, setErrMsg] = useState<() => React.JSX.Element>(undefined);

	useEffect(() => {
		// new Notice("App rendered");
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

	const reg = new RegExp(/\n^---$\n/gm);
	const [query, config] = data.split(reg);

	const updateConfig = async (newConfig: string) => {
		const f = plugin.app.vault.getFileByPath(ctx.sourcePath);
		const contents = await plugin.app.vault.read(f);
		const contentArr = contents.split("\n");
		// @ts-ignore
		const { lineStart, lineEnd } = ctx.getSectionInfo(ctx.el);
		const preBlockContent = contentArr.slice(0, lineStart);
		const postBlockContent = contentArr.slice(lineEnd + 1);
		// console.log("pre: ", preBlockContent);
		// console.log("post: ", postBlockContent);
		const newContent = `${preBlockContent.join("\n")}\n${query}\n---\n${newConfig}\n${postBlockContent.join("\n")}`;
		console.log("# new content\n", newContent);
	};

	// updateConfig("new: config");

	const [value, setValue] = useState("# testing");

	return (
		<div id="twcss">
			<div className="w-full overflow-x-scroll">
				<EditableTable
					data={data}
					// config={config}
					plugin={plugin}
					ctx={ctx}
				/>
			</div>
			{/* <Markdown
				app={plugin.app}
				filePath={ctx.sourcePath}
				plainText={`# Hello\n- *how*\n- are **you**\n [[Welcomeee]]`}
			/> */}
			{/* <MarkdownEditor
				app={plugin.app}
				plainText={`# Hello\n- *how*\n- are **you**\n [[Welcomeee]]`}
			/> */}
			{/* <EmbeddableMarkdownEditorComponent
				app={plugin.app}
				value={value}
				onChange={(v) => setValue(v)}
			/> */}
			{/* <TestMdEditor app={plugin.app} /> */}
		</div>
	);
};

export default App;
