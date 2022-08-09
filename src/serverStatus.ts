import {Context, segment} from "koishi";
import {getServers} from "./lib/API/sdoFF14Data";
import {drawServerStatus} from "./lib/canvas/serverStatus";

export function apply(ctx: Context) {
    ctx.command("ffxiv.server")
        .alias("服务器状态")
        .alias("绝育查询")
        .action(async() => {
            const serverStatus = await getServers();
            if (typeof serverStatus !== "string") {
                const image = await drawServerStatus(serverStatus.Data);
                return segment("image", { url: "base64://" + image.toString("base64") });
            }
            return;
        });
}
