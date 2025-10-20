const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { videoUrl: null, audioUrl: null, error: null });
});

app.post('/download', async (req, res) => {
  const { link } = req.body;

  try {
    const response = await axios.get('https://tikwm.com/api/', {
      params: { url: link }
    });

    const videoUrl = response.data?.data?.play;
    const audioUrl = response.data?.data?.music;

    if (!videoUrl || !audioUrl) {
      return res.render('index', {
        videoUrl: null,
        audioUrl: null,
        error: 'Video atau audio tidak ditemukan atau API error'
      });
    }

    res.render('index', {
      videoUrl,
      audioUrl,
      error: null
    });

  } catch (err) {
    console.log(err.message);
    res.render('index', {
      videoUrl: null,
      audioUrl: null,
      error: 'Gagal mengambil video/audio.'
    });
  }
});

app.get('/download-file', async (req, res) => {
  const { url, filename } = req.query;

  if (!url || !filename) {
    return res.status(400).send('Parameter url dan filename wajib diisi');
  }

  try {
    const response = await axios.get(url, { responseType: 'stream' });

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers['content-type']);

    response.data.pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Gagal mengunduh file');
  }
});




app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

