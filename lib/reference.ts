import { books } from "./constants/books";

export class Reference {
    constructor(book: string, chapter: number, verse: number, length = 1) {
        const bookIndex = books.findIndex((b) => {
            const bookName = book.toLowerCase();
            const isNameMatch = b.name.toLowerCase() === bookName;
            const isAliasMatch = b.aliases?.some(
                (alias) => alias.toLowerCase() === bookName
            );
            return isNameMatch || isAliasMatch;
        });

        if (bookIndex === -1) {
            throw new Error("Invalid book name");
        }

        this.bookId = bookIndex + 1;

        if (chapter < 1 || chapter > books[bookIndex].chapters) {
            throw new Error("Invalid chapter number");
        }

        this.chapter = chapter;
        this.verse = verse;
        this.length = length;
    }

    get book() {
        return books[this.bookId - 1];
    }

    readonly bookId: number;
    readonly chapter: number;
    readonly verse: number;
    readonly length: number;

    toString() {
        if (this.length > 1) {
            return `${this.book.name} ${this.chapter}:${this.verse}-${
                this.verse + this.length - 1
            }`;
        }

        return `${this.book.name} ${this.chapter}:${this.verse}`;
    }

    static parse(text: string): Reference {
        const match = text.match(/^(\d?\s*\w+)\s+(\d+):(\d+(?:-\d+)?)$/);
        if (!match) {
            throw new Error("Invalid source format");
        }

        const [, bookName, chapter, verseRange] = match;

        if (verseRange.includes("-")) {
            const [start, end] = verseRange.split("-").map(Number);
            return new Reference(
                bookName,
                Number(chapter),
                start,
                end - start + 1
            );
        }

        return new Reference(bookName, Number(chapter), +verseRange);
    }
}
