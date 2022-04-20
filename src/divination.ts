import {Context} from "koishi-core";
import crypto from "crypto";

export function apply(ctx: Context) {
    ctx.command("ffxiv.divination")
        .alias("占卜")
        .alias("抽签")
        .alias("今日运势")
        .usage("查看今日艾欧泽亚运势，仅供娱乐。")
        .action(async({ session }) => {
            const today = new Date();
            const genStr = `${today.toDateString()}${session.userId}`;
            const resultStr = crypto.createHash("sha256").update(genStr).digest("hex");
            let result = 0;
            for (const char of resultStr) result += parseInt(char, 16);

            const jobs = [
                "骑士", "战士", "暗黑骑士", "绝枪战士",
                "白魔法师", "学者", "占星术士", "贤者",
                "武僧", "龙骑士", "忍者", "武士", "钐镰客",
                "吟游诗人", "机工士", "舞者",
                "黑魔法师", "召唤师", "赤魔法师", "青魔法师"
            ];
            const doings = [
                "导随", "挖宝", "起鱼王", "捡豆芽",
                "练级", "刷坐骑", "赛鸟", "海钓",
                "挂机", "PVP", "偷晴", "换装",
                "木工", "锻铁", "铸甲", "雕金",
                "制革", "裁缝", "炼金", "烹调",
                "挖矿", "采石", "砍伐", "割草",
                "蹲天穹街", "搓收藏品", "采收藏品", "刷F.A.T.E."
            ];

            const getTendency = (seed) => {
                const result = seed % 21;
                if (result === 2) return "大凶";
                else if (result === 3 || result === 5) return "大吉";
                else if (result === 0 || result === 10 || result === 20) return "凶";
                else if (result === 1 || result === 4 || result === 7) return "小凶";
                else if (result === 6 || result === 8 || result === 16 || result === 18) return "吉";
                else return "小吉";
            }

            const count = 2, doingsResult = [];
            for (let i = 0; i < count && i < doings.length; i++) {
                let index = (result - i * Math.ceil((doings.length + 1) / count)) % doings.length;
                while (doingsResult.includes(doings[index])) index = (index + 1 >= doings.length) ? 0 : (index + 1);
                doingsResult.push(doings[index]);
            }

            return `今日抽到了【${getTendency(result)}】签！\r` +
                `幸运职业：${jobs[result % jobs.length]}\r` +
                `宜${doingsResult[0]}，忌${doingsResult[1]}。`
        });
}
