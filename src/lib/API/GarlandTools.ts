import Axios, {AxiosResponse} from "axios";

const axios = Axios.create({
    baseURL: "https://garlandtools.cn/"
});

export interface Data {
    item: {
        categoryIndex: {
            [key: number]: {
                id: number
                name: string
                attr?: string
            }
        }
        ingredients: {
            [key: number]: {
                id: number
                name: string
                icon: number
                category: number
                ilvl: number
                price: number
                drops: number[]
                seeds: number[]
                instances: number[]
                nodes: number[]
                tradeShops: {
                    shop: string
                    npcs: number[]
                    listings: {
                        currency: { id: string, amount: number }[]
                        item: { id: string, amount: number }[]
                    }[]
                }[]
                treasure: number[]
                ventures: number[]
            }
        }
    }
    jobCategories: {
        id: number
        name: string
        jobs: number[]
    }[]
    jobs: {
        id: number
        name: string
        abbreviation: string
        category: string
        startingLevel: number
    }[]
    locationIndex: {
        [key: number]: {
            id: number
            name: string
            parentId: number
            size: number
            chs: { name: string }
            de: { name: string }
            ja: { name: string }
            en: { name: string }
            fr: { name: string }
        }
    }
    patch: {
        categoryIndex: Record<string, string>
        current: string
        partialIndex: {
            [key: string]: {
                id: string
                name: string
                series: string
            }
        }
    }
    questGenreIndex: {
        [key: number]: {
            id: number
            icon?: number
            category: string
            name: string
            section: string
        }
    }
    ventureIndex: {
        [key: number]: {
            id: number
            name?: string
            jobs: number
            lvl: number
            cost: number
            minutes: number
            ilvl?: number[]
            gathering?: number[]
            amounts?: number[]
            random?: number
        }
    }
    xp: number[]
}

const dataCache: {
    time: Date,
    cache: Data
} = {
    time: null,
    cache: null
}

export async function getData(useCache: boolean = true, refreshDuration: number = 2 * 60 * 60 * 1000): Promise<Data> {
    if (!dataCache.time || !dataCache.cache || new Date().getTime() - dataCache.time.getTime() > refreshDuration) {
        const result: AxiosResponse<Data> = await axios.request<Data>({
            method: "GET",
            url: "/db/doc/core/chs/3/data.json"
        });
        dataCache.time = new Date();
        dataCache.cache = result.data;
    }
    return dataCache.cache;
}

export enum GatherNodeType {
    DEPOSIT = 0,   // 矿场
    OUTCROP = 1,   // 石场
    TREE = 2,      // 良材
    VEGETATION = 3 // 草场
}

export type GatherNodeLimitType = "Unspoiled" | "Ephemeral" | "Legendary";

export interface GatherNodeBase {
    n: string // Name 采集点名称
    i: number // ID 采集点ID
    l: number // Level 采集点等级
    t: number // Type 采集点类型
    z: number // Zone 采集点区域ID
    s?: number // Start 采集点星级
    lt?: GatherNodeLimitType // LimitType采集点限制类型
    ti?: [number, number?] // 采集点出现时间（区间）
}

export interface GatherNode {
    id: number     // 采集点ID
    name: string
    lvl: number
    areaid: number // 区域ID
    coords: number[] // 采集点坐标
    items: {
        id: number
        reduceId?: number // 精选产物ID
        slot: string
    }
    limitType: GatherNodeLimitType
    patch: number // 实装版本
    points: {
        id: number      // 点位ID
        count: number   // 采集次数
        times: number[] // 出现时间
        uptime: number  // 持续时间
    }[] // 具体点位类型
    radius: number      // 刷新范围半径？
    stars: number       // 采集点星级
    time: number[]      // 出现时间
    type: GatherNodeType // 采集点类型
    uptime: number      // 持续时间
    zoneid: number
}

export interface Partial {
    id: string
    type: string
    obj: Record<string, string | number | Record<any, any> | Array<any>>
}

export interface PartialItem extends Partial {
    id: string
    obj: {
        i: number // ID
        l: number // 物品品级
        n: string // 物品名
        c: number // Icon 图标ID
        t: number // Category 物品分类
    }
    type: "item"
}

