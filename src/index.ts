import {Context} from "koishi-core";

import * as universalis from "./universalis";

export interface Config {};

const defaultConfig: Config = {};

export function apply(ctx: Context, options: Config = {}) {
    options = { ...defaultConfig, ...options };

    ctx.command("ffxiv")
        .alias("ff14");

    ctx.plugin(universalis);
}

export const name = "ffxiv";
