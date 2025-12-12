import { emojiToCode } from "./emojiToCodeMap";

export function convertSearchInput(visualInput: string): string {
    if (!visualInput) return "";
    let query = visualInput;
    // Iterate over entries to replace emojis with codes. 
    // Note: Order *technically* shouldn't matter as emojis are distinct chars, 
    // but we iterate Object.entries which is usually insertion order.
    for (const [emoji, code] of Object.entries(emojiToCode)) {
        // Use split/join for global replacement of that emoji
        query = query.split(emoji).join(code);
    }
    return query;
}
