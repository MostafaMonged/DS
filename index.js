const express = require('express');
const app = express();
const ejs = require('ejs');

app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('layout', { pageTitle: 'Home' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

