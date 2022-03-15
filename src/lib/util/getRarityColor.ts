export default function getRarityColor(rarity: number) {
    switch (rarity) {
        case 2:
            return "rgb(72, 212, 72)";
        case 3:
            return "rgb(72, 72, 212)";
        default:
            return "rgb(255, 255, 255)";
    }
}
