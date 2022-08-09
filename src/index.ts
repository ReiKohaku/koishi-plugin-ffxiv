import * as path from "path";
export const __root_dir = path.join(__dirname, "../");

import {Context} from "koishi";

import * as universalis from "./universalis";
import * as scheduler from "./scheduler";
import * as iWanaHome from "./iWanaHome";
import * as random from "./random";
import * as divination from "./divination";
import * as serverStatus from "./serverStatus";
import * as news from "./news";
import * as reminder from "./reminder";
import * as quest from "./quest"
import * as item from "./item"

export interface Config {
    admin?: string[]
}

const defaultConfig: Config = {}

export function apply(ctx: Context, options: Config = {}) {
    options = { ...defaultConfig, ...options };

    ctx.command("ffxiv")
        .alias("ff14");

    ctx.plugin(universalis);
    ctx.plugin(scheduler);
    ctx.plugin(iWanaHome);
    ctx.plugin(random);
    ctx.plugin(divination);
    ctx.plugin(serverStatus);
    ctx.plugin(news);
    ctx.plugin(reminder, options);
    ctx.plugin(quest);
    ctx.plugin(item);
}

export const name = "ffxiv";
