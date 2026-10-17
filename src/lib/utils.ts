import { createCn } from "cn/config";

// Class merging must know the custom tokens from src/app/tokens.css:
// otherwise it takes "text-15" (a size) for a color and drops "text-ink".
export const cn = createCn({
  extend: {
    theme: {
      text: [
        "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "22",
        "27", "28", "30", "32", "36", "38", "41", "44", "52", "68", "76",
      ],
      leading: [
        "display", "heading", "card-name", "closing", "title", "note", "body", "auto",
      ],
      tracking: [
        "display", "heading", "closing", "name", "meta", "button", "micro", "label", "date",
      ],
    },
  },
});
