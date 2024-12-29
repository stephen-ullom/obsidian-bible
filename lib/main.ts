import { Editor, MarkdownView, Plugin, setIcon } from "obsidian";

import { Bolls } from "./bolls";
import { Reference } from "./reference";
import { translations } from "./constants/translations";
import { BibleModal } from "./bible-modal";

const bibleIcon = "book-open-text";

export default class BibleCalloutPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: "insert-bible-callout-command",
            name: "Insert callout",
            icon: bibleIcon,
            editorCallback: (editor: Editor, view: MarkdownView) =>
                new BibleModal(this.app, editor).open(),
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
                    setIcon(icon, bibleIcon);

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
                                text: `${verse.verse} `,
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
