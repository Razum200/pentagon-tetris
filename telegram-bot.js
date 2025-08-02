// Серверная часть для Telegram бота (НЕ ДЛЯ ПУБЛИКАЦИИ!)
// Этот файл должен быть только на твоем сервере

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ВАЖНО: Токен должен быть в переменных окружения!
const BOT_TOKEN = process.env.BOT_TOKEN; // Твой токен сюда НЕ ВСТАВЛЯЙ!

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