import { BollsResponse } from "./models/bolls-response";
import { Cache } from "./models/cache";
import { Reference } from "./reference";

export class Bolls {
    static readonly endpoint = "https://bolls.life/get-text";
    private static cache: Cache = {};

    static async getVerses(reference: Reference): Promise<BollsResponse> {
        // Load from cache if available
        const chapter = Bolls.cache[reference.key];
        if (chapter) return chapter;

        // Fetch from API
        const response = await fetch(
            `${Bolls.endpoint}/${reference.translation}/${reference.bookId}/${reference.chapter}/`
        );
        const data: BollsResponse = await response.json();

        // Cache the data
        Bolls.cache[reference.key] = data;

        return data;
    }
}
