import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import { Bolls } from "./bolls";

// https://bible-api.com/John+3:16?translation=asv

// const verseReference = source.trim();
// fetch(
// 	`https://bible-api.com/${encodeURIComponent(
// 		verseReference
// 	)}?translation=asv`
// )

// type BibleApiResponse = {
// 	reference: string;
// 	verses: {
// 		book_id: string;
// 		book_name: string;
// 		chapter: number;
// 		verse: number;
// 		text: string;
// 	}[];
// 	text: string;
// 	translation_id: string;
// 	translation_name: string;
// 	translation_note: string;
// };

export default class MyPlugin extends Plugin {
	async onload() {
		// This creates an icon in the left ribbon.
		this.addRibbonIcon("book-open", "Bible", (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice("This is a notice!");
		});

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Bible");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		this.registerMarkdownCodeBlockProcessor(
			"nasb",
			async (source, el, ctx) => {
				const data = await Bolls.getVerses(source);

				const blockquote = el.createEl("blockquote");

				blockquote.createEl("h3", { text: source });
				const paragraph = blockquote.createEl("p");

				paragraph.createEl("sup", { text: "1" });
				paragraph.appendText(" " + data[0].text);
			}
		);
	}

	onunload() {}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
