import ReactCodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { App, Plugin, TFile } from "obsidian";
import React, { useEffect, useRef, useState } from "react";
import { EmbeddableMarkdownEditor } from "./stolen";
import { Portal } from "@radix-ui/react-portal";

function resolveEditorPrototype(app: App) {
	// Create a temporary editor to resolve the prototype of ScrollableMarkdownEditor
	// @ts-ignore
	const widgetEditorView = app.embedRegistry.embedByExtension.md(
		{ app, containerEl: document.createElement("div") },
		null as unknown as TFile,
		"",
	);

	widgetEditorView.editable = true;
	widgetEditorView.showEditor();

	const MdEditor = Object.getPrototypeOf(
		Object.getPrototypeOf(widgetEditorView.editMode),
	);

	widgetEditorView.unload();

	return MdEditor.constructor;
}

export const MarkdownEditor = ({
	app,
	plainText,
}: {
	app: App;
	plainText: string;
}) => {
	const [value, setValue] = useState(plainText);

	// const mdCon = getEditorExtensions(app);
	// console.log("mdCon: ", mdCon);

	return (
		<ReactCodeMirror
			value={value}
			onChange={(value, viewUpdate) => {
				console.log("viewUpdate: ", viewUpdate);
				setValue(value);
			}}
			extensions={[
				markdown({ base: markdownLanguage, codeLanguages: languages }),
			]}
			theme={"none"}
			basicSetup={false}
		/>
	);
};

const EmbeddableMarkdownEditorComponent = ({
	app,
	cursorLocation,
	value = "# alsdkjfalsdkj",
	cls = "",
	placeholder = "",
	onEnter,
	onEscape,
	onSubmit,
	onBlur,
	onPaste,
	onChange,
}: any) => {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const editorInstance = useRef<any | null>(null);
	const [mirrorValue, setMirrorValue] = useState("");
	const [extensions, setExtensions] = useState([]);

	useEffect(() => {
		if (!editorRef.current) return;

		console.log("rendering...");

		// Assuming resolveEditorPrototype is a function to get the editor constructor
		const MarkdownEditor = resolveEditorPrototype(app); // You will need to implement or import this function

		// Options object combining props and defaults
		const editorOptions = {
			cursorLocation,
			value,
			cls,
			placeholder,
			onEnter,
			onEscape,
			onSubmit,
			onBlur,
			onPaste,
			onChange,
		};

		// Create instance of editor
		editorInstance.current = new MarkdownEditor(
			app,
			editorRef.current,
			editorOptions,
		);
		editorInstance.current.editable = true;
		// editorInstance.current.showEditor();
		// @ts-ignore
		console.log("editorInstance: ", editorInstance.current);
		setExtensions([
			...editorInstance.current.buildLocalExtensions(),
			...editorInstance.current.getDynamicExtensions(),
		]);

		return () => {
			editorInstance.current?.destroy();
		};
	}, []);

	useEffect(() => {
		console.log("exts: ", extensions);
	}, [extensions]);

	return (
		<>
			<div
				ref={editorRef}
				className={`embeddable-markdown-editor ${cls}`}
			/>
			<ReactCodeMirror
				value={mirrorValue}
				onChange={(value, viewUpdate) => {
					console.log("viewUpdate: ", viewUpdate);
					setMirrorValue(value);
				}}
				extensions={[...extensions]}
				theme={"none"}
				basicSetup={false}
			/>
		</>
	);
};

export default EmbeddableMarkdownEditorComponent;

export const TestMdEditor = ({ app }: { app: App }) => {
	const ref = useRef<HTMLDivElement>(null);
	const [editor, setEditor] = useState<any>();
	const [value, setValue] = useState("# test\n*markdown* **text**");

	useEffect(() => console.log("val changed: ", value), [value]);

	useEffect(() => {
		if (!ref.current) return;
		setEditor(
			() =>
				new EmbeddableMarkdownEditor(app, ref.current, {
					value: value,
					onChange: (update) =>
						// @ts-ignore
						setValue(update.state.doc.text.join("\n")),
				}),
		);
	}, []);

	return (
		<Portal
			className="twcss"
			container={app.workspace.containerEl.find(".cm-sizer")}
		>
			<div
				ref={ref}
				className="absolute bottom-0 right-0 h-24 w-full rounded-md border-solid border-primary-alt bg-primary"
			/>
		</Portal>
	);
};
