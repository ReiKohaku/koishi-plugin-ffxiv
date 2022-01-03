export function prefixNum(num: number, length: number = 2): string {
    let str = num.toString();
    for (let i = str.length; i < length; i++) str = "0" + str;
    return str;
}

export function insertStr(source: string, start: number, newStr: string) {
    return source.slice(0, start) + newStr + source.slice(start);
}
