import React, { ReactNode, useEffect, useRef, useState } from "react";
import { SampleSetting } from "../Setting";
import { App } from "obsidian";

export const PluginSettings = ({ app }: { app: App }) => {
	//
	return (
		<div>
			<h2>Dataedit Settings</h2>
			<SampleSetting app={app} />
		</div>
	);
};
