class AliasList {
    private list: { name: string, alias: Set<string> }[] = [];

    constructor() {
    }

    public addItem(name: string, alias?: string[]) {
        name = name.toLowerCase();
        alias = alias.map(i => i.toLowerCase());
        const index = this.findItemIndex(name);
        if (index === null) this.list.push({
            name, alias: (alias && alias.length) ? (() => {
                const set = new Set<string>();
                alias.forEach(a => set.add(a));
                return set;
            })() : new Set()
        });
        else if (alias && alias.length) alias.forEach(a => this.list[index].alias.add(a));
    }

    public findItemIndex(item: string, includeAlias: boolean = false): number | null {
        for (const i in this.list) {
            const val = this.list[i];
            if (val.name === item.toLowerCase()) return Number.parseInt(i);
            else if (includeAlias && val.alias.has(item.toLowerCase()))
                return Number.parseInt(i);
        }
        return null;
    }

    public findItem(item: string, includeAlias: boolean = true): { name: string, alias: Set<string> } | null {
        const index = this.findItemIndex(item, includeAlias);
        if (index === null) return null;
        else return this.list[index];
    }

    public findItemName(item: string, includeAlias: boolean = true): string {
        const val = this.findItem(item, includeAlias);
        if (val === null) return item;
        else return val.name;
    }
}

const alias = new AliasList();
alias.addItem("陈旧的鞣革地图", ["g1"]);
alias.addItem("陈旧的山羊革地图", ["g2"]);
alias.addItem("陈旧的巨蟾蜍革地图", ["g3"]);
alias.addItem("陈旧的野猪革地图", ["g4"]);
alias.addItem("陈旧的毒蜥蜴革地图", ["g5"]);
alias.addItem("陈旧的古鸟革地图", ["g6"]);
alias.addItem("陈旧的飞龙革地图", ["g7"]);
alias.addItem("陈旧的巨龙革地图", ["g8"]);
alias.addItem("陈旧的迦迦纳怪鸟革地图", ["g9"]);
alias.addItem("陈旧的瞪羚革地图", ["g10"]);
alias.addItem("陈旧的绿飘龙革地图", ["g11"]);
alias.addItem("陈旧的缠尾蛟革地图", ["g12"]);
alias.addItem("陈旧的高鼻羚羊革地图", ["g13"]);
alias.addItem("陈旧的金毗罗鳄革地图", ["g14"]);
alias.addItem("陈旧的蛇牛革地图", ["g15"]);
alias.addItem("鞣革制的隐藏地图", ["单人绿", "单人绿图"]);

// 加入魔晶石系列，用代码生成
// 数组保存，参数1为本名，其余参数为增加的属性名或属性简称
const materia = [
    ["神眼", "直击"],
    ["武略", "暴击"],
    ["雄略", "信念"],
    ["信力", "信仰"],
    ["刚柔", "坚韧"],
    ["战技", "技能速度", "技速"],
    ["咏唱", "咏唱速度", "咏速"],
    ["名匠", "作业精度", "作业"],
    ["魔匠", "制作力", "cp"],
    ["巨匠", "加工精度", "加工"],
    ["达识", "获得力", "获得"],
    ["博识", "鉴别力", "鉴别"],
    ["器识", "采集力", "gp"]
]
const number = [
    ["壹", "一"],
    ["贰", "二"],
    ["叁", "三"],
    ["肆", "四"],
    ["伍", "五"],
    ["陆", "六"],
    ["柒", "七"],
    ["捌", "八"],
    ["玖", "九"],
    ["拾", "十"]
];
for (let i = 0; i < number.length; i++) {
    materia.forEach(v => {
        const materiaName = `${v[0]}魔晶石${number[i][0]}型`; // 雄略魔晶石玖型
        const aliasArray = [
            `${v[0]}魔晶石${number[i][1]}型`,
            `${v[0]}魔晶石${i + 1}型`
        ]; // 雄略魔晶石九型 雄略魔晶石9型
        v.forEach(a => {
            aliasArray.push(`${a}${number[i][0]}`, `${a}${number[i][1]}`, `${a}${i + 1}`) // 雄略玖 雄略九 雄略9
        });
        alias.addItem(materiaName, aliasArray);
    })
}

export default alias;
