const OpenAI = require('openai');
require('dotenv').config();
const express = require('express');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY_TEST;

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
            max_tokens: 10000,
        });

        const responseText = chatResponse.choices[0]?.message?.content || 'No response generated.';
        res.send({ response: responseText });
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).send({ error: 'Failed to fetch response from OpenAI API.' + error });
    }
});

router.post('/generate-content', async (req, res) => {
    const { title, content } = req.body;

    if (!content.trim()) {
        return res.status(400).send({ error: 'Content is required to rewrite.' });
    }

    try {
        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert content editor. Rewrite and improve the content while keeping it concise and relevant. Write without any introduction or "" at the beginning and end' },
                { role: 'user', content: `Rewrite the following content: "${content}"` },
            ],
            max_tokens: 10000,
        });

        const rewrittenContent = aiResponse.choices[0]?.message?.content?.trim();
        res.send({ content: rewrittenContent });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).send({ error: 'Failed to rewrite content.' });
    }
});

router.post('/rewrite-comment', async (req, res) => {
    const { comment } = req.body;

    if (!comment) {
        return res.status(400).send({ error: 'Comment content is required for rewriting.' });
    }

    try {
        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant who rewrites user comments clearly and concisely. Write without any introduction or "" at the beginning and end' },
                { role: 'user', content: `Rewrite this comment: "${comment}"` },
            ],
            max_tokens: 10000,
        });

        const rewrittenComment = aiResponse.choices[0].message.content.trim();
        res.send({ rewrittenComment });
    } catch (error) {
        console.error('Error rewriting comment:', error);
        res.status(500).send({ error: 'Failed to rewrite comment. Please try again later.' });
    }
});

module.exports = router;
