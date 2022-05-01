import {Canvas, loadImage, FontLibrary} from "skia-canvas";
import {drawLegends} from "./Util";
import {__root_dir} from "../../index";
import * as path from "path";
import getRarityColor from "../util/getRarityColor";
import {toCurrentTimeDifference} from "../util/format";

if (!FontLibrary.has("Georgia")) FontLibrary.use("Georgia", path.join(__root_dir, "/public/fonts/Georgia.ttf"));
if (!FontLibrary.has("WenquanyiZhengHei")) FontLibrary.use("WenquanyiZhengHei", path.join(__root_dir, "/public/fonts/WenquanyiZhengHei.ttf"));

export async function drawItemPriceList(itemInfo: {
    Name: string,
    Icon: string,
    LevelItem: number,
    ItemKind: { Name: string },
    ItemSearchCategory: { Name: string },
    Rarity: number,
    CanBeHq: number
}, saleInfo: {
    itemID: number,
    lastUploadTime: number,
    dcName?: string,
    worldName?: string,
    minPriceNQ: number,
    minPriceHQ: number,
    maxPriceNQ: number,
    maxPriceHQ: number,
    listings: {
        lastReviewTime: number
        worldName?: string,
        hq: boolean,
        pricePerUnit: number,
        quantity: number,
        total: number,
        retainerName: string
    }[]
}): Promise<Buffer> {
    const width = 720, height = 960;
    const top = 16, bottom = 16,
        left = 16, right = 16,
        duration = 8,
        drawAreaWidth = width - left - right,
        drawAreaHeight = height - top - bottom;

    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext("2d");

    const hqImage = await loadImage(path.join(__root_dir, "/public/image/hq.png"));

    /* 填充背景 */
    ctx.save();
    const backgroundLinearGrad = ctx.createLinearGradient(0, 0, 0, height);
    backgroundLinearGrad.addColorStop(0, "rgb(255, 255, 255)");
    backgroundLinearGrad.addColorStop((top * 0.3) / height, "rgb(105, 105, 105)");
    backgroundLinearGrad.addColorStop((top * 0.9) / height, "rgb(75, 75, 75)");
    backgroundLinearGrad.addColorStop(1, "rgb(27, 27, 27)");
    ctx.fillStyle = backgroundLinearGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    /* 画物品图标 */
    const iconUrl = `https://cafemaker.wakingsands.com${itemInfo.Icon}`;
    const iconSide = 64;
    try {
        const itemImage = await loadImage(iconUrl);
        ctx.drawImage(itemImage, left, top, iconSide, iconSide);
    } catch (e) {
        console.warn(`Caution: Load image from ${iconUrl} failed.`);
        console.warn(e);
    }

    /* 写物品名 */
    ctx.save();
    const itemName = itemInfo.Name;
    const itemNameFontSize = 28;
    ctx.fillStyle = getRarityColor(itemInfo.Rarity);
    ctx.font = `${itemNameFontSize}px Georgia,WenquanyiZhengHei,simhei,Sans`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(itemName,
        left + iconSide + duration,
        top,
        drawAreaWidth - iconSide - duration);
    const itemNameHeight = ctx.measureText(itemName).lines.map(l => l.height).reduce((p, c) => p + c);
    ctx.restore();

    /* 写物品信息 */
    ctx.save();
    const itemDesc = `${itemInfo.ItemKind.Name} | ${itemInfo.ItemSearchCategory.Name} | 品级${itemInfo.LevelItem}`
    ctx.fillStyle = "rgb(180, 180, 180)";
    ctx.font = "18px Georgia,WenquanyiZhengHei,simhei,Sans";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(itemDesc,
        left + iconSide + duration,
        top + itemNameHeight + duration,
        drawAreaWidth - iconSide - duration);
    const itemDescHeight = ctx.measureText(itemDesc).lines.map(l => l.height).reduce((p, c) => p + c);
    ctx.restore();

    /* 计算顶部区域底部位置 */
    const itemInfoAreaBottom = top + Math.max(iconSide, itemNameHeight + duration + itemDescHeight);

    /* 写物品最后更新信息 */
    ctx.save();
    const itemLastUpdateDesc = `${saleInfo.worldName || `${saleInfo.dcName}区`} | 最后更新于${toCurrentTimeDifference(new Date(saleInfo.lastUploadTime), true)}（${new Date(saleInfo.lastUploadTime).toLocaleString("zh-CN", { hour12: false })}）`;
    ctx.fillStyle = "rgb(180, 180, 180)";
    ctx.font = "14px Georgia,WenquanyiZhengHei,simhei,Sans";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(itemLastUpdateDesc,
        left,
        itemInfoAreaBottom + duration,
        drawAreaWidth - iconSide - duration);
    const itemLastUpdateHeight = ctx.measureText(itemLastUpdateDesc).lines.map(l => l.height).reduce((p, c) => p + c);
    ctx.restore();

    /* 画物品高低价比较 */
    const nqColor = "rgb(210, 210, 210)";
    const hqColor = "rgb(221, 201, 70)";
    const linearHeight = 12;
    const legendSide = 16;
    const itemPriceCompareAreaTop = itemInfoAreaBottom + duration + itemLastUpdateHeight + duration;

    ctx.save();
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,Sans";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.textWrap = true;
    const legendsArea = drawLegends(ctx, [{color: nqColor, name: "普通"}, {color: hqColor, name: "高品质"}],
        left, itemPriceCompareAreaTop, legendSide, legendSide, duration);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "9px Georgia,WenquanyiZhengHei,Sans";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.textWrap = false;
    const minPriceNQ = `${saleInfo.minPriceNQ}`;
    const minPriceHQ = itemInfo.CanBeHq ? `${saleInfo.minPriceHQ}` : "无HQ版本";
    const maxPriceNQ = `${saleInfo.maxPriceNQ}`;
    const maxPriceHQ = itemInfo.CanBeHq ? `${saleInfo.maxPriceHQ}` : "无HQ版本";
    const maxNumberTextWidth = Math.max(
        ctx.measureText(`${minPriceNQ}`).width,
        ctx.measureText(`${minPriceHQ}`).width,
        ctx.measureText(`${maxPriceNQ}`).width,
        ctx.measureText(`${maxPriceHQ}`).width,
    );

    const itemPriceCompareAreaHeight = Math.max(legendsArea.height, linearHeight * 4 + duration);
    const minPrice = Math.min(saleInfo.minPriceNQ, saleInfo.minPriceHQ);
    const maxPrice = Math.max(saleInfo.maxPriceNQ, saleInfo.maxPriceHQ);
    const maxLinearWidth = drawAreaWidth - legendsArea.width - duration - maxNumberTextWidth - duration;

    // 最低NQ价格
    ctx.save();
    ctx.fillStyle = nqColor;
    const minPriceNQLinearWidth = saleInfo.minPriceNQ / maxPrice * maxLinearWidth;
    ctx.fillRect(
        left + legendsArea.width + duration, itemPriceCompareAreaTop,
        minPriceNQLinearWidth, linearHeight);
    ctx.restore();
    ctx.fillText(minPriceNQ,
        left + legendsArea.width + duration + minPriceNQLinearWidth + (saleInfo.minPriceNQ ? duration : 0),
        itemPriceCompareAreaTop + linearHeight / 2);

    // 最低HQ价格
    ctx.save();
    ctx.fillStyle = hqColor;
    const minPriceHQLinearWidth = saleInfo.minPriceHQ / maxPrice * maxLinearWidth;
    ctx.fillRect(
        left + legendsArea.width + duration, itemPriceCompareAreaTop + linearHeight,
        minPriceHQLinearWidth, linearHeight);
    ctx.restore();
    ctx.fillText(minPriceHQ,
        left + legendsArea.width + duration + minPriceHQLinearWidth + (saleInfo.minPriceHQ ? duration : 0),
        itemPriceCompareAreaTop + linearHeight + linearHeight / 2);

    // 最高NQ价格
    ctx.save();
    ctx.fillStyle = nqColor;
    const maxPriceNQLinearWidth = saleInfo.maxPriceNQ / maxPrice * maxLinearWidth;
    ctx.fillRect(
        left + legendsArea.width + duration, itemPriceCompareAreaTop + linearHeight * 2 + duration,
        maxPriceNQLinearWidth, linearHeight);
    ctx.restore();
    ctx.fillText(maxPriceNQ,
        left + legendsArea.width + duration + maxPriceNQLinearWidth + (saleInfo.maxPriceNQ ? duration : 0),
        itemPriceCompareAreaTop + linearHeight * 2 + duration + linearHeight / 2);

    // 最高HQ价格
    ctx.save();
    ctx.fillStyle = hqColor;
    const maxPriceHQLinearWidth = saleInfo.maxPriceHQ / maxPrice * maxLinearWidth;
    ctx.fillRect(
        left + legendsArea.width + duration, itemPriceCompareAreaTop + linearHeight * 3 + duration,
        maxPriceHQLinearWidth, linearHeight);
    ctx.restore();
    ctx.fillText(maxPriceHQ,
        left + legendsArea.width + duration + maxPriceHQLinearWidth + (saleInfo.maxPriceHQ ? duration : 0),
        itemPriceCompareAreaTop + linearHeight * 3 + duration + linearHeight / 2);

    ctx.restore();

    /* 写版权信息 */
    ctx.save();
    const announcement =
        `图片生成于${new Date().toLocaleString("zh-CN", { hour12: false })}，物品数据来源于cafemaker，价格数据来源于universalis，\n` +
        "本功能来自插件（koishi-plugin-ffxiv），该插件基于koishi v3开发，\n" +
        "插件开源于：https://github.com/ReiKohaku/koishi-plugin-ffxiv。\n" +
        "本插件作者（或开发团体）与cafemaker、universalis和《最终幻想14》的开发与发行公司无任何直接联系。\n" +
        "作者（或开发团体）不对您使用本功能带来的一切可能的后果承担任何责任。"
    ctx.fillStyle = "rgb(192, 192, 192)";
    ctx.font = "10px Georgia,WenquanyiZhengHei,simhei,Sans";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.textWrap = true;
    const announcementHeight = ctx.measureText(announcement).lines.map(l => l.height).reduce((p, c) => p + c);
    const announcementTop = height - bottom - announcementHeight;
    ctx.fillText(announcement, left, announcementTop, drawAreaWidth);
    ctx.restore();

    /* 写物品出售列表 */
    let currentItemTop = itemPriceCompareAreaTop + itemPriceCompareAreaHeight + duration;
    const listBottom = announcementTop - duration;
    const itemHeight = 48;
    const nqItemLinearGrad = ctx.createLinearGradient(left, 0, left + drawAreaWidth, 0);
    nqItemLinearGrad.addColorStop(0, "rgba(64, 64, 64, 255)");
    nqItemLinearGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    const hqItemLinearGrad = ctx.createLinearGradient(left, 0, left + drawAreaWidth, 0);
    hqItemLinearGrad.addColorStop(0, "rgba(152, 152, 64, 255)");
    hqItemLinearGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    for (let i = 0; i < saleInfo.listings.length && currentItemTop + itemHeight < listBottom; i++) {
        const item = saleInfo.listings[i];
        ctx.save();
        ctx.fillStyle = item.hq ? hqItemLinearGrad : nqItemLinearGrad;
        ctx.fillRect(left, currentItemTop, drawAreaWidth, itemHeight);
        ctx.restore();

        ctx.save();
        let drawPosLeft = left + duration;
        let drawPosTop = currentItemTop + duration;
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "16px Georgia,WenquanyiZhengHei,simhei,Sans";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const itemPerPriceText = `${item.pricePerUnit}Gil/个`;
        const itemPerPriceTextMeasure = ctx.measureText(itemPerPriceText);
        const itemPerPriceTextWidth = itemPerPriceTextMeasure.width;
        const itemPerPriceTextHeight = itemPerPriceTextMeasure.lines.map(l => l.height).reduce((p, c) => p + c);
        ctx.fillText(itemPerPriceText, drawPosLeft, drawPosTop);
        drawPosLeft += itemPerPriceTextWidth;
        if (item.hq) {
            ctx.drawImage(hqImage,
                drawPosLeft, drawPosTop,
                itemPerPriceTextHeight, itemPerPriceTextHeight);
            drawPosLeft += itemPerPriceTextHeight;
        }
        drawPosLeft += duration;

        const itemQuantityText = `${item.quantity}个`;
        const itemQuantityTextWidth = ctx.measureText(itemQuantityText).width;
        ctx.fillText(itemQuantityText, drawPosLeft, drawPosTop);
        drawPosLeft += itemQuantityTextWidth;
        drawPosLeft += duration;

        const itemTotalText = `共计${item.total}Gil`;
        const itemTotalTextWidth = ctx.measureText(itemTotalText).width;
        ctx.fillText(itemTotalText, drawPosLeft, drawPosTop);
        drawPosLeft += itemTotalTextWidth;
        drawPosLeft += duration;

        drawPosLeft = left + duration;
        drawPosTop = currentItemTop + itemPerPriceTextHeight + duration;

        ctx.fillStyle = "rgb(192, 192, 192)";
        ctx.font = "14px Georgia,WenquanyiZhengHei,simhei,Sans";
        ctx.fillText(`${item.worldName ? `${item.worldName}` : ""} | ${item.retainerName} | 信息上传于${toCurrentTimeDifference(new Date(item.lastReviewTime * 1000), true)}（${new Date(item.lastReviewTime * 1000).toLocaleString("zh-CN", { hour12: false })}）`, drawPosLeft, drawPosTop)

        ctx.restore();
        currentItemTop += itemHeight + duration;
    }

    return canvas.toBuffer("png");
}
