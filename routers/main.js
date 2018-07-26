const express = require('express');
const User = require('../models/user');
const Article = require('../models/article');
const Category = require('../models/category');
const marked = require('marked');
const hljs = require('highlight.js');
let router = express.Router();

// marked相关配置
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
        return hljs.highlightAuto(code).value;
    }
});

router.use((req, res, next) => {
    req.userInfo = {
        _id: '5a9bf12f7d52c81dd883a959',
        username: 'hello'
    };
    next();
});


// 需要传递给前端的数据
let data = {};

/**
 * 用户访问首页或其他分类页时
 */
router.get('/', (req, res) => {

    // 将信息整合之后存储
    data.category = req.query.category || '';// 当前文章的分类
    data.articles = [];  // 文章数组
    data.page = 1; // 当前页
    data.maxPage = 1; // 最大页
    data.url = '/';

    // 对查询文章的条件进行限制
    let where = {};
    if (data.category) { // 用户传过来了当前文章的分类
        where.category = data.category;
    }

    // 文章数量查询
    Article.countDocuments().then((countDocuments) => {

        let limit = 5; // 每页显示的条数

        // 接收传过来的page
        let query_page = Number(req.query.page) || 1;
        // 限制最大值 countDocuments/limit向上取整
        query_page = Math.min(Math.ceil(countDocuments / limit), query_page);
        query_page = Math.max(query_page, 1);  // 限制最小为1

        let cur_page = query_page;  // 当前页
        let skip = (cur_page - 1) * limit; //忽略的条数

        // 文章查询
        return Article.find().sort({addTime: -1}).limit(limit)
            .skip(skip).populate(['user']).then((articles) => {

                data.articles = articles;
                data.page = cur_page;
                data.maxPage = Math.ceil(countDocuments / limit);
            });
    }).then(() => {
        // 渲染页面
        res.render('main/index', {
            title: '博客首页',
            data: data
        });
    }).catch((err) => {
        console.log(err);
    });
});

/**
 * 用户访问某一篇文章
 */
router.get('/views', (req, res) => {
    // 获取当前文章的id
    let id = req.query.article_id || '';

    Article.findOne({
        _id: id
    }).populate(['user']).then(article => {

        // 如果该文章不存在
        if (!article) {
            res.render('main/views', {
                title: '文章详情',
                data: data
            });
            return;
        }

        // 阅读量加一
        article.views++;
        article.save();

        data.article = article;

        // 对内容进行markdown语法转换
        data.article_content_html = marked(article.content);

        res.render('main/views', {
            title: '文章详情',
            data: data
        });
    });
});

module.exports = router;
