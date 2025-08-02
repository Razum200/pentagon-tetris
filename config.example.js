// Пример конфигурации
// Скопируйте этот файл в config.js и заполните своими данными

module.exports = {
    // Токен Telegram бота (НЕ ПУБЛИКУЙТЕ!)
    botToken: process.env.BOT_TOKEN || 'ВАШ_ТОКЕН_ЗДЕСЬ',
    
    // URL вашего приложения
    appUrl: process.env.APP_URL || 'https://your-domain.com',
    
    // Порт сервера
    port: process.env.PORT || 3000,
    
    // Настройки игры
    gameSettings: {
        maxScore: 999999,
        enableChaosMode: true,
        enableMobileControls: true
    }
};