// Конфигурация для Telegram бота
const config = {
    // Токен твоего Telegram бота
    botToken: '7365400892:AAHSg0gJ1WgB1Fo4XGd5vQed0L138pgJtN0',
    
    // URL приложения (обнови после деплоя)
    appUrl: 'https://your-username.github.io/pentagon-tetris',
    
    // Порт для локального сервера
    port: 3000,
    
    // Настройки игры
    gameSettings: {
        maxScore: 999999,
        enableChaosMode: true,
        enableMobileControls: true
    }
};

module.exports = config;