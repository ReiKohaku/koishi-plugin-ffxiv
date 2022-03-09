import Parser from "rss-parser";
import fs from "fs";
import path from "path";

export interface NewsConfig {
    url: string
    duration: number
}

export const newsConfig: NewsConfig = ((): NewsConfig => {
    const defaultConfig: NewsConfig = {
        url: `https://rsshub.app/ff14/zh/all.rss`,
        duration: 15 * 60 * 1000
    }
    try {
        if (!fs.existsSync(path.join(process.cwd(), "/data"))) fs.mkdirSync(path.join(process.cwd(), "/data"));
        return {
            ...defaultConfig,
            ...JSON.parse(fs.readFileSync(path.join(process.cwd(), "/data/news_config.json"), "utf-8")) as NewsConfig
        };
    } catch {
        return defaultConfig;
    }
})()

const rssParser = new Parser({
})

export const rssFF14Sdo = () => rssParser.parseURL(newsConfig.url);
