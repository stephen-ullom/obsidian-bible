import { Reference } from "./reference";

describe(Reference.name, () => {
    describe("parse", () => {
        it("should parse a valid reference", () => {
            const reference = Reference.parse("KJV", "Genesis 1:1");

            expect(reference.translation).toBe("KJV");
            expect(reference.book.name).toBe("Genesis");
            expect(reference.chapter).toBe(1);
            expect(reference.verse).toBe(1);
        });

        it("should parse a valid reference with a verse range", () => {
            const reference = Reference.parse("KJV", "Genesis 1:1-3");

            expect(reference.translation).toBe("KJV");
            expect(reference.book.name).toBe("Genesis");
            expect(reference.chapter).toBe(1);
            expect(reference.verse).toBe(1);
            expect(reference.length).toBe(3);
        });

        it("should parse a valid reference for a full chapter without a specific verse", () => {
            const reference = Reference.parse("KJV", "Genesis 1");

            expect(reference.translation).toBe("KJV");
            expect(reference.book.name).toBe("Genesis");
            expect(reference.chapter).toBe(1);
            expect(reference.verse).toBeUndefined();
        });

        it("should parse a valid reference using a book alias", () => {
            const reference = Reference.parse("KJV", "Gen 1:1");

            expect(reference.translation).toBe("KJV");
            expect(reference.book.name).toBe("Genesis");
            expect(reference.chapter).toBe(1);
            expect(reference.verse).toBe(1);
        });

        it("should parse a valid reference with a lowercase book name", () => {
            const reference = Reference.parse("KJV", "genesis 1:1");

            expect(reference.translation).toBe("KJV");
            expect(reference.book.name).toBe("Genesis");
            expect(reference.chapter).toBe(1);
            expect(reference.verse).toBe(1);
        });

        it("should parse a valid reference with a lowercase book alias", () => {
            const reference = Reference.parse("KJV", "gen 1:1");

            expect(reference.translation).toBe("KJV");
            expect(reference.book.name).toBe("Genesis");
            expect(reference.chapter).toBe(1);
            expect(reference.verse).toBe(1);
        });

        it("should throw an error for an invalid book name", () => {
            expect(() => Reference.parse("KJV", "InvalidBook 1:1")).toThrow(
                "Invalid book name"
            );
        });

        it("should throw an error for an invalid chapter number", () => {
            expect(() => Reference.parse("KJV", "Genesis 999:1")).toThrow(
                "Invalid chapter number"
            );
        });

        it("should throw an error for an invalid reference format", () => {
            expect(() => Reference.parse("KJV", "Invalid Reference")).toThrow(
                "Invalid reference format"
            );
        });
    });

    describe("toString", () => {
        it("should return the correct string representation", () => {
            const reference = Reference.parse("KJV", "Genesis 1:1");

            expect(reference.toString()).toBe("KJV - Genesis 1");
        });
    });

    describe("constructor", () => {
        it("should return the correct key", () => {
            const reference = Reference.parse("KJV", "Genesis 1:1");

            expect(reference.key).toBe("KJV-Genesis-1");
        });
    });
});
