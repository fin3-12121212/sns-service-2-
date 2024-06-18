const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).send({ message: 'Query is required' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        key: process.env.YOUTUBE_API_KEY,
        maxResults: 5
      }
    });

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      description: item.snippet.description,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
