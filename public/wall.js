const socket = io();
const wall = document.getElementById('wall');
const emptyMsg = document.getElementById('empty');
const items = [];
const ITEM_SIZE = 130;
const LIFETIME_MS = 90000; // remove a drawing after 90s so the wall doesn't fill up

socket.on('newDrawing', (data) => {
    addFloatingItem(data.image);
});

function addFloatingItem(src) {
    emptyMsg.style.display = 'none';

    const el = document.createElement('div');
    el.className = 'floatItem';

    const img = document.createElement('img');
    img.src = src;
    el.appendChild(img);
    wall.appendChild(el);

    requestAnimationFrame(() => el.classList.add('visible'));

    const item = {
        el,
        x: Math.random() * Math.max(1, window.innerWidth - ITEM_SIZE),
        y: Math.random() * Math.max(1, window.innerHeight - ITEM_SIZE),
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 0.5
    };

    // give it a minimum speed so nothing sits dead still
    if (Math.abs(item.vx) < 0.4) item.vx = item.vx < 0 ? -0.4 : 0.4;
    if (Math.abs(item.vy) < 0.4) item.vy = item.vy < 0 ? -0.4 : 0.4;

    items.push(item);

    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => {
            const idx = items.indexOf(item);
            if (idx !== -1) items.splice(idx, 1);
            el.remove();
            if (items.length === 0) emptyMsg.style.display = 'block';
        }, 600);
    }, LIFETIME_MS);
}

function tick() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const item of items) {
        item.x += item.vx;
        item.y += item.vy;
        item.rot += item.vr;

        if (item.x <= 0) { item.x = 0; item.vx = Math.abs(item.vx); }
        if (item.x >= w - ITEM_SIZE) { item.x = w - ITEM_SIZE; item.vx = -Math.abs(item.vx); }
        if (item.y <= 0) { item.y = 0; item.vy = Math.abs(item.vy); }
        if (item.y >= h - ITEM_SIZE) { item.y = h - ITEM_SIZE; item.vy = -Math.abs(item.vy); }

        item.el.style.transform =
            `translate(${item.x}px, ${item.y}px) rotate(${item.rot}deg)`;
    }
    requestAnimationFrame(tick);
}

tick();