const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Allow fairly large JSON bodies since canvas images are base64 strings
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let onlineCount = 0;

io.on('connection', (socket) => {
    onlineCount++;
    io.emit('onlineCount', onlineCount);

    socket.on('disconnect', () => {
        onlineCount--;
        io.emit('onlineCount', onlineCount);
    });
});

// This is the AJAX endpoint index.html's "Kirim" button posts to.
// It does NOT render anything itself - it just relays the drawing
// to every connected socket (including any open wall.html tabs).
app.post('/api/draw', (req, res) => {
    const { image } = req.body;

    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
        return res.status(400).json({ ok: false, error: 'Invalid image data' });
    }

    io.emit('newDrawing', {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        image,
        sentAt: Date.now()
    });

    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Draw page:  http://localhost:${PORT}/index.html`);
    console.log(`Wall page:  http://localhost:${PORT}/wall.html`);
});