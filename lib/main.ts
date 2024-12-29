import { Editor, MarkdownView, Plugin, setIcon } from "obsidian";

import { Bolls } from "./bolls";
import { translations } from "./constants/translations";
import { Translation } from "./models/translation";
import { Reference } from "./reference";

const bibleIcon = "book-open-text";

export default class BibleCalloutPlugin extends Plugin {
    async onload() {
        for (const translation of translations) {
            this.addCommand({
                id: `insert-${translation.shortName.toLowerCase()}-bible-callout-command`,
                name: `Insert ${translation.shortName} callout`,
                icon: bibleIcon,
                editorCallback: (editor: Editor, view: MarkdownView) =>
                    this.insertCalloutCallback(translation, editor),
            });

            this.registerMarkdownCodeBlockProcessor(
                translation.shortName,
                (source, element) =>
                    this.codeBlockHandler(translation, source, element)
            );
        }
    }

    private insertCalloutCallback(translation: Translation, editor: Editor) {
        let selection = editor.getSelection();

        if (selection.trim().length === 0) {
            selection = "Genesis 1:1";
        }

        const start = editor.posToOffset(editor.getCursor("from"));
        const end = start + selection.length;

        const codeBlockWrapper = `\`\`\`${translation.shortName}\n`;
        editor.replaceSelection(`${codeBlockWrapper}${selection}\n\`\`\``);

        // Move cursor to select inside the inserted code block
        const wrapperLength = codeBlockWrapper.length;
        const newStart = editor.offsetToPos(start + wrapperLength);
        const newEnd = editor.offsetToPos(end + wrapperLength);
        editor.setSelection(newStart, newEnd);
    }

    private async codeBlockHandler(
        translation: Translation,
        source: string,
        element: HTMLElement
    ) {
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
            const reference = Reference.parse(translation.shortName, source);
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
}
