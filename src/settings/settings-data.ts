export const HIGHLIGHTER_STYLES = [
	"none",
	'text-color',
	"lowlight",
	"floating",
	"rounded",
	"realistic",
] as const;

export const HIGHLIGHTER_METHODS = [
	"css-classes", 
	"inline-styles"
] as const;

export interface Highlighters {
	[color: string]: string;
}

export interface HighlightrSettings {
	highlighterStyle: string
	highlighterMethods: string
	highlighters: Highlighters
	highlighterOrder: string[]
	menuMode: 'normal' | 'minimal'
	cleanSelectors: string[]
	overwriteMarks: boolean
}

// i'm keeping higlightr's keys so settings can be easily migrated
const DEFAULT_SETTINGS: HighlightrSettings = {
	highlighterStyle: "realistic",
	highlighterMethods: "css-classes",
	highlighters: {
		"Pink": "#FFB8EBA6",
		"Red": "#FF5582A6",
		"Orange": "#FFB86CA6",
		"Yellow": "#FFF3A3A6",
		"Green": "#BBFABBA6",
		"Cyan": "#ABF7F7A6",
		"Blue": "#ADCCFFA6",
		"Purple": "#D2B3FFA6",
		"Grey": "#CACFD9A6"
	},
	highlighterOrder: [],
	menuMode: 'minimal',
	cleanSelectors: [],
	overwriteMarks: true
};

DEFAULT_SETTINGS.highlighterOrder = Object.keys(DEFAULT_SETTINGS.highlighters);

export default DEFAULT_SETTINGS;
