import Axios, {AxiosResponse} from "axios";
const axios = Axios.create({
    baseURL: "https://wanahome.ffxiv.bingyin.org/"
});

/**
 * 吐槽：这个项目的API格式太难顶了……搞了半天没搞懂怎么回事……
 * 而且很多数据都是前端维护，所以如果前端更新不及时就会显示出错，难顶+1
 */

export enum HouseSize {
    SMALL = 1,
    MEDIUM = 2,
    LARGE = 3
}

interface ResponseBase {
    code: number
    msg: string
    [key: string]: unknown
}

interface ServerListDataItem {
    server: number
    last_update: number
}

export interface House {
    server: number
    territory_id: number
    ward_id: number
    house_id: number
}

interface ServerAllHouseInfo {
    last_update: number
    onsale: (House & {
        price: number
        start_sell: number
        size: HouseSize
        owner: string
    })[]
    changes: {
        event_type: "sold" | "start_selling" | "change_owner" | "price_reduce" | "price_refresh"
        house: House
        param1: string
        param2: string
        record_time: number
    }[]
}

interface ServerHouseInfo {
    last_update: number
    state: {
        price: number
        start_sell: number
        size: HouseSize
        owner: string
    }
}

export const territories: { [key: number]: { full: string, short: string } } = {
    339: { full: "海雾村", short: "海" },
    340: { full: "薰衣草苗圃", short: "森" },
    341: { full: "高脚孤丘", short: "沙" },
    641: { full: "白银乡", short: "白" },
    979: { full: "天穹街", short: "伊" }
}

export const dc_server: { dc_name: string, servers: {[key: number]: string} }[] = [
    {
        dc_name: "陆行鸟",
        servers: {
            1042: "拉诺西亚",
            1044: "幻影群岛",
            1060: "萌芽池",
            1081: "神意之地",
            1167: "红玉海",
            1173: "宇宙和音",
            1174: "沃仙曦染",
            1175: "晨曦王座"
        }
    },
    {
        dc_name: "莫古力",
        servers: {
            1076: "白金幻象",
            1113: "旅人栈桥",
            1121: "拂晓之间",
            1166: "龙巢神殿",
            1170: "潮风亭",
            1171: "神拳痕",
            1172: "白银乡",
            1176: "梦羽宝境"
        }
    },
    {
        dc_name: "猫小胖",
        servers: {
            1043: "紫水栈桥",
            1045: "摩杜纳",
            1106: "静语庄园",
            1169: "延夏",
            1177: "海猫茶屋",
            1178: "柔风海湾",
            1179: "琥珀原"
        }
    },
    {
        dc_name: "豆豆柴",
        servers: {
            1183: "银泪湖",
            1192: "水晶塔",
            1180: "太阳海岸",
            1186: "伊修加德"
        }
    }
]

export const servers: Record<number, string> = (() => {
    const servers: Record<number, string> = {};
    dc_server.forEach(d => {
        for (const id in d.servers) servers[id] = d.servers[id];
    });
    return servers;
})();

export const serverList: string[] = (() => {
    const serverList: string[] = [];
    dc_server.forEach(d => {
        for (const server in d.servers) serverList.push(server);
    });
    return serverList;
})()

export async function getServerList(): Promise<ServerListDataItem[]> {
    const result = await axios.get<any, AxiosResponse<ResponseBase & { data: ServerListDataItem[] }>>("/api/list/", {
        headers: {
            Cookie: "api-version=1",
            Host: "whw.wds-dsa.com",
            Referer: "https://whw.wds-dsa.com/"
        }
    });
    return result.data.data;
}

export async function getServerAllHouseInfo(server: number): Promise<ServerAllHouseInfo> {
    const result = await axios.get<any, AxiosResponse<ResponseBase & ServerAllHouseInfo>>("/api/state/", {
        params: {
            server,
            type: 0
        },
        headers: {
            Cookie: "api-version=1",
            Host: "whw.wds-dsa.com",
            Referer: "https://whw.wds-dsa.com/"
        }
    });
    return result.data as ServerAllHouseInfo;
}
