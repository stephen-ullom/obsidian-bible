import { BollsResponse } from "./models/bolls-response";
import { Reference } from "./reference";

enum BibleTranslation {
    NASB = "NASB",
    ASV = "ASV",
    ESV = "ESV",
    KJV = "KJV",
}

type Cache = { [key: string]: BollsResponse };

export class Bolls {
    static readonly endpoint = "https://bolls.life/get-text";
    static translation = BibleTranslation.NASB;
    private static cache: Cache = {};

    static async getVerses(reference: Reference): Promise<BollsResponse> {
        const cacheKey = `${reference.book.name}-${reference.chapter}`;

        // Load from cache if available
        if (Bolls.cache[cacheKey]) {
            return Bolls.cache[cacheKey];
        }

        // Fetch from API
        const response = await fetch(
            `${Bolls.endpoint}/${Bolls.translation}/${reference.bookId}/${reference.chapter}/`
        );
        const data: BollsResponse = await response.json();

        // Cache the data
        Bolls.cache[cacheKey] = data;

        return data;
    }
}
