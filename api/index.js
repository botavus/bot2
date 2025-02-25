require('dotenv').config();
const axios = require('axios');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

async function generateContent() {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Напиши интересный пост для Telegram-канала." }],
                max_tokens: 500,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Ошибка при запросе к GPT:', error);
        return null;
    }
}

async function publishToTelegram(content) {
    try {
        await bot.telegram.sendMessage(process.env.TELEGRAM_CHANNEL_ID, content);
        console.log('Контент успешно опубликован в Telegram.');
    } catch (error) {
        console.error('Ошибка при публикации в Telegram:', error);
    }
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const content = await generateContent();
        if (content) {
            await publishToTelegram(content);
            res.status(200).json({ message: 'Контент опубликован в Telegram.' });
        } else {
            res.status(500).json({ error: 'Ошибка при генерации контента.' });
        }
    } else {
        res.status(405).json({ error: 'Метод не разрешен.' });
    }
};