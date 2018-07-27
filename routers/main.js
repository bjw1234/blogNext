const express = require('express');
// const User = require('../models/user');
const Article = require('../models/article');
const Photo = require('../models/photo');
const marked = require('marked');
const hljs = require('highlight.js');
const router = express.Router();

// 每页显示的条数
const limit = 5;

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
    data = {}; // 置空
    // 将信息整合之后存储
    data.category = req.query.category || '';// 当前文章的分类
    data.articles = [];  // 文章数组
    data.page = 1; // 当前页
    data.maxPage = 1; // 最大页
    data.url = '?category=';

    // 用户传过来了当前文章的分类
    if (data.category) {
        Article.find().then(articles => {
            if (articles && articles.length > 0) {
                let result = [];
                articles.forEach(art => {
                    let tags = art.children.map(child => child.category_name);
                    if (tags.includes(data.category)) {
                        if (art.description) {
                            art.description_html = marked(art.description);
                        }
                        result.push(art);
                    }
                });
                if (result.length <= 0) {
                    return Promise.reject('result.length<0');
                }
                let query_page = Number(req.query.page) || 1;
                query_page = Math.min(Math.ceil(result.length / limit), query_page);
                query_page = Math.max(query_page, 1);  // 限制最小为1

                let cur_page = query_page;  // 当前页
                let skip = (cur_page - 1) * limit; //忽略的条数
                // 做分页处理
                data.page = cur_page;
                data.articles = result.slice(skip, limit + skip);
                data.maxPage = Math.ceil(result.length / limit);
                res.render('main/index', {
                    title: data.category,
                    data: data
                });
            } else {
                return Promise.reject('no result');
            }
        }).catch(() => {
            noResult(res);
        });
    } else {
        // 文章数量查询
        Article.countDocuments().then((countDocuments) => {
            if (!countDocuments) {
                noResult(res);
                return;
            }
            let query_page = Number(req.query.page) || 1;
            query_page = Math.min(Math.ceil(countDocuments / limit), query_page);
            query_page = Math.max(query_page, 1);  // 限制最小为1
            let cur_page = query_page;  // 当前页
            let skip = (cur_page - 1) * limit; //忽略的条数
            // 文章查询
            return Article.find().sort({addTime: -1}).limit(limit)
                .skip(skip).then((articles) => {
                    data.articles = articles;
                    data.page = cur_page;
                    data.maxPage = Math.ceil(countDocuments / limit);
                });
        }).then(() => {
            if (data.articles.length > 0) {
                data.articles.forEach(art => {
                    if (art.description) {
                        art.description_html = marked(art.description);
                    }
                })
            }
            // 渲染页面
            res.render('main/index', {
                title: '博客首页',
                data: data
            });
        }).catch(() => {
            noResult(res);
        });
    }
});

/**
 * 用户访问某一篇文章
 */
router.get('/views', (req, res) => {
    data = {}; // 置空
    // 获取当前文章的id
    let id = req.query.article_id || '';

    // Article.findOne({
    //     _id: id
    // }).then(article => {
    //     // 如果该文章不存在
    //     if (!article) {
    //         res.render('main/views', {
    //             title: '文章详情',
    //             data: data
    //         });
    //         return Promise.reject('no result');
    //     }
    //     // 阅读量加一
    //     article.views++;
    //     article.save();
    //     data.article = article;
    //
    //     // 对内容进行markdown语法转换
    //     data.article_content_html = marked(article.content);
    //
    //     console.log('-----------findOne-------------');
    //     return Promise.resolve('ok');
    // }).then(() => {
    //     // 找上一条和下一条数据
    //     return Article.find({'_id': {'$gt': id}}).sort({_id: 1}).limit(1).then(result => {
    //         data.prev = null;
    //         if (result.length >= 0) {
    //             data.prev = result[0];
    //         }
    //         console.log('-----------prev-------------');
    //     });
    // }).then(() => {
    //     Article.find({'_id': {'$lt': id}}).sort({_id: -1}).limit(1).then(result => {
    //         data.next = null;
    //         if (result.length >= 0) {
    //             data.next = result[0];
    //         }
    //         console.log('-----------next-------------');
    //     });
    //     res.render('main/views', {
    //         title: '文章详情',
    //         data: data
    //     });
    // }).catch((err) => {
    //     console.log(err);
    //     res.render('main/views', {
    //         title: '文章详情',
    //         data: data
    //     });
    // });
    let findOne = function () {
        return Article.findOne({_id: id}).then(article => {
            // 如果该文章不存在
            if (!article) {
                return Promise.reject('no result');
            }
            // 阅读量加一
            article.views++;
            article.save();
            data.article = article;

            // 对内容进行markdown语法转换
            data.article_content_html = marked(article.content);
        });
    };

    let prev = function () {
        return Article.find({'_id': {'$gt': id}}).sort({_id: 1}).limit(1).then(result => {
            data.prev = null;
            if (result.length >= 0) {
                data.prev = result[0];
            }
        });
    };

    let next = function () {
        return Article.find({'_id': {'$lt': id}}).sort({_id: -1}).limit(1).then(result => {
            data.next = null;
            if (result.length >= 0) {
                data.next = result[0];
            }
        });
    };

    Promise.all([findOne(), prev(), next()]).then(() => {
        res.render('main/views', {
            title: '文章详情',
            data: data
        });
    }).catch(() => {
        res.render('main/views', {
            title: '文章详情',
            data: null
        });
    });
});

/**
 * 用户访问所有的标签
 */
router.get('/tags', (req, res) => {
    let tags = [];
    Article.find().then(articles => {
        if (articles && articles.length > 0) {
            articles.forEach(art => {
                tags = tags.concat(art.children.map(child => child.category_name));
            });
            let result = [...new Set(tags)];
            res.render('main/tags', {
                title: '标签',
                tags: result
            });
        } else {
            res.render('main/index', {
                title: '还没有标签',
                tags: null
            });
        }
    });
});

/**
 * 没有数据
 * @param res
 */
function noResult(res) {
    res.render('main/index', {
        title: '没有文章',
        data: null
    });
}

/**
 * 用户访问相册
 */
router.get('/photos', (req, res) => {
    data = {};
    Photo.find().then(results => {
        results.forEach(item => {
            if (item && item.photos) {
                item.content_html = marked(item.photos);
            }
        });
        data.photos = results;
        res.render('main/photos', {
            title: '相册',
            data: data
        });
    });
});

/**
 * 用户访问
 */
router.get('/about', (req, res) => {
    res.render('main/about', {
        title: '关于我'
    });
});

module.exports = router;
