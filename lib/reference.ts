import { books } from "./constants/books";

export class Reference {
	constructor(book: string, chapter: number, verse: number) {
		this.bookIndex = books.findIndex((b) => b.name === book);
		this.chapter = chapter;
		this.verse = verse;
	}

	get book() {
		return books[this.bookIndex];
	}
	readonly chapter: number;
	readonly verse: number;

	private readonly bookIndex: number;
}
