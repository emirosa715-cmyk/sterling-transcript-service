const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/transcript', async (req, res) => {
  const data = {
    studentName: 'Jai Leonardelli',
    years: '2026–2030',
    registrar: 'Dulcita Bare'
  };

  const html = await new Promise((resolve, reject) => {
    app.render('transcript', data, (err, rendered) => {
      if (err) reject(err);
      else resolve(rendered);
    });
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'Letter' });
  await browser.close();

  res.contentType('application/pdf');
  res.send(pdf);
});

app.listen(3000, () => {
  console.log('Transcript service running on port 3000');
});
