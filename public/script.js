const socket = io();
const onlineCountEl = document.getElementById('onlineCount');

socket.on('onlineCount', (count) => {
    onlineCountEl.textContent = count;
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const selWidth = document.getElementById('selWidth');
const selColor = document.getElementById('selColor');
const sendBtn = document.getElementById('send');

// white background so toDataURL() doesn't export a transparent PNG
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let drawing = false;
let lastX = 0;
let lastY = 0;

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.strokeStyle = selColor.value;
    ctx.lineWidth = parseInt(selWidth.value, 10);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
}

function stopDraw() {
    drawing = false;
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDraw);

function clearArea() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// --- This is the part you actually asked about ---
// On click: export the canvas to a base64 PNG and AJAX (fetch) it to the
// server. The server then broadcasts it over socket.io to wall.html.
sendBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');

    sendBtn.disabled = true;
    sendBtn.textContent = 'Mengirim...';

    fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataURL })
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.ok) {
                clearArea();
            } else {
                alert('Gagal mengirim gambar: ' + (data.error || 'unknown error'));
            }
        })
        .catch((err) => {
            console.error(err);
            alert('Gagal mengirim gambar.');
        })
        .finally(() => {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Kirim';
        });
});