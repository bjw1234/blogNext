const express = require('express');
const cookies = require('cookies');
const User = require('../models/user');
const router = express.Router();

router.use((req, res, next) => {
    req.cookies = new cookies(req, res);
    next();
});

router.post('/login', (req, res) => {
    let key = req.body.key || '';
    if (!key) {
        res.redirect('/');
        return;
    }
    User.findOne({'username': 'admin'}).then(user => {
        if (user.password === key) {
            // 种cookie
            req.cookies.set("userInfo", JSON.stringify({
                _id: user._id,
                username: user.username,
                isAdmin: true
            }));
            // 重定向admin
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    }).catch(() => {
        res.redirect('/');
    });
});

module.exports = router;

