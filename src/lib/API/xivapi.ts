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

    const result: AxiosResponse<SearchItemResponse> = await axios.request({
        method: "GET",
        baseURL: (locale === "zh") ? "https://cafemaker.wakingsands.com/" : "https://xivapi.com/",
        url: `/search`,
        params: {
            ...options,
            string: item
        }
    });
    return result.data;
}

export interface CompanyCraftSupplyItem {
    item: number[];
}

export interface CraftLeve {
    item0: number[];
}

export interface Recipe {
    itemIngredient0: number[];
    itemIngredient1: number[];
    itemIngredient2: number[];
    itemIngredient3: number[];
    itemResult: number[];
}

export interface GameContentLink {
    companyCraftSupplyItem: CompanyCraftSupplyItem;
    craftLeve: CraftLeve;
    recipe: Recipe;
}

export interface GamePatch {
    banner: string;
    exName: string;
    exversion: number;
    iD: number;
    name_cn: string;
    name_de: string;
    name_en: string;
    name_fr: string;
    name_ja: string;
    name_kr: string;
    releaseDate: number;
    version: string;
}

export interface ItemKind {
    ID: number;
    Name: string;
    Name_chs: string;
    Name_de: string;
    Name_en: string;
    Name_fr: string;
    Name_ja: string;
    Name_kr: string;
}

export interface ItemSearchCategory {
    Category: number;
    ClassJob?: any;
    ClassJobTarget: string;
    ClassJobTargetiD: number;
    ID: number;
    Icon: string;
    IconHD: string;
    IconID: number;
    Name: string;
    Name_chs: string;
    Name_de: string;
    Name_en: string;
    Name_fr: string;
    Name_ja: string;
    Order: number;
}

export interface ItemSortCategory {
    iD: number;
    param: number;
}

export interface ItemUICategory {
    iD: number;
    icon: string;
    iconHD: string;
    IconiD: number;
    name: string;
    name_chs: string;
    name_de: string;
    name_en: string;
    name_fr: string;
    name_ja: string;
    orderMajor: number;
    orderMinor: number;
}

export interface Recipe {
    classJobiD: number;
    iD: number;
    level: number;
}

