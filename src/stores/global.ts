import { getBlockId } from "@/components/App";
import {
	BlockConfigSchema,
	PluginSettingsSchema,
	defaultDefaultBlockConfig,
} from "@/components/PluginSettings";
import { z } from "zod";
import { create } from "zustand";

type BlockConfigSchemaType = z.infer<typeof BlockConfigSchema>;
type SetterCb = (s: PluginSettingsStore["settings"]) => typeof s;
type PluginSettingsStore = {
	settings: z.infer<typeof PluginSettingsSchema>;
	setSettings: (cb: SetterCb) => void;
	getBlockConfig: (blockId: string) => BlockConfigSchemaType;
	setBlockConfig: (
		id: string,
		cb: ((r: BlockConfigSchemaType) => typeof r) | BlockConfigSchemaType,
	) => void;
};

export const usePluginSettings = create<PluginSettingsStore>()((set, get) => ({
	settings: {},
	setSettings: (cb) => {
		set((prev) => {
			const newSettings = cb(prev.settings);
			return {
				...prev,
				settings: newSettings,
			};
		});
	},
	getBlockConfig: (blockId) => {
		const { settings } = get();
		const { blockConfigs } = settings;
		if (!blockConfigs) {
			// console.error(
			// 	"Tried getting block config when settings is undefined. This should be impossible I think",
			// );
			return defaultDefaultBlockConfig;
		}
		return blockConfigs[blockId] ?? blockConfigs["default"];
	},
	setBlockConfig: (id, cb) => {
		set((prev) => {
			const currentConfig =
				prev?.settings?.blockConfigs[id] ?? defaultDefaultBlockConfig;
			const newConfig = typeof cb === "function" ? cb(currentConfig) : cb;
			return {
				...prev,
				settings: {
					...prev.settings,
					blockConfigs: {
						...prev.settings.blockConfigs,
						[id]: newConfig,
					},
				},
			};
		});
	},
}));
