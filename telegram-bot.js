// Серверная часть для Telegram бота
const express = require('express');
const path = require('path');
const config = require('./config');

const app = express();
const PORT = config.port;
const BOT_TOKEN = config.botToken;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Основная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Webhook для обработки данных от Telegram WebApp
app.post('/webhook', (req, res) => {
    console.log('Получены данные от WebApp:', req.body);
    
    // Здесь можно обработать результаты игры
    // Например, сохранить в базу данных или отправить в чат
    
    res.json({ status: 'ok' });
});

// Обработка данных игры
app.post('/game-result', (req, res) => {
    const { score, level, lines, difficulty, chaosMode } = req.body;
    
    console.log('Результат игры:', {
        score,
        level,
        lines,
        difficulty,
        chaosMode: chaosMode ? 'Да' : 'Нет'
    });
    
    // Здесь можно сохранить результат или отправить уведомление
    
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🎮 Пятиугольный Тетрис запущен на порту ${PORT}`);
    console.log(`📱 Откройте http://localhost:${PORT} для тестирования`);
});

// Экспорт для развертывания
module.exports = app;