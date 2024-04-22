import React from "react";

const App = (props: any) => {
	const { data, getSectionInfo, settings, app, dependenciesLoaded } = props;
	console.log(props);

	console.log(dependenciesLoaded);

	if (!dependenciesLoaded) {
		return (
			<div id="twcss">
				<div className="rounded-md border-solid border-[var(--text-error)] p-4">
					<h3 className="mt-0">Error</h3>
					<div>Failed to load dependencies!</div>
					<div>
						Plugins required: <a href="/">Dataview</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="" id="my-obsidian-plugin">
			<div className="flex flex-col gap-5">
				<div className="rounded-sm border bg-black p-10">{data}</div>
				<button className="w-fit rounded-md bg-red-500 hover:bg-red-200">
					click meee
				</button>
				<button className="w-fit">default style button</button>
			</div>
		</div>
	);
};

export default App;
