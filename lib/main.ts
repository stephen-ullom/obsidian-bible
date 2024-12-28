import {
    App,
    Editor,
    MarkdownView,
    Modal,
    Notice,
    Plugin,
    setIcon,
} from "obsidian";

import { Bolls } from "./bolls";
import { Reference } from "./reference";
import { translations } from "./constants/translations";

export default class BiblePlugin extends Plugin {
    async onload() {
        // This creates an icon in the left ribbon.
        this.addRibbonIcon(
            "book-open",
            "Insert Bible reference",
            (evt: MouseEvent) => {
                // TODO: Open verse selection modal.
                new Notice("This is a notice!");
            }
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

        for (const translation of translations) {
            this.registerMarkdownCodeBlockProcessor(
                translation.shortName,
                async (source, element, ctx) => {
                    const callout = element.createDiv({
                        cls: "callout",
                        attr: { "data-callout": "quote" },
                    });

                    // Title
                    const title = callout.createDiv({
                        cls: "callout-title",
                    });

                    const icon = title.createDiv({ cls: "callout-icon" });
                    const titleText = title.createDiv({
                        cls: "callout-title-inner",
                        text: source,
                    });
                    setIcon(icon, "book-open-text");

                    // Content
                    const content = callout.createDiv({
                        cls: "callout-content",
                    });

                    const paragraph = content.createEl("p", {
                        text: "Loading...",
                    });

                    try {
                        const reference = Reference.parse(
                            translation.shortName,
                            source
                        );
                        const verses = await Bolls.getVerses(reference);

                        if (verses.length < 1) {
                            throw new Error("No verses found");
                        }

                        titleText.setText(reference.toString());
                        content.empty();

                        for (let index = 0; index < reference.length; index++) {
                            const verse = verses[reference.verse + index - 1];
                            const verseElement = content.createEl("p");

                            // Add verse number
                            verseElement.createEl("sup", {
                                text: verse.verse.toString(),
                            });

                            // Split the text at '<br/>'
                            const parts = verse.text.split("<br/>");

                            for (const [index, part] of parts.entries()) {
                                const isLastItem = index === parts.length - 1;

                                verseElement.createSpan({ text: part });

                                if (!isLastItem) {
                                    verseElement.createEl("br");
                                }
                            }
                        }
                    } catch (error) {
                        paragraph.setText(error.message);
                    }
                }
            );
        }
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
