import { App, Editor, Modal } from "obsidian";
import { translations } from "./constants/translations";
import { books } from "./constants/books";
import { Reference } from "./reference";

export class BibleModal extends Modal {
    constructor(app: App, private editor: Editor) {
        super(app);

        this.editor = editor;
    }

    onOpen() {
        const { contentEl, titleEl } = this;

        // Set the modal title
        titleEl.setText("Insert Bible Callout");

        // Infer reference from selection
        let reference = new Reference("NIV", "Genesis", 1, 1, 1);
        try {
            const selection = this.editor.getSelection();

            reference = Reference.parse("NIV", selection);
        } catch (error) {
            /* empty */
        }

        const formEl = contentEl.createEl("form");

        // Translation
        formEl.createEl("label", { text: "Translation" });
        const selectEl = formEl.createEl("select");
        translations.forEach((translation) => {
            const optionEl = selectEl.createEl("option", {
                text: translation.shortName,
            });
            optionEl.value = translation.shortName;
        });
        selectEl.value = reference.translation;

        // Book
        formEl.createEl("label", { text: "Book" });
        const bookSelectEl = formEl.createEl("select");
        books.forEach((book) => {
            const optionEl = bookSelectEl.createEl("option", {
                text: book.name,
            });
            optionEl.value = book.name;
        });
        bookSelectEl.value = reference.book.name;

        // Chapter
        formEl.createEl("label", { text: "Chapter" });
        const chapterEl = formEl.createEl("input", {
            attr: {
                type: "text",
                placeholder: "Chapter",
            },
        });
        chapterEl.value = reference.chapter.toString();

        // Verse
        formEl.createEl("label", { text: "Verse" });
        const verseEl = formEl.createEl("input", {
            attr: {
                type: "text",
                placeholder: "Verse",
            },
        });

        if (reference.length > 1) {
            verseEl.value = `${reference.verse}-${
                reference.verse + reference.length - 1
            }`;
        } else {
            verseEl.value = reference.verse.toString();
        }

        formEl.createEl("input", {
            attr: {
                type: "submit",
                value: "Create",
            },
        });

        formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            this.onSubmit();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    onSubmit() {
        const formEl = this.contentEl.querySelector("form");

        if (!formEl) {
            return;
        }

        const translationSelect = formEl.querySelector("select");
        const bookSelect = formEl.querySelectorAll("select")[1];
        const chapterInput = formEl.querySelector(
            "input[placeholder='Chapter']"
        );
        const verseInput = formEl.querySelector("input[placeholder='Verse']");

        if (translationSelect && bookSelect && chapterInput && verseInput) {
            const translation = translationSelect.value;
            const book = bookSelect.value;
            const chapter = (chapterInput as HTMLInputElement).value;
            const verse = (verseInput as HTMLInputElement).value;

            this.editor.replaceSelection(
                `\`\`\`${translation}\n${book} ${chapter}:${verse}\n\`\`\``
            );
        }

        this.close();
    }
}
