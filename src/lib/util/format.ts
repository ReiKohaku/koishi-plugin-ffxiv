export function prefixNum(num: number, length: number = 2): string {
    let str = num.toString();
    for (let i = str.length; i < length; i++) str = "0" + str;
    return str;
}

export function insertStr(source: string, start: number, newStr: string) {
    return source.slice(0, start) + newStr + source.slice(start);
}

export function toCurrentTimeDifference(time: Date, withSoonerOrLater?: boolean) {
    const nowNum = new Date().getTime();
    const timeNum = time.getTime();
    const timeDiff = Math.abs(timeNum - nowNum) / 1000;
    return ((Math.floor(timeDiff / (60 * 60 * 24)) > 0) ? `${Math.floor(timeDiff / (60 * 60 * 24))}天` : "") +
           ((Math.floor(timeDiff / (60 * 60)) > 0) ? `${Math.floor(timeDiff / (60 * 60)) % 24}时` : "") +
           ((Math.floor(timeDiff / 60) > 0) ? `${Math.floor(timeDiff / 60) % 60}分` : "") +
           `${Math.floor(timeDiff % 60)}秒` + (withSoonerOrLater ? ((timeNum > nowNum) ? "后" : "前") : "");
}
