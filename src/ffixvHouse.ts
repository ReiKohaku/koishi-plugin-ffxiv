import {Context} from "koishi";
import {getServerHouseList, servers, areas} from "./lib/API/ffxivHouse";
import {prefixNum, toCurrentTimeDifference, toReadableNum} from "./lib/util/format";

export function apply(ctx: Context) {
    ctx.command("ffxiv.house <server:string> [size:string] [area:string] [slot:number]")
        .alias("空房查询")
        .example('查询潮风亭白银乡14区的L房：空房查询 潮风亭 L 白 14')
        .action(async({ session }, server, size, area, slot) => {
            if (!server || !server.length) return "使用命令时请一并输入您要查询房价的服务器，如想要查询潮风亭的房价：房价查询 潮风亭";
            const sliceNum = 6;
            const sizeType = ['S', 'M', 'L'];
            const sizeNumber = !size ? undefined : !sizeType.includes(size.toUpperCase()) ? undefined : sizeType.indexOf(size.toUpperCase());
            for (const id in servers) {
                if (servers[id] === server) {
                    const serverAllHouseInfo = await getServerHouseList(parseInt(id), Math.floor(new Date().getTime() / 1000));
                    let processedHouseInfo = serverAllHouseInfo
                    const filter = []
                    if (sizeNumber !== undefined) {
                        processedHouseInfo = processedHouseInfo.filter(v => v.Size == sizeNumber)
                        filter.push(`${sizeType[sizeNumber]}房`)
                    }
                    if (area && Object.values(areas).map(v => v.short).includes(area) || Object.values(areas).map(v => v.full).includes(area)) {
                        processedHouseInfo = processedHouseInfo.filter(v => areas[v.Area].short === area || areas[v.Area].full === area)
                        filter.push(area)
                    }
                    if (slot && !Number.isNaN(slot) && Number.isFinite(slot)) {
                        processedHouseInfo = processedHouseInfo.filter(v => v.Slot === slot - 1);
                        filter.push(`${slot}区`)
                    }
                    if (!processedHouseInfo.length) {
                        return `目前${servers[id]}没有在售的房屋。` +
                               (filter.length ? `\r筛选条件：${filter.join(' ')}` : '')
                    }
                    processedHouseInfo.sort((a, b) => a.Participate - b.Participate);
                    const onSale = processedHouseInfo
                    return `※${servers[id]}的房屋信息\r` +
                           (filter.length ? `筛选条件：${filter.join(' ')}\r` : '') +
                           `共查询到${onSale.length}条记录${(onSale.length > sliceNum) ? `，其中抽选人数最少的${Math.min(onSale.length, sliceNum)}条${sizeNumber === undefined ? '' : `${sizeType[sizeNumber]}房`}房屋信息` : ''}：\r` +
                           onSale.slice(0, sliceNum).map(h => {
                               const houseLoc = `${areas[h.Area].short}${prefixNum(h.Slot + 1, 2)}-${prefixNum(h.ID, 2)}`;
                               return `${houseLoc} | ${toReadableNum(h.Price)}Gil\r${h.Participate}人参与 | 更新于${toCurrentTimeDifference(new Date(h.LastSeen * 1000), true)}`;
                           }).join("\r") +
                           `\r更多信息请点击链接查看：https://house.ffxiv.cyou/#/`;
                }
            }
            return `服务器“${server}”不存在，请检查输入是否正确，或向插件仓库提出issue：https://github.com/ReiKohaku/koishi-plugin-ffxiv/issues。`;
        })
}
