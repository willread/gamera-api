const express = require('express');
const fetch = require('isomorphic-unfetch');

// Configure router

const router = express.Router();

// Search for games

router.get('/', async (req, res) => {
    const query = req.query.query; // TODO: Sanitize query
    const url = `https://www.giantbomb.com/api/search?api_key=${process.env.GIANTBOMB_API_KEY}&format=json&resources=game&query=${query}&limit=5&field_list=id,name,image,platforms`;
    const results = await (await fetch(url)).json();
    res.status(200).json(results.results);
});

module.exports = router;