import {Data, ItemInfo} from "../API/GarlandTools";
import {Canvas, loadImage} from "skia-canvas";
import getRarityColor from "../util/getRarityColor";
import path from "path";
import {__root_dir} from "../../index";
import {toReadableTime} from "../util/format";

let w = 0, h = 0;
export async function drawItemInfo(itemInfo: ItemInfo, data: Data, redraw: boolean = false) {
    const top = 16, bottom = 16,
        left = 16, right = 16;

    const drawWidth = 720,
        duration = 8;

    const tinyIconHeight = 24;

    const canvas = new Canvas(
        redraw ? w : (left + drawWidth + right),
        redraw ? h : (top + bottom));
    const ctx = canvas.getContext("2d");

    const drawPos = [left, right]

    const icon_hq = await loadImage(path.join(__root_dir, "/public/image/hq.png"));
    const icon_gil = await loadImage(path.join(__root_dir, "/public/image/gil.png"));

    const patchCategoryName = (() => {
        for (const i in data.patch.categoryIndex)
            if (i === itemInfo.item.patchCategory.toString()) return data.patch.categoryIndex[i];
        return null;
    })();
    const categoryName = (() => {
        for (const i in data.item.categoryIndex)
            if (data.item.categoryIndex[i].id === itemInfo.item.category) return data.item.categoryIndex[i].name;
        return null;
    })();

    const getLocationIndex = (id: number) => {
        if (!data.locationIndex[id]) return null;
        return data.locationIndex[id];
    }

    const getJobIndex = (id: number) => {
        if (!data.jobs[id]) return null;
        return data.jobs[id];
    }

    const getJobCategoriesIndex = (id: number) => {
        if (!data.jobCategories[id]) return null;
        return data.jobCategories[id];
    }

    const getVentureIndex = (id: number) => {
        if (!data.ventureIndex[id]) return null;
        return data.ventureIndex[id];
    }

    const findItemPartial = (id: string | number) => {
        for (const i in itemInfo.partials)
            if (itemInfo.partials[i].type === "item" && itemInfo.partials[i].id === id.toString()) return itemInfo.partials[i].obj;
        return null;
    }

    const findNpcPartial = (id: string | number) => {
        for (const i in itemInfo.partials)
            if (itemInfo.partials[i].type === "npc" && itemInfo.partials[i].id === id.toString()) return itemInfo.partials[i].obj;
        return null;
    }

    // ?????????????????????
    {
        const itemIcon = await loadImage(`https://garlandtools.cn/files/icons/item/${itemInfo.item.icon}.png`);
        const iconHeight = 128;
        ctx.drawImage(itemIcon, drawPos[0], drawPos[1], iconHeight / itemIcon.height * itemIcon.width, iconHeight);
        drawPos[0] += iconHeight / itemIcon.height * itemIcon.width + duration;

        ctx.save();
        ctx.fillStyle = getRarityColor(itemInfo.item.rarity);
        ctx.font = "32px WenquanyiZhengHei,simhei,sans";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const itemNameMeasure = ctx.measureText(itemInfo.item.name, drawWidth - (drawPos[0] - left));
        const itemNameHeight = itemNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
        ctx.fillText(itemInfo.item.name, drawPos[0], drawPos[1], drawWidth - (drawPos[0] - left));
        drawPos[1] += itemNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b) + duration;
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#AAAAAA";
        ctx.font = "18px Georgia,WenquanyiZhengHei,simhei,sans";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const itemInfoText = `??????${itemInfo.item.ilvl} | ${patchCategoryName || "????????????"} | ${categoryName || "????????????"}`
        const itemInfoTextMeasure = ctx.measureText(itemInfoText, drawWidth - (drawPos[0] - left));
        const itemInfoTextHeight = itemInfoTextMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
        ctx.fillText(itemInfoText, drawPos[0], drawPos[1], drawWidth - (drawPos[0] - left));
        drawPos[1] += itemInfoTextHeight + duration;
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "15px WenquanyiZhengHei,simhei,sans";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.textWrap = true;
        itemInfo.item.description = itemInfo.item.description.replace(/<br\s*\/?>/g, "\n");
        const itemDescMeasure = ctx.measureText(itemInfo.item.description, drawWidth - (drawPos[0] - left));
        const itemDescHeight = itemDescMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
        ctx.fillText(itemInfo.item.description, drawPos[0], drawPos[1], drawWidth - (drawPos[0] - left));
        drawPos[1] += itemDescHeight + duration;
        ctx.restore();

        drawPos[1] = Math.max(drawPos[1], top + iconHeight + duration);
    }

    // ??????
    {
        if (itemInfo.item.craft && itemInfo.item.craft.length) {
            drawPos[0] = left;

            ctx.save();
            ctx.fillStyle = "#C0AE43";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "24px Georgia,WenquanyiZhengHei,simhei,sans"
            const craftTitle = "????????????";
            const craftTitleMeasure = ctx.measureText(craftTitle, drawWidth - (drawPos[0] - left));
            const craftTitleHeight = craftTitleMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
            ctx.fillText(craftTitle, drawPos[0], drawPos[1]);
            drawPos[1] += craftTitleHeight + duration;
            ctx.restore();

            const getIngredient = (id: number) => {
                for (const i of itemInfo.ingredients) if (i.id === id) return i;
                for (const i in data.item.ingredients) if (data.item.ingredients[i].id === id) return data.item.ingredients[i];
                return null;
            }

            for (const craft of itemInfo.item.craft) {
                drawPos[0] = left;

                const job = getJobIndex(craft.job);

                ctx.save();
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "16px Georgia,WenquanyiZhengHei,simhei,sans";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                const ingredientTitle = `${job.name}  Lv.${craft.lvl}  ????????????${craft.rlvl}`;
                const ingredientTitleMeasure = ctx.measureText(ingredientTitle, drawWidth - (drawPos[0] - left));
                const ingredientTitleHeight = ingredientTitleMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(ingredientTitle, drawPos[0], drawPos[1]);
                drawPos[1] += ingredientTitleHeight + duration;
                ctx.restore();

                ctx.save();
                ctx.fillStyle = "#A1B2D3";
                ctx.font = "14px Georgia,WenquanyiZhengHei,simhei,sans";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                const ingredientInfo = `??????${craft.durability}  ??????${craft.progress}  ??????${craft.quality}`;
                const ingredientInfoMeasure = ctx.measureText(ingredientInfo, drawWidth - (drawPos[0] - left));
                const ingredientInfoHeight = ingredientInfoMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(ingredientInfo, drawPos[0], drawPos[1]);
                drawPos[1] += ingredientInfoHeight + duration;
                ctx.restore();

                craft.ingredients.sort((a, b) => a.id - b.id);
                for (const craftItem of craft.ingredients) {
                    drawPos[0] = left;

                    const ingredient = getIngredient(craftItem.id);
                    const ingredient_icon = await loadImage(`https://garlandtools.cn/files/icons/item/${ingredient.icon}.png`);

                    ctx.save();
                    ctx.fillStyle = "#FFFFFF";
                    ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                    ctx.textAlign = "left";
                    ctx.textBaseline = "middle";
                    const ingredientName = `${ingredient.name}??${craftItem.amount}`;
                    const ingredientNameMeasure = ctx.measureText(ingredientName);
                    const ingredientNameHeight = ingredientNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                    ctx.drawImage(ingredient_icon,
                        drawPos[0], drawPos[1],
                        ingredientNameHeight / ingredient_icon.height * ingredient_icon.width, ingredientNameHeight);
                    drawPos[0] += ingredientNameHeight / ingredient_icon.height * ingredient_icon.width + duration;
                    ctx.fillText(ingredientName, drawPos[0], drawPos[1] + ingredientNameHeight / 2);
                    drawPos[0] += ingredientNameMeasure.width + duration;
                    drawPos[1] += ingredientNameHeight + duration;
                    ctx.restore();
                }
            }
            drawPos[1] += duration;
        }
    }

    // ?????????????????????
    {
        if (itemInfo.item.vendors && itemInfo.item.vendors.length) {
            drawPos[0] = left;

            ctx.save();
            ctx.fillStyle = "#C0AE43";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "24px Georgia,WenquanyiZhengHei,simhei,sans"
            const shopTitle = "????????????";
            const shopsTitleMeasure = ctx.measureText(shopTitle, drawWidth - (drawPos[0] - left));
            const shopsTitleHeight = shopsTitleMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
            ctx.fillText(shopTitle, drawPos[0], drawPos[1]);
            drawPos[1] += shopsTitleHeight + duration;
            ctx.restore();

            drawPos[0] = left;

            ctx.save();
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "18px Georgia,WenquanyiZhengHei,simhei,sans"
            const priceTitle = `????????????????????????????????????${itemInfo.item.price}`;
            const priceTitleMeasure = ctx.measureText(priceTitle, drawWidth - (drawPos[0] - left));
            const priceTitleHeight = priceTitleMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
            ctx.fillText(priceTitle, drawPos[0], drawPos[1]);
            drawPos[0] += priceTitleMeasure.width;
            ctx.drawImage(icon_gil, drawPos[0], drawPos[1], priceTitleHeight / icon_gil.height * icon_gil.width, priceTitleHeight);
            drawPos[0] += priceTitleHeight / icon_gil.height * icon_gil.width;
            ctx.fillText("???", drawPos[0], drawPos[1]);
            drawPos[1] += priceTitleHeight + duration;
            ctx.restore();

            drawPos[0] = left;

            for (const s of itemInfo.item.vendors) {
                ctx.save();
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.font = "15px Georgia,WenquanyiZhengHei,simhei,sans";
                const shopNpcs = itemInfo.item.vendors.map(n => {
                    for (const i in itemInfo.partials)
                        if (itemInfo.partials[i].type === "npc" && itemInfo.partials[i].obj.i === n) return itemInfo.partials[i].obj;
                    return null;
                });
                // ??????NPC
                shopNpcs.forEach(n => {
                    const tradeShopName = n.n as string;
                    const tradeShopNameMeasure = ctx.measureText(tradeShopName);
                    ctx.fillText(tradeShopName, drawPos[0], drawPos[1]);
                    drawPos[0] += tradeShopNameMeasure.width + duration;
                    drawPos[1] += tradeShopNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);

                    ctx.save();
                    ctx.fillStyle = "#BBBBBB";
                    ctx.textBaseline = "bottom";
                    ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                    const location = n.a ? getLocationIndex(n.a as number) : { name: "????????????" };
                    const locationText = `${location.name}` + (n.c ? `(${(n.c as number[]).join(",")})` : "");
                    ctx.fillText(locationText, drawPos[0], drawPos[1]);
                    ctx.restore();
                    drawPos[0] = left;
                    drawPos[1] += duration;
                });
                ctx.restore();
            }
            drawPos[1] += duration;
        }
    }

    // ?????????????????????
    {
        if (itemInfo.item.ventures && itemInfo.item.ventures.length) {
            drawPos[0] = left;

            ctx.save();
            ctx.fillStyle = "#C0AE43";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "24px Georgia,WenquanyiZhengHei,simhei,sans"
            const ventureTitle = "????????????";
            const ventureTitleMeasure = ctx.measureText(ventureTitle, drawWidth - (drawPos[0] - left));
            const ventureTitleHeight = ventureTitleMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
            ctx.fillText(ventureTitle, drawPos[0], drawPos[1]);
            drawPos[1] += ventureTitleHeight + duration;
            ctx.restore();

            drawPos[0] = left;

            ctx.save();
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "18px Georgia,WenquanyiZhengHei,simhei,sans"
            const ventureDesc = `???????????????????????????????????????`;
            const ventureDescMeasure = ctx.measureText(ventureDesc, drawWidth - (drawPos[0] - left));
            const ventureDescHeight = ventureDescMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
            ctx.fillText(ventureDesc, drawPos[0], drawPos[1]);
            drawPos[0] += ventureDescMeasure.width;
            drawPos[1] += ventureDescHeight + duration;
            ctx.restore();

            drawPos[0] = left;

            for (const v of itemInfo.item.ventures) {
                const venture = getVentureIndex(v);
                const jobCategories = getJobCategoriesIndex(venture.jobs);

                ctx.save();
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.font = "15px Georgia,WenquanyiZhengHei,simhei,sans";
                const ventureName = venture.name || `???????????????${itemInfo.item.name}`;
                const ventureNameMeasure = ctx.measureText(ventureName);
                const ventureNameHeight = ventureNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(ventureName, drawPos[0], drawPos[1]);
                drawPos[1] += ventureNameHeight;
                ctx.restore();

                ctx.save();
                ctx.fillStyle = "#AAAAAA";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                const jobName = `${jobCategories.name}?????????${venture.cost}???????????????`;
                const jobNameMeasure = ctx.measureText(jobName);
                const jobNameHeight = jobNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(jobName, drawPos[0], drawPos[1]);
                drawPos[1] += jobNameHeight + duration;
                ctx.restore();

                drawPos[0] = left;
                const attrName = venture.ilvl ? "????????????" : venture.gathering ? "?????????" : "????????????";
                ctx.save();
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                const attrNameMeasure = ctx.measureText(attrName);
                const attrNameHeight = attrNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(attrName, drawPos[0], drawPos[1]);

                drawPos[0] += drawWidth / 4;
                const amountTitle = venture.random ? "??????" : "??????";
                const amountMeasure = ctx.measureText(amountTitle);
                const amountHeight = amountMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(amountTitle, drawPos[0], drawPos[1]);

                drawPos[0] += drawWidth / 4;
                const lvlTitle = "??????";
                const lvlMeasure = ctx.measureText(lvlTitle);
                const lvlHeight = lvlMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(lvlTitle, drawPos[0], drawPos[1]);

                drawPos[0] += drawWidth / 4;
                const timeTitle = "??????";
                const timeMeasure = ctx.measureText(timeTitle);
                const timeHeight = timeMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.fillText(timeTitle, drawPos[0], drawPos[1]);
                drawPos[1] += Math.max(attrNameHeight, amountHeight, lvlHeight, timeHeight);

                const attr = venture.ilvl || venture.gathering || ["???"];
                const primaryPos = [drawPos[0], drawPos[1]];
                const endPos = [drawPos[0], drawPos[1]];
                for (let i = 0; i < attr.length; i++) {
                    drawPos[0] = left;
                    const attrHeight = ctx.measureText(`${attr[i]}`).lines.map(l => l.height).reduce((a, b) => a + b);
                    ctx.fillText(`${attr[i]}`, drawPos[0], drawPos[1]);
                    drawPos[0] = left + drawWidth / 4;
                    const amount = venture.amounts ? `${venture.amounts[i]}` : "????????????";
                    const amountHeight = ctx.measureText(amount).lines.map(l => l.height).reduce((a, b) => a + b);
                    ctx.fillText(`??${amount}`, drawPos[0], drawPos[1]);
                    drawPos[1] += Math.max(attrHeight, amountHeight);
                }
                endPos[1] = Math.max(drawPos[1], endPos[1]);

                drawPos[1] = primaryPos[1];
                for (let i = 0; i <= 2 && venture.lvl + i * 10 <= data.xp.length - 1; i++) {
                    drawPos[0] = left + drawWidth / 4 * 2;
                    const lvl = venture.lvl + i * 10;
                    const lvlHeight = ctx.measureText(`${lvl}`).lines.map(l => l.height).reduce((a, b) => a + b);
                    ctx.fillText(`${lvl}`, drawPos[0], drawPos[1]);
                    drawPos[0] = left + drawWidth / 4 * 3;
                    const time = `${toReadableTime((venture.minutes - i * 10) * 60)}`;
                    const timeHeight = ctx.measureText(time).lines.map(l => l.height).reduce((a, b) => a + b);
                    ctx.fillText(`${time}`, drawPos[0], drawPos[1]);
                    drawPos[1] += Math.max(lvlHeight, timeHeight);
                    if (venture.random) break;
                }
                endPos[1] = Math.max(drawPos[1], endPos[1]);

                drawPos[1] = endPos[1];
                ctx.restore();
            }
            drawPos[1] += duration;
        }
    }

    // ?????????????????????
    {
        if (itemInfo.item.tradeShops && itemInfo.item.tradeShops.length) {
            drawPos[0] = left;

            ctx.save();
            ctx.fillStyle = "#C0AE43";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "24px Georgia,WenquanyiZhengHei,simhei,sans"
            const tradeShopsTitle = "????????????";
            const tradeShopsTitleMeasure = ctx.measureText(tradeShopsTitle, drawWidth - (drawPos[0] - left));
            const tradeShopsTitleHeight = tradeShopsTitleMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
            ctx.fillText(tradeShopsTitle, drawPos[0], drawPos[1]);
            drawPos[1] += tradeShopsTitleHeight + duration;
            ctx.restore();

            // ????????????????????????
            for (const s of itemInfo.item.tradeShops) {
                ctx.save();
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.font = "15px Georgia,WenquanyiZhengHei,simhei,sans";
                const tradeShopNpc = (() => {
                    if (!s.npcs.length) return [{ n: "??????NPC", a: 0, c: [0, 0] }]
                    return s.npcs.map(n => {
                        for (const i in itemInfo.partials)
                            if (itemInfo.partials[i].type === "npc" && itemInfo.partials[i].obj.i === n) return itemInfo.partials[i].obj;
                        return null;
                    })
                })();
                // ??????NPC
                tradeShopNpc.forEach(n => {
                    const tradeShopName = n.n as string;
                    const tradeShopNameMeasure = ctx.measureText(tradeShopName);
                    ctx.fillText(tradeShopName, drawPos[0], drawPos[1]);
                    drawPos[0] += tradeShopNameMeasure.width + duration;
                    drawPos[1] += tradeShopNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);

                    ctx.save();
                    ctx.fillStyle = "#BBBBBB";
                    ctx.textBaseline = "bottom";
                    ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                    const area = n.a ? getLocationIndex(n.a as number) : { name: "????????????" };
                    const zone = n.l ? getLocationIndex(n.l as number) : { name: "????????????" };
                    const locationText = `${zone.name} ${area.name}` + (n.c ? `(${(n.c as number[]).join(",")})` : "");
                    ctx.fillText(locationText, drawPos[0], drawPos[1]);
                    ctx.restore();
                    drawPos[0] = left;
                    drawPos[1] += duration;
                });
                const primaryDrawPos = [drawPos[0], drawPos[1]];
                const endDrawPos = [drawPos[0], drawPos[1]];      // ??????????????????????????????????????????
                // ??????????????????
                for (const l of s.listings) {
                    drawPos[0] = primaryDrawPos[0];
                    for (const i of l.item) {
                        ctx.save();
                        const listItem = (i.id === itemInfo.item.id.toString()) ? {
                            i: itemInfo.item.id,
                            c: itemInfo.item.icon,
                            n: itemInfo.item.name
                        } : findItemPartial(i.id);
                        const icon = await loadImage(`https://garlandtools.cn/files/icons/item/${listItem.c as number}.png`);
                        ctx.drawImage(icon, drawPos[0], drawPos[1], tinyIconHeight / icon.height * icon.width, tinyIconHeight);
                        drawPos[0] += tinyIconHeight / icon.height * icon.width + duration;
                        drawPos[1] += tinyIconHeight / 2;
                        ctx.fillStyle = "#FFFFFF";
                        ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                        ctx.textAlign = "left";
                        ctx.textBaseline = "middle";
                        const iNameText = `${listItem.n}`;
                        const iNameTextMeasure = ctx.measureText(iNameText);
                        const iNameTextHeight = iNameTextMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                        ctx.fillText(iNameText, drawPos[0], drawPos[1]);
                        drawPos[0] += iNameTextMeasure.width

                        if (i.hq) {
                            ctx.drawImage(icon_hq, drawPos[0], drawPos[1] - iNameTextHeight / 2, icon_hq.height / iNameTextHeight * icon_hq.width, iNameTextHeight);
                            drawPos[0] += icon_hq.height / iNameTextHeight * icon_hq.width;
                        }
                        if (i.amount > 1) {
                            const amountText = `??${i.amount}`;
                            const amountTextMeasure = ctx.measureText(amountText);
                            ctx.fillText(amountText, drawPos[0], drawPos[1]);
                            drawPos[0] += amountTextMeasure.width;
                        }
                        ctx.restore();

                        drawPos[1] += Math.max(tinyIconHeight / 2, iNameTextHeight / 2)
                        endDrawPos[1] = Math.max(endDrawPos[1], drawPos[1]);
                        drawPos[0] = primaryDrawPos[0];
                    }
                    drawPos[1] = primaryDrawPos[1];
                    for (const c of l.currency) {
                        drawPos[0] = left + drawWidth;
                        ctx.save();
                        const listItem = (c.id === itemInfo.item.id.toString()) ? {
                            i: itemInfo.item.id,
                            c: itemInfo.item.icon,
                            n: itemInfo.item.name
                        } : findItemPartial(c.id);
                        /* ??????????????? */
                        ctx.fillStyle = "#FFFFFF";
                        ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                        ctx.textAlign = "right";
                        ctx.textBaseline = "middle";
                        const cNameText = `${listItem.n}`;
                        const cNameTextMeasure = ctx.measureText(cNameText);
                        const cNameTextHeight = cNameTextMeasure.lines.map(l => l.height).reduce((a, b) => a + b);

                        const icon = await loadImage(`https://garlandtools.cn/files/icons/item/${listItem.c as number}.png`);
                        drawPos[1] += tinyIconHeight / 2;

                        if (c.amount > 1) {
                            const amountText = `??${c.amount}`;
                            const amountTextMeasure = ctx.measureText(amountText);
                            ctx.fillText(amountText, drawPos[0], drawPos[1]);
                            drawPos[0] -= amountTextMeasure.width;
                        }

                        if (c.hq) {
                            const iconWidth = icon_hq.height / cNameTextHeight * icon_hq.width
                            ctx.drawImage(icon_hq, drawPos[0] - iconWidth, drawPos[1] - cNameTextHeight / 2, iconWidth, cNameTextHeight);
                            drawPos[0] -= iconWidth;
                        }

                        ctx.fillText(cNameText, drawPos[0], drawPos[1]);
                        drawPos[0] -= cNameTextMeasure.width

                        const iconWidth = tinyIconHeight / icon.height * icon.width
                        ctx.drawImage(icon, drawPos[0] - iconWidth, drawPos[1] - tinyIconHeight / 2, iconWidth, tinyIconHeight);
                        drawPos[0] -= tinyIconHeight / icon.height * icon.width
                        ctx.restore();

                        drawPos[1] += Math.max(tinyIconHeight / 2, cNameTextHeight / 2)
                        endDrawPos[1] = Math.max(endDrawPos[1], drawPos[1]);
                    }
                }
                drawPos[0] = primaryDrawPos[0];
                drawPos[1] = endDrawPos[1] + duration;
                ctx.restore();
            }
            drawPos[1] += duration;
        }
    }

    // ????????????
    {
        if (itemInfo.item.ingredient_of) {
            drawPos[0] = left;

            ctx.save();
            ctx.fillStyle = "#C0AE43";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.font = "24px Georgia,WenquanyiZhengHei,simhei,sans"
            const ingredientOfTitle = "????????????";
            const ingredientOfTitleMeasure = ctx.measureText(ingredientOfTitle, drawWidth - (drawPos[0] - left));
            const ingredientOfTitleHeight = ingredientOfTitleMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
            ctx.fillText(ingredientOfTitle, drawPos[0], drawPos[1]);
            drawPos[1] += ingredientOfTitleHeight + duration;
            ctx.restore();

            for (const id in itemInfo.item.ingredient_of) {
                drawPos[0] = left;
                const target_icon_partial = findItemPartial(id);
                const target_item_icon = await loadImage(`https://garlandtools.cn/files/icons/item/${target_icon_partial.c}.png`);

                ctx.save();
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                const targetItemNameMeasure = ctx.measureText(target_icon_partial.n as string);
                const targetItemNameHeight = targetItemNameMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
                ctx.drawImage(target_item_icon,
                    drawPos[0], drawPos[1],
                    targetItemNameHeight / target_item_icon.height * target_item_icon.width,targetItemNameHeight);
                drawPos[0] += targetItemNameHeight / target_item_icon.height * target_item_icon.width + duration;
                ctx.fillText(target_icon_partial.n as string, drawPos[0], drawPos[1] + targetItemNameHeight / 2);
                drawPos[0] += targetItemNameMeasure.width + duration;

                ctx.fillStyle = "#B1C2D3";
                ctx.fillText(`????????${itemInfo.item.ingredient_of[id]}`, drawPos[0], drawPos[1] + targetItemNameHeight / 2);
                ctx.restore();

                drawPos[1] += targetItemNameHeight + duration;
            }
            drawPos[1] += duration;
        }
    }

    // ????????????
    {
        drawPos[0] = left;

        ctx.save();
        ctx.fillStyle = "rgb(192, 192, 192)";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "12px Georgia,WenquanyiZhengHei,simhei,sans";
        ctx.textWrap = true;
        const announcement =
            `??????????????????${new Date().toLocaleString("zh-CN", { hour12: false })}??????????????????Garland Tools????????????\n` +
            "????????????????????????koishi-plugin-ffxiv?????????????????????koishi v3?????????\n" +
            "??????????????????https://github.com/ReiKohaku/koishi-plugin-ffxiv???\n" +
            "???????????????????????????????????????Garland Tools??????????????????14???????????????????????????????????????????????????\n" +
            "??????????????????????????????????????????????????????????????????????????????????????????????????????";
        const announcementMeasure = ctx.measureText(announcement, drawWidth - (drawPos[0] - left));
        const announcementHeight = announcementMeasure.lines.map(l => l.height).reduce((a, b) => a + b);
        ctx.fillText(announcement, drawPos[0], drawPos[1]);
        drawPos[1] += announcementHeight + duration;
        ctx.restore();
    }

    /* ???????????? */
    const image = ctx.getImageData(0, 0, canvas.width, drawPos[1] + bottom);
    canvas.height = image.height;
    ctx.putImageData(image, 0, 0);

    // ????????????
    {
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#182927";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    w = canvas.width;
    h = canvas.height;

    return canvas.toBuffer("png");
}