export interface Item {
    AdditionalData: number;
    Adjective: number;
    AetherialReduce: number;
    AlwaysCollectable: number;
    Article: number;
    BaseParam0?: any;
    BaseParam0Target: string;
    BaseParam0TargetiD: number;
    BaseParam1?: any;
    BaseParam1Target: string;
    BaseParam1TargetiD: number;
    BaseParam2?: any;
    BaseParam2Target: string;
    BaseParam2TargetiD: number;
    BaseParam3?: any;
    BaseParam3Target: string;
    BaseParam3TargetiD: number;
    BaseParam4?: any;
    BaseParam4Target: string;
    BaseParam4TargetiD: number;
    BaseParam5?: any;
    BaseParam5Target: string;
    BaseParam5TargetiD: number;
    BaseParamModifier: number;
    BaseParamSpecial0?: any;
    BaseParamSpecial0Target: string;
    BaseParamSpecial0TargetiD: number;
    BaseParamSpecial1?: any;
    BaseParamSpecial1Target: string;
    BaseParamSpecial1TargetiD: number;
    BaseParamSpecial2?: any;
    BaseParamSpecial2Target: string;
    BaseParamSpecial2TargetiD: number;
    BaseParamSpecial3?: any;
    BaseParamSpecial3Target: string;
    BaseParamSpecial3TargetiD: number;
    BaseParamSpecial4?: any;
    BaseParamSpecial4Target: string;
    BaseParamSpecial4TargetiD: number;
    BaseParamSpecial5?: any;
    BaseParamSpecial5Target: string;
    BaseParamSpecial5TargetiD: number;
    BaseParamValue0: number;
    BaseParamValue1: number;
    BaseParamValue2: number;
    BaseParamValue3: number;
    BaseParamValue4: number;
    BaseParamValue5: number;
    BaseParamValueSpecial0: number;
    BaseParamValueSpecial1: number;
    BaseParamValueSpecial2: number;
    BaseParamValueSpecial3: number;
    BaseParamValueSpecial4: number;
    BaseParamValueSpecial5: number;
    Block: number;
    BlockRate: number;
    CanBeHq: number;
    ClassJobCategory?: any;
    ClassJobCategoryTarget: string;
    ClassJobCategoryTargetiD: number;
    ClassJobRepair?: any;
    ClassJobRepairTarget: string;
    ClassJobRepairTargetiD: number;
    ClassJobUse?: any;
    ClassJobUseTarget: string;
    ClassJobUseTargetID: number;
    CooldownS: number;
    DamageMag: number;
    DamagePhys: number;
    DefenseMag: number;
    DefensePhys: number;
    DelayMs: number;
    Description: string;
    DescriptionJSON: string[];
    DescriptionJSON_chs: string[];
    DescriptionJSON_de: string[];
    DescriptionJSON_en: string[];
    DescriptionJSON_fr: string[];
    DescriptionJSON_ja: string[];
    DescriptionJSON_kr?: any;
    Description_chs: string;
    Description_de: string;
    Description_en: string;
    Description_fr: string;
    Description_ja: string;
    Description_kr?: any;
    Desynth: number;
    EquipRestriction: number;
    EquipSlotCategory?: any;
    EquipSlotCategoryTarget: string;
    EquipSlotCategoryTargetiD: number;
    FilterGroup: number;
    GameContentLinks: GameContentLink;
    Gamepatch: GamePatch;
    GrandCompany?: any;
    GrandCompanyTarget: string;
    GrandCompanyTargetiD: number;
    ID: number;
    Icon: string;
    IconHD: string;
    IconiD: number;
    IsAdvancedMeldingPermitted: number;
    IsCollectable: number;
    IsCrestWorthy: number;
    IsDyeable: number;
    IsGlamourous: number;
    IsIndisposable: number;
    IsPvP: number;
    IsUnique: number;
    IsUntradable: number;
    ItemAction?: any;
    ItemActionTarget: string;
    ItemActionTargetiD: number;
    ItemGlamour?: any;
    ItemGlamourTarget: string;
    ItemGlamourTargetiD: number;
    ItemKind: ItemKind;
    ItemRepair?: any;
    ItemRepairTarget: string;
    ItemRepairTargetiD: number;
    ItemSearchCategory: ItemSearchCategory;
    ItemSearchCategoryTarget: string;
    ItemSearchCategoryTargetiD: number;
    ItemSeries?: any;
    ItemSeriesTarget: string;
    ItemSeriesTargetiD: number;
    ItemSortCategory: ItemSortCategory;
    ItemSortCategoryTarget: string;
    ItemSortCategoryTargetiD: number;
    ItemSpecialBonus?: any;
    ItemSpecialBonusParam: number;
    ItemSpecialBonusTarget: string;
    ItemSpecialBonusTargetiD: number;
    ItemUICategory: ItemUICategory;
    ItemUICategoryTarget: string;
    ItemUICategoryTargetiD: number;
    LevelEquip: number;
    LevelItem: number;
    Lot: number;
    Materia?: any;
    MateriaSlotCount: number;
    MaterializeType: number;
    ModelMain: string;
    ModelSub: string;
    Name: string;
    Name_chs: string;
    Name_de: string;
    Name_en: string;
    Name_fr: string;
    Name_ja: string;
    Patch: number;
    Plural: string;
    Plural_chs: string;
    Plural_de: string;
    Plural_en: string;
    Plural_fr: string;
    Plural_ja: string;
    Possessivepronoun: number;
    PriceLow: number;
    PriceMid: number;
    Pronoun: number;
    Rarity: number;
    Recipes: Recipe[];
    Singular: string;
    Singular_chs: string;
    Singular_de: string;
    Singular_en: string;
    Singular_fr: string;
    Singular_ja: string;
    StackSize: number;
    StartsWithVowel: number;
    SubStatCategory: number;
    Url: string;
}

export async function getItem(id: number, locale: XIVAPILocale = "zh") {
    const result: AxiosResponse<Item> = await axios.request({
        method: "GET",
        baseURL: (locale === "zh") ? "https://cafemaker.wakingsands.com/" : "https://xivapi.com/",
        url: `/Item/${id}`
    });
    return result.data;
}
