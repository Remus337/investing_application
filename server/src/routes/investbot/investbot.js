const OpenAI = require('openai');
require('dotenv').config();
const express = require('express');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).send({ error: 'Question is required.' });
    }

    try {
        const chatResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an investing expert chatbot. Answer questions with clarity and relevance to investing.',
                },
                { role: 'user', content: question },
            ],
            max_tokens: 1000,
        });

        const responseText = chatResponse.choices[0]?.message?.content || 'No response generated.';
        res.send({ response: responseText });
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).send({ error: 'Failed to fetch response from OpenAI API.' + error });
    }
});

module.exports = router;