export interface PartialNpc extends Partial {
    id: string
    obj: {
        i: number // ID
        c?: [number, number] // 坐标
        l: number // 所在地图ID
        n: string // NPC名
        q: number
        a: number // 所在区域ID
        r?: number
        s?: number
        t?: string // NPC类型（名字下面的）
    }
    type: "npc"
}

export async function getGatherNodes(): Promise<GatherNodeBase[]> {
    const result: AxiosResponse<{ browse: GatherNodeBase[] }> = await axios.request<{ browse: GatherNodeBase[] }>({
        method: "GET",
        url: "/db/doc/browse/chs/2/node.json"
    });
    return result.data.browse;
}

export async function getGatherNode(id: number): Promise<{ node: GatherNode, partials: Partial[] }> {
    const result: AxiosResponse<{ node: GatherNode, partials: Partial[] }> = await axios.request<{ node: GatherNode, partials: Partial[] }>({
        method: "GET",
        url: `/db/doc/node/chs/2/${id}.json`
    });
    return result.data;
}

export interface QuestBase {
    i: number // 任务ID
    l: string // 任务地点
    n: string // 任务受取人
    f?: number // UnlocksFunction 需要完成前置任务
    g: number // Genre 任务分类
    s?: number // Sort 任务序列
}

export interface Quest {
    id: number
    icon: number
    eventIcon: number
    name: string
    location: string
    sort: number
    issuer: number
    target: number
    patch: number
    genre: number
    reqs: {
        jobs: {
            lvl: number
            id: number
        }[]
        quests: number[]
    }
    reward: {
        aetherCurrent?: number
        items?: {
            id: number
            num: number
            one: number // 可选奖励中任选其一的选项
            hq: number // 是否为HQ
        }[]
        gil?: number
    }
    next?: number[]
    objectives: string[]
}

export async function getQuests(): Promise<QuestBase[]> {
    const result: AxiosResponse<{ browse: QuestBase[] }> = await axios.request<{ browse: QuestBase[] }>({
        method: "GET",
        url: "/db/doc/browse/chs/2/quest.json"
    });
    return result.data.browse;
}

export async function getQuest(id: number): Promise<{ quest: Quest, partials: Partial[] }> {
    const result: AxiosResponse<{ quest: Quest, partials: Partial[] }> = await axios.request<{ quest: Quest, partials: Partial[] }>({
        method: "GET",
        url: `/db/doc/quest/chs/2/${id}.json`
    });
    return result.data;
}

export interface Item {
    id: number
    name: string
    description: string
    icon: number
    ilvl: number
    elvl?: number // 装备等级
    jobCategories?: string // 可装备职业分类
    jobs?: number // 可装备职业
    equip?: number
    glamourous?: number // 是否可幻影化
    convertable?: number // 是否可魔晶石化
    dyeable?: number // 是否可染色
    unlistable?: number // 是否不可出售
    slot?: number
    rarity: number
    price?: number
    sell_price: number
    stackSize: number
    category: number
    patch: number
    patchCategory: number
    tradeable?: number
    nodes?: number[]
    ventures?: number[]
    craft?: {
        id: number
        rlvl: number
        job: number
        lvl: number
        progress: number
        quality: number
        durability: number
        complexity: { nq: number, hq: number }
        materialQualityFactor: number
        quickSynth?: number
        hq?: number
        ingredients: { id: number, amount: number }[]
        suggestedControl: number
        suggestedCraftsmanship: number
    }[]
    ingredient_of?: {
        [key: number]: number
    }
    tradeShops?: {
        shop: string
        npcs: number[]
        listings: {
            item: { id: string, amount: number, hq?: number }[]
            currency: { id: string, amount: number, hq?: number }[]
        }[]
    }[]
    tradeCurrency?: {
        shop: string
        npcs: number[]
        listings: {
            item: { id: string, amount: number, hq?: number }[]
            currency: { id: string, amount: number, hq?: number }[]
        }[]
    }
    vendors?: number[]
    quests: number[]
    repair?: number
    repair_item?: number
    sharedModels?: number[]
    sockets: number
}

export interface ItemInfo {
    item: Item
    partials: Partial[]
    ingredients?: Item[]
}

export async function getItem(id: number): Promise<ItemInfo> {
    const result: AxiosResponse<ItemInfo> = await axios.request<ItemInfo>({
        method: "GET",
        url: `/db/doc/item/chs/3/${id}.json`
    });
    return result.data;
}
