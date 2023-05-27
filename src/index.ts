import * as path from "path";
export const __root_dir = path.join(__dirname, "../");

import {Context, Schema} from "koishi";

import * as universalis from "./universalis";
import * as scheduler from "./scheduler";
import * as ffixvHouse from "./ffixvHouse";
import * as random from "./random";
import * as divination from "./divination";
import * as serverStatus from "./serverStatus";
import * as news from "./news";
import * as reminder from "./reminder";
import * as quest from "./quest"
import * as item from "./item"

export interface Config {
    admin?: string[],
    market?: {
        type: 'text' | 'image'
    }
}

const defaultConfig: Config = {
    market: {
        type: 'image'
    }
}

export const schema = Schema.object({
    admin: Schema.array(Schema.string()).default([]),
    market: Schema.object({ type: Schema.union(['text', 'image']) }).default({ type: 'image' })
})

export function apply(ctx: Context, options: Config = {}) {
    options = { ...defaultConfig, ...options };

    ctx.command("ffxiv")
        .alias("ff14");

    ctx.plugin(universalis, options.market);
    ctx.plugin(scheduler);
    ctx.plugin(ffixvHouse);
    ctx.plugin(random);
    ctx.plugin(divination);
    ctx.plugin(serverStatus);
    ctx.plugin(news);
    ctx.plugin(reminder, options);
    ctx.plugin(quest);
    ctx.plugin(item);
}

export const name = "ffxiv";
