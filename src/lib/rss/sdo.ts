import Parser from "rss-parser";

const rssParser = new Parser({
})

export const rssFF14Sdo = (type: "all" | "news" | "announce" | "events" | "advertise" = "all") =>
    rssParser.parseURL(`https://rsshub.app/ff14/zh/${type}.rss`);
