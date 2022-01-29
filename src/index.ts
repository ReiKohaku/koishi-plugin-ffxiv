import * as path from "path";
export const __root_dir = path.join(__dirname, "../");

import {Context} from "koishi-core";

import * as universalis from "./universalis";
import * as scheduler from "./scheduler";
import * as iWanaHome from "./iWanaHome";

export interface Config {}

const defaultConfig: Config = {}

export function apply(ctx: Context, options: Config = {}) {
    options = { ...defaultConfig, ...options };

    ctx.command("ffxiv")
        .alias("ff14");

    ctx.plugin(universalis);
    ctx.plugin(scheduler);
    ctx.plugin(iWanaHome);
}

export const name = "ffxiv";
