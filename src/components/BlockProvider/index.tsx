import DataEdit from "@/main";
import { MarkdownPostProcessorContext } from "obsidian";
import React, {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

type BlockProviderProps = {
	children: ReactNode;
	plugin: DataEdit;
	data: string;
	blockId: string;
	ctx: MarkdownPostProcessorContext;
	aliasObj: Record<string, string>;
};

type BlockState = {
	plugin?: DataEdit;
	data?: string;
	blockId?: string;
	ctx?: MarkdownPostProcessorContext;
	aliasObj?: Record<string, string>;
	// setBlockState: (
	// 	state: BlockState | ((state: BlockState) => BlockState),
	// ) => void;
};

const BlockProviderContext = createContext<BlockState>({});

export const BlockProvider = ({ children, ...props }: BlockProviderProps) => (
	<BlockProviderContext.Provider value={{ ...props }}>
		{children}
	</BlockProviderContext.Provider>
);

export const useBlock = () => {
	const context = useContext(BlockProviderContext);

	if (!context) throw new Error("useBlock must be used within BlockProvider");

	return context;
};
