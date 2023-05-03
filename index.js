const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');

app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('layout', { pageTitle: 'Home' });
});
app.get('/signup', (req, res) => {
    res.render('signup', { pageTitle: 'SignUp' });
});
app.get('/login', (req, res) => {
    res.render('login', { pageTitle: 'Login' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

