import { BollsResponse } from "./models/bolls-response";

const endpoint = "https://bolls.life/get-text/NASB";

export class Bolls {
	constructor() {
		console.log("Bolls constructor");
	}

	static async getVerses(source: string): Promise<BollsResponse> {
		const book = 1;
		const chapter = 1;

		const response = await fetch(`${endpoint}/${book}/${chapter}/`);
		const data: BollsResponse = await response.json();

		return data;
	}
}
