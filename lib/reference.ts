import { books } from "./constants/books";

export class Reference {
    constructor(book: string, chapter: number, verse: number, length = 1) {
        this.bookId = books.findIndex((b) => b.name === book) + 1;
        this.chapter = chapter;
        this.verse = verse;
        this.length = length;
    }

    get book() {
        return books[this.bookId];
    }
    readonly bookId: number;
    readonly chapter: number;
    readonly verse: number;
    readonly length: number;

    static parse(text: string): Reference {
        const match = text.match(/^(\w+)\s+(\d+):(\d+(?:-\d+)?)$/);
        if (!match) {
            throw new Error("Invalid source format");
        }

        const [, bookName, chapterText, verseRange] = match;
        const book = books.find((b) => b.name === bookName);

        if (book === undefined) {
            throw new Error("Invalid book name");
        }

        const chapter = Number(chapterText);

        if (chapter > book.chapters) {
            throw new Error("Invalid chapter number");
        }

        if (verseRange.includes("-")) {
            const [start, end] = verseRange.split("-").map(Number);
            return new Reference(bookName, chapter, start, end - start + 1);
        }

        return new Reference(bookName, chapter, +verseRange);
    }
}
