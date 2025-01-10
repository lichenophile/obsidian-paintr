import type paintr from "./main";
import { Menu } from "obsidian";
import { HighlightrSettings } from "./settings/settings-data";
import highlighterMenu from "./menu";
import type { EnhancedApp, EnhancedEditor } from "./settings/settings-types";
import type { MenuItem } from "obsidian";
import { actionClear, actionPaint } from "./constants";

export default function contextMenu(
	app: EnhancedApp,
	menu: Menu,
	editor: EnhancedEditor,
	plugin: paintr,
	settings: HighlightrSettings
): void {
	const selection = editor.getSelection();

	menu.addSeparator()
	menu.addItem((item: MenuItem & { dom: HTMLElement }) => {
		item.dom.addClass("paintr-plugin-menu-button");
		item
			.setTitle(actionPaint)
			.setIcon("paintr-icon")
			.onClick(async () => highlighterMenu(app, settings, editor, plugin.eraseHighlight.bind(plugin)));
	});

	if (!selection) return;
	menu.addItem((item) => {
		item
			.setTitle(actionClear)
			.setIcon("eraser")
			.onClick(() => {
				if (editor.getSelection()) plugin.eraseHighlight(editor);
			});
	});
}
