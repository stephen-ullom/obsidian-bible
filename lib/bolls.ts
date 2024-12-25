import { BollsResponse } from "./models/bolls-response";
import { Reference } from "./reference";

enum BibleTranslation {
    NASB = "NASB",
    ASV = "ASV",
    ESV = "ESV",
    KJV = "KJV",
}

export class Bolls {
    static readonly endpoint = "https://bolls.life/get-text";

    static translation = BibleTranslation.NASB;

    static async getVerses(reference: Reference): Promise<BollsResponse> {
        // TODO: Cache this response to reduce network requests
        const response = await fetch(
            `${Bolls.endpoint}/${Bolls.translation}/${reference.bookId}/${reference.chapter}/`,
        );
        const data: BollsResponse = await response.json();

        return data;
    }
}
