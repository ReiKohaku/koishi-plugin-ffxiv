import {Context} from "koishi";

export function apply(ctx: Context) {
    const getRollResult = (min, max): string => `抛出命运的骰子！您扔出了${min + Math.floor(Math.random() * (max - min + 1))}点。`

    ctx.command("random [...args]")
        .alias("随机")
        .action(async({ session }, ...args) => {
            if (args.length === 1) {
                const max = parseInt(args[0]);
                if (!Number.isNaN(max) && max > 1) return getRollResult(1, max);
                return;
            } else if (args.length === 2) {
                let min = parseInt(args[0]), max = parseInt(args[1]);
                if (Number.isNaN(min) || Number.isNaN(max) || min === max || min < 1) return;
                if (min < max) { const t = min; min = max; max = t; }
                return getRollResult(min, max);
            } else {
                return `当然是${args[Math.floor(Math.random() * args.length)]}了。`
            }
        });

    ctx.middleware(async (session, next) => {
        try {
            if (session.content.match(/^[!！](r|random)(\s)*([0-9]+)?(d[0-9]+)?$/i)) {
                const regExp = session.content.match(/^[!！](r|random)(\s)*([0-9]+)?(d[0-9]+)?$/i);
                const diceCount = regExp[3] ? Number.parseInt(regExp[3]) : 1;
                const sideCount = regExp[4] ? Number.parseInt(regExp[4].substring(1)) : 100;

                if (`${diceCount}${sideCount}` == '114514' ||
                    `${diceCount}${sideCount}` == '1919810' ||
                    diceCount == 114514 ||
                    sideCount == 114514 ||
                    diceCount == 1919810 ||
                    diceCount == 1919810) await session.send('？');
                else if (diceCount < 1 || diceCount > 50) return;
                else if (sideCount < 2 || sideCount > 10e8) return;
                else {
                    const results = [];
                    for (let i = 0; i < diceCount; i++) {
                        const result = Math.floor(sideCount * Math.random()) + 1;
                        results.push(result);
                    }
                    let text = `抛出命运的骰子！您扔出了${diceCount}个${sideCount}面的骰子，`;
                    if (results.length === 1) text += `其结果为 ${results[0]}。`;
                    else {
                        let sum = 0;
                        text += '其结果为：\r';
                        results.forEach((result, index, array) => {
                            text += `${result}`;
                            if (index !== array.length - 1) text += ' ';
                            sum += result;
                        });
                        text += `\r骰子面值之和为 ${sum}。`;
                    }
                    await session.send(text);
                }
                return;
            } else if (session.content.match(/^[!！](r|random)\s(.*)+$/)) {
                const regExp = session.content.match(/^[!！](r|random)\s(.*)+$/);
                let unparsedArgs = regExp[2], parsedArgs = [];
                while (/[^\s]+/.exec(unparsedArgs)) {
                    const arg = /[^\s]+/.exec(unparsedArgs)[0];
                    parsedArgs.push(arg);
                    unparsedArgs = unparsedArgs.replace(arg, '');
                }
                await session.send(`当然是${parsedArgs[Math.floor(parsedArgs.length * Math.random())]}了。`);
                return;
            }
            return next();
        } catch (e) {
            /* Do nothing... */
        }
    })
}
