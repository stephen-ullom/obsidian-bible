import { Editor, MarkdownView, Plugin, setIcon } from "obsidian";

import { Bolls } from "./bolls";
import { translations } from "./constants/translations";
import { Translation } from "./models/translation";
import { Reference } from "./reference";
import { Callout } from "./models/callout";
import { BollsResponse } from "./models/bolls-response";

export default class BibleCalloutPlugin extends Plugin {
    private iconName = "book-open-text";

    async onload() {
        for (const translation of translations) {
            this.addCommand({
                id: `insert-${translation.shortName.toLowerCase()}-bible-callout-command`,
                name: `Insert ${translation.shortName} callout`,
                icon: this.iconName,
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
        const callout = this.createCallout(element);

        const paragraph = callout.content.createEl("p", {
            text: "Loading...",
        });

        try {
            const reference = Reference.parse(translation.shortName, source);

            callout.title.setText(reference.toString());

            await this.loadVerses(reference, callout);
        } catch (error) {
            callout.title.setText(`${translation.shortName} - Error`);
            paragraph.setText(error.message);
        }
    }

    private createCallout(element: HTMLElement): Callout {
        const callout = element.createDiv({
            cls: "callout",
            attr: { "data-callout": "quote" },
        });

        // Title
        const titleContainer = callout.createDiv({
            cls: "callout-title",
        });

        const icon = titleContainer.createDiv({ cls: "callout-icon" });
        const title = titleContainer.createDiv({ cls: "callout-title-inner" });

        setIcon(icon, this.iconName);

        // Content
        const content = callout.createDiv({
            cls: "callout-content",
        });

        return { title, content };
    }

    private async loadVerses(reference: Reference, callout: Callout) {
        const verses = await Bolls.getVerses(reference);

        if (verses.length < 1) {
            throw new Error(`No verses found`);
        }

        // Remove loading text
        callout.content.empty();

        if (reference.verse) {
            this.displaySpecifiedVerses(
                reference.verse,
                reference.length,
                verses,
                callout.content
            );
        } else {
            this.displayAllVerses(verses, callout.content);
        }
    }

    private displaySpecifiedVerses(
        verse: number,
        length: number,
        verses: BollsResponse,
        content: Callout["content"]
    ) {
        try {
            for (let index = 0; index < length; index++) {
                const verseData = verses[verse + index - 1];

                if (!verseData) {
                    throw new Error(`Could not find verse ${verse + index}`);
                }

                this.createVerseElement(
                    content,
                    verseData.verse,
                    verseData.text
                );
            }
        } catch (error) {
            content.createEl("p", { text: error.message });
        }
    }

    private displayAllVerses(
        verses: BollsResponse,
        content: Callout["content"]
    ) {
        for (const verse of verses) {
            this.createVerseElement(content, verse.verse, verse.text);
        }
    }

    private createVerseElement(
        parent: HTMLElement,
        verse: number,
        text: string
    ) {
        const verseElement = parent.createEl("p");

        // Add verse number
        verseElement.createEl("sup", {
            text: `${verse} `,
        });

        // Split the text at '<br/>'
        const parts = text.split("<br/>");

        for (const [index, part] of parts.entries()) {
            const isLastItem = index === parts.length - 1;

            verseElement.createSpan({ text: part });

            if (!isLastItem) {
                verseElement.createEl("br");
            }
        }
    }
}
