import Axios, {AxiosResponse} from "axios";

/* 注：之前直接把物品名填进去还没事，改完以后就开始抽风，不得不自己写serializer= = */
const axios = Axios.create({
    paramsSerializer: (params: Record<string, any>) => {
        const paramsArray = [];
        for (const i in params) paramsArray.push({key: i, value: params[i]});
        return paramsArray.map(i => `${i.key}=${encodeURI(i.value)}`).join("&");
    }
});

export interface ItemBase {
    ID: number
    Icon: string
    ItemKind: {
        Name: string
    }
    ItemSearchCategory: {
        ID: number
        Name: string
    }
    LevelItem: number
    Name: string
    Rarity: number
}

export interface SearchItemResponse {
    Pagination: {
        Page: number
        PagePrev: number | null
        PageNext: number | null
        PageTotal: number
        Results: number
        ResultsPerPage: number,
        ResultsTotal: number
    }
    Results: ItemBase[]
}

export type XIVAPILocale = "en" | "ja" | "de" | "fr" | "zh"

export async function searchItem(item: string, options: {
    indexes?: string,
    filters?: string,
    columns?: string,
    limit?: number,
    page?: number,
    sort_field?: string,
    sort_order?: string
} = {}, locale: XIVAPILocale = "zh"): Promise<SearchItemResponse> {
    const {indexes, filters, columns, limit, page, sort_field, sort_order} = options;
    const result: AxiosResponse<SearchItemResponse> = await axios.request({
        method: "GET",
        baseURL: (locale === "zh") ? "https://cafemaker.wakingsands.com/" : "https://xivapi.com/",
        url: `/search`,
        params: {
            indexes,
            filters,
            columns,
            string: item,
            limit,
            page,
            sort_field,
            sort_order
        }
    });
    return result.data;
}
