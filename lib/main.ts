import { App, Editor, MarkdownView, Modal, Notice, Plugin } from "obsidian";

import { Bolls } from "./bolls";
import { Reference } from "./reference";

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
        this.addRibbonIcon(
            "book-open",
            "Insert Bible reference",
            (evt: MouseEvent) => {
                // TODO: Open verse selection modal.
                new Notice("This is a notice!");
            },
        );

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
                const blockquote = el.createEl("blockquote");

                blockquote.createEl("h4", { text: source });

                const paragraph = blockquote.createEl("p", {
                    text: "Loading...",
                });

                try {
                    const reference = Reference.parse(source);
                    const verses = await Bolls.getVerses(reference);

                    if (verses.length < 1) {
                        throw new Error("No verses found");
                    }

                    blockquote.removeChild(paragraph);

                    for (let index = 0; index < reference.length; index++) {
                        const verse = verses[reference.verse + index - 1];

                        const verseEl = blockquote.createEl("p");
                        verseEl.createEl("sup", {
                            text: verse.verse.toString(),
                        });
                        verseEl.append(" " + verse.text);
                    }
                } catch (error) {
                    paragraph.empty();
                    paragraph.createSpan({
                        text: error.message,
                        cls: "warning-text",
                    });
                }
            },
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
