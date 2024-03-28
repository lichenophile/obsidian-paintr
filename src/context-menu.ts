import type HighlightrPlugin from "./main";
import { Menu } from "obsidian";
import { HighlightrSettings } from "./settings/settings-data";
import highlighterMenu from "./menu";
import type { EnhancedApp, EnhancedEditor } from "./settings/settings-types";
import type { MenuItem } from "obsidian";

export default function contextMenu(
	app: EnhancedApp,
	menu: Menu,
	editor: EnhancedEditor,
	plugin: HighlightrPlugin,
	settings: HighlightrSettings
): void {
	const selection = editor.getSelection();

	menu.addSeparator()
	menu.addItem((item: MenuItem & { dom: HTMLElement }) => {
		item.dom.addClass("painter-plugin-menu-button");
		item
			.setTitle("Color")
			.setIcon("paintbrush-2")
			.onClick(async () => highlighterMenu(app, settings, editor, plugin.eraseHighlight));
	});

	if (!selection) return;
	menu.addItem((item) => {
		item
			.setTitle("Clear color")
			.setIcon("eraser")
			.onClick(() => {
				if (editor.getSelection()) plugin.eraseHighlight(editor);
			});
	});
}
