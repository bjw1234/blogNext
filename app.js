const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const cookies = require('cookies');
// const User = require('./models/user');
const swig = require('swig');

const app = express();

app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');

// 取消缓存限制
// swig.setDefaults({
//     cache: false
// });
// app.set('view cache', false);

app.use(bodyParser.urlencoded({extended: true}));

// 静态文件托管
app.use('/public', express.static(__dirname + '/public'));

// 划分模块
app.use('/', require('./routers/main'));
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));

mongoose.connect('mongodb://localhost:27017/blog', (err) => {
    if (err) {
        console.log("database connecting error");
    } else {
        console.log("database connecting successful");
        app.listen(3000, (req, res, next) => {
            console.log('app is running at port 3000');
        });
    }
});


