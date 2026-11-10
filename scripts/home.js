/* Rotating randomized store image sets on the home page. */
(() => {
    const preview = document.querySelector("[data-store-preview]");
    if (!preview) return;

    const items = window.MokioStoreGrid.homeItems()
        .filter((item) => item.image || item.icon);
    if (!items.length) return;

    const randomSet = () => {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled.slice(0, 4);
    };

    const render = () => {
        preview.replaceChildren(...randomSet().map((item) => {
            const cell = document.createElement("span");
            cell.className = "tile-image-cell";
            if (item.image) {
                const image = document.createElement("img");
                image.src = window.Mokio.url(item.image);
                image.alt = "";
                cell.append(image);
            } else {
                cell.textContent = item.icon;
            }
            return cell;
        }));
    };

    render();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.setInterval(render, 2400);
    }
})();
