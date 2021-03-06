const express = require('express');
const mongoose = require('mongoose').set('debug', true);

const { Game, ListGame } = require('./schemas');
const giantbomb = require('./giantbomb');

// Configure router

const router = express.Router();

// Convert CDN paths

const cdnImage = url => url.replace(/giantbomb1\.cbsistatic\.com/g, 'cdn-images.gamera.org');

// Search for games

router.get('/', async (req, res) => {
    const query = req.query.query; // TODO: Sanitize query
    const results = (await giantbomb.query('search', {
        resources: 'game',
        query,
        limit: 5,
        field_list: 'id,name,image,platforms'
    }));
    const games = [];

    results.forEach(result => {
        if (result.platforms) {
            result.platforms.forEach(platform => {
                games.push({
                    id: result.id,
                    name: result.name,
                    images: {
                        icon: cdnImage(result.image.icon_url),
                        original: cdnImage(result.image.original_url),
                        thumbnail: cdnImage(result.image.thumb_url)
                    },
                    platform: platform.abbreviation
                });
            });
        }
    });

    res.status(200).json(games);
});

// Get most popular games

router.get('/popular', async (req, res) => {
    try {
        const games = await ListGame
            .aggregate([
                { $group: { _id: '$game', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 11 },
                { $lookup: { from: 'games', localField: '_id', foreignField: '_id', as: 'game'} },
                { $unwind: '$game' },
                { $project: { _id: 0, game: true, count: true } }
            ]);

        res.status(200).json(games);
    } catch(e) {
        res.status(500).json({  message: 'An unexpected error occured', error: e });
    }
});

module.exports = {
    router,
    cdnImage
 };
