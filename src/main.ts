import { Plugin } from "obsidian";
import type { PluginManifest, Menu, Editor } from "obsidian";
import type { EnhancedApp, EnhancedEditor } from "./settings/settings-types";

import { paintrSettingTab } from "./settings/settings-tabs";
import DEFAULT_SETTINGS, { HIGHLIGHTER_STYLES, HighlightrSettings } from "./settings/settings-data";
import highlighterMenu from "./menu";
import contextMenu from "./context-menu";
import { createHighlighterIcons } from "./custom-icons";
import { createStyles, removeStyles } from "./utils/create-style";
import TextTransformer, { clearSelectionOfSelectors } from "./transform-text";
import { actionClear, actionMenu } from "./constants";

type CommandPlot = {
	char: number;
	line: number;
	prefix: string;
	suffix: string;
};

export default class paintr extends Plugin {
	app: EnhancedApp;
	editor: EnhancedEditor;
	manifest: PluginManifest;
	settings: HighlightrSettings;

	async onload() {
		console.log(`Paintr v${this.manifest.version} loaded`);

		await this.loadSettings();

		this.app.workspace.onLayoutReady(() => {
			this.reloadStyles(this.settings);
			createHighlighterIcons(this.settings, this);
		});

		this.registerEvent(
			this.app.workspace.on("editor-menu", this.handleHighlighterInContextMenu.bind(this))
		);
		
		this.addSettingTab(new paintrSettingTab(this.app, this));

		this.addCommand({
			id: "open-menu",
			name: actionMenu,
			icon: "paintr-icon",
			editorCallback: (editor: EnhancedEditor) => {
				if (document.querySelector(".menu.paintr-plugin-menu-container")) return;
				highlighterMenu(this.app, this.settings, editor, this.eraseHighlight.bind(this))
			},
		});

		addEventListener("paintr:refreshstyles", () => {
			this.reloadStyles(this.settings);
			this.generateCommands(this.editor);
			createHighlighterIcons(this.settings, this);
		});
		this.generateCommands(this.editor);
		this.refresh();
	}

	reloadStyles(settings: HighlightrSettings) {
		let currentSheet = document.querySelector("style#highlightr-styles");
		if (currentSheet) {
			currentSheet.remove();
			createStyles(settings);
		} else {
			createStyles(settings);
		}
	}
	
	eraseHighlight(editor: Editor) {
		clearSelectionOfSelectors(editor, [...this.settings.cleanSelectors, 'mark'])
	};

	createPrefix(elem: string, key: string, mode: string, style: string) {
		const styleKey = style === 'text-color' ? 'color' : 'background-color';
		const attr = mode === "css-classes" 
			? `class="hltr-${key.toLowerCase()}"` 
			: `style="paintr:;${styleKey}:${this.settings.highlighters[key]}"`;
		return `<${elem} ${attr}>`
	}

	applyCommand(command: CommandPlot, editor: EnhancedEditor) {
		const prefix = command.prefix;
		const suffix = command.suffix || prefix;
		if (this.settings.overwriteMarks) clearSelectionOfSelectors(editor, ['mark'], true);

		const transformer = new TextTransformer(editor)
		transformer.trimSelection(prefix, suffix)
		transformer.wrapSelection(prefix, suffix, { 
			expand: editor.getSelection().length === 0,
			moveCursorToEnd: true 
		})
	};

	generateCommands(passedEditor: EnhancedEditor) {
		for (const highlighterKey of this.settings.highlighterOrder) {
			const lowerCaseColor = highlighterKey.toLowerCase()
			const command = {
				char: 0,
				line: 0,
				prefix: this.createPrefix('mark', highlighterKey, this.settings.highlighterMethods, this.settings.highlighterStyle),
				suffix: "</mark>",
			}

			this.addCommand({
				id: `paint-${lowerCaseColor}`,
				name: highlighterKey,
				icon: `paintr-icon-${lowerCaseColor}`,
				editorCallback: async (editor: EnhancedEditor) => {
					this.applyCommand(command, editor);
				},
			});

			this.addCommand({
				id: "remove-highlight",
				name: actionClear,
				icon: "eraser",
				editorCallback: async (editor: Editor) => {
					this.eraseHighlight(editor);
					editor.focus();
				},
			});
		};
	}

	refresh() {
		this.updateStyle();
	};

	updateStyle() {
		for (const style of HIGHLIGHTER_STYLES) {
			document.body.classList.toggle(
				`highlightr-${style}`,
				this.settings.highlighterStyle === style
			);
		}
	};

	onunload() {
		removeStyles()
		console.log("Paintr unloaded");
	}

	handleHighlighterInContextMenu(
		menu: Menu,
		editor: EnhancedEditor
	) {
		contextMenu(this.app, menu, editor, this, this.settings);
	};

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
