const express = require('express');
const User = require('../models/user');
const Article = require('../models/article');
const cookies = require('cookies');
const Photo = require('../models/photo');
const router = express.Router();

router.use((req, res, next) => {
    try {
        req.cookies = new cookies(req, res);
        req.userInfo = JSON.parse(req.cookies.get('userInfo'));
        if (!(req.userInfo && req.userInfo.isAdmin)) {
            res.send("<h2>只有管理员才能进入后台管理！</h2>");
            return;
        }
        next();
    } catch (e) {
        next();
    }
});

router.use((req, res, next) => {
    req.userInfo = {
        _id: '5a9bf12f7d52c81dd883a959',
        username: 'hello'
    };
    next();
});


/**
 * 访问后台管理页面
 */
router.get('/', (req, res) => {

    // 渲染页面
    res.render('admin/index', {
        userInfo: req.userInfo
    });

});

/**
 * 相册首页
 */
router.get('/photos', (req, res) => {

    Photo.countDocuments().then(counts => {
        if (!counts) {
            return Promise.reject('no photos');
        }
        let limits = 10;
        let page = Number(req.query.page) || 1;
        page = Math.max(1, Math.min(Math.ceil(counts / limits), page));
        let skip = (page - 1) * limits;

        Photo.find().skip(skip).limit(limits).then(result => {
            res.render('admin/photos', {
                userInfo: req.userInfo,
                photos: result,
                page: page,
                maxPage: Math.ceil(counts / limits),
                url: '/admin/photos'
            });
        });
    }).catch(() => {
        res.render('admin/photos', {
            userInfo: req.userInfo,
            url: '/admin/photos'
        });
    });
});

/**
 * 添加图片页面
 */
router.get('/photos/add', (req, res) => {
    res.render('admin/photos_add', {
        userInfo: req.userInfo
    });
});

/**
 * 添加图片的操作
 */
router.post('/photos/add', (req, res) => {
    let time = req.body.time || '';
    let topic = req.body.topic || '';
    let photos = req.body.photos || '';

    // 定义返回数据的格式
    let responseData = {
        code: 0,
        message: ''
    };

    if (!(time && topic && photos)) {
        responseData.message = '时间、主题或内容为空';
        responseData.code = 88;
        res.json(responseData);
        return;
    }

    new Photo({
        time: time,
        topic: topic,
        photos: photos
    }).save().then(() => {
        responseData.message = '图片添加成功！';
        res.json(responseData);
    });

});

/**
 * 删除图片操作
 */
router.get('/photos/delete', (req, res) => {
    let id = req.query.id || '';
    Photo.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '图片删除成功!',
            url: '/admin/photos'
        });
    });
});

/**
 * 修改图片页
 */
router.get('/photos/edit', (req, res) => {
    // 定义返回数据的格式
    let responseData = {
        code: 0,
        message: ''
    };

    let id = req.query.id || '';
    if (!id) {
        responseData.code = 33;
        responseData.message = '图片ID不存在!';
        res.json(responseData);
        return;
    }

    Photo.findOne({
        _id: id
    }).then(result => {
        if (!result) {
            responseData.code = 33;
            responseData.message = '图片不存在!';
            res.json(responseData);
            return;
        }
        res.render('admin/photos_edit', {
            userInfo: req.userInfo,
            photo: result,
            url: '/admin/photos'
        });
    });
});

/**
 * 提交图片修改
 */
router.post('/photos/edit', (req, res) => {
    let id = req.body.id || '';
    let time = req.body.time || '';
    let topic = req.body.topic || '';
    let photos = req.body.photos || '';

    // 定义返回数据的格式
    let responseData = {
        code: 0,
        message: ''
    };
    if (!id) {
        responseData.message = '修改错误';
        responseData.code = 89;
        res.json(responseData);
        return;
    }
    if (!(time && topic && photos)) {
        responseData.message = '时间、主题或内容为空';
        responseData.code = 88;
        res.json(responseData);
        return;
    }
    Photo.update({_id: id}, {
        time: time,
        topic: topic,
        photos: photos
    }).then(() => {
        responseData.message = '图片修改成功!';
        res.json(responseData);
    }).catch((err) => {
        responseData.message = '数据库读写错误';
        responseData.code = 89;
        res.json(responseData);
    });
});

/**
 * 用户管理
 */
router.get('/user', (req, res) => {

    // 获取请求的page并做限制
    User.countDocuments().then((countDocuments) => {

        let limit = 10; // 每页显示的条数

        // 接收传过来的page
        let query_page = Number(req.query.page) || 1;
        // 限制最大值 countDocuments/limit向上取整
        query_page = Math.min(Math.ceil(countDocuments / limit), query_page);
        query_page = Math.max(query_page, 1);  // 限制最小为1

        let cur_page = query_page;  // 当前页
        let skip = (cur_page - 1) * limit; //忽略的条数

        User.find().limit(limit).skip(skip).then((users) => {
            // 渲染页面
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: cur_page,
                maxPage: Math.ceil(countDocuments / limit),
                url: '/admin/user'
            });
        });
    });
});

/**
 * 文章管理首页
 */
router.get('/article', (req, res) => {
    Article.countDocuments().then((countDocuments) => {

        let limit = 5; // 每页显示的条数

        // 接收传过来的page
        let query_page = Number(req.query.page) || 1;
        // 限制最大值 countDocuments/limit向上取整
        query_page = Math.min(Math.ceil(countDocuments / limit), query_page);
        query_page = Math.max(query_page, 1);  // 限制最小为1

        let cur_page = query_page;  // 当前页
        let skip = (cur_page - 1) * limit; //忽略的条数

        Article.find().sort({_id: -1}).limit(limit)
            .skip(skip).populate(['user']).then((articles) => {

            // 给文章设置分类标签
            articles.forEach((item, index) => {
                if (item.children.length > 0) {
                    articles[index].category = (item.children.map(cat => {
                        return cat.category_name;
                    })).join(' ');
                } else {
                    articles[index].category = '';
                }
            });

            res.render('admin/article_index', {
                userInfo: req.userInfo,
                articles: articles,
                page: cur_page,
                maxPage: Math.ceil(countDocuments / limit),
                url: '/admin/article'
            });
        });
    }).catch((err) => {
        console.log(err);
    });
});

/**
 * 文章添加页面
 */
router.get('/article/add', (req, res) => {

    res.render('admin/article_add', {
        userInfo: req.userInfo
    });

});

/**
 * 文章添加操作
 */
router.post('/article/add', (req, res) => {

    // 定义返回数据的格式
    let responseData = {
        code: 0,
        message: ''
    };

    // 非空判断
    let title = req.body.title || '';
    let category = req.body.category || '';
    let description = req.body.description || '';
    let content = req.body.content || '';
    let time = req.body.time || '';

    console.log('时间为：' + time);

    if (title === '' || description === '' || content === '') {
        responseData.code = 22;
        responseData.message = "标题、简介或内容为空!";
        res.json(responseData);
        return;
    }
    // 标题不能重复
    Article.findOne({
        title: title
    }).then((article) => {
        if (article) {  // 该标题已经存在
            responseData.code = 33;
            responseData.message = "该文章标题已经存在!";
            res.json(responseData);
            return Promise.reject("标题存在");
        } else {
            // 分类数据
            let categoryArr = category.split(' ').map(item => {
                return {category_name: item}
            });

            // 将用户提交的数据加入数据库
            return new Article({
                title: title,
                user: req.userInfo._id.toString(),
                addTime: new Date(),
                userTime: time,
                children: categoryArr,
                description: description,
                content: new Buffer(content, 'base64').toString()
            }).save();
        }
    }).then(() => {

        // 添加成功
        // res.render('admin/success', {
        //     userInfo: req.userInfo,
        //     message: '文章添加成功!',
        //     url: '/admin/article'
        // });
        responseData.message = "文章添加成功！";
        res.json(responseData);
    }).catch(err => {
        console.log(err);
    });
});

/**
 * 文章的删除操作
 */
router.get('/article/delete', (req, res) => {
    let id = req.query.id || '';
    Article.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '文章删除成功!',
            url: '/admin/article'
        });
    });
});

/**
 * 文章的修改页面
 */
router.get('/article/edit', (req, res) => {
    let id = req.query.id;
    Article.findOne({
        _id: id
    }).then(article => {
        if (!article) {   // 想要修改的内容不存在
            res.render('admin/fail', {
                userInfo: req.userInfo,
                message: '想要修改的内容不存在!'
            });
        } else {
            article.category = (article.children.map(cat => {
                return cat.category_name;
            })).join(' ');
            // 打开修改页面,渲染数据
            res.render('admin/article_edit', {
                userInfo: req.userInfo,
                article: article,
                url: '/admin/article'
            });
        }
    });
});

/**
 * 文章修改信息提交
 */
router.post('/article/edit', (req, res) => {

    // 定义返回数据的格式
    let responseData = {
        code: 0,
        message: ''
    };

    let id = req.body.id;

    // 非空判断
    let title = req.body.title || '';
    let category = req.body.category || '';
    let description = req.body.description || '';
    let content = req.body.content || '';
    let time = req.body.time || '';

    if (title === '' || description === '' || content === '') {
        responseData.code = 66;
        responseData.message = '标题、简介或内容为空!';
        res.json(responseData);
        return;
    }

    Article.findOne({
        _id: id
    }).then(article => {
        if (!article) {
            responseData.code = 77;
            responseData.message = '修改出错!';
            res.json(responseData);
            return Promise.reject('修改出错');
        }

        // 分类数据
        let categoryArr = category.split(' ').map(item => {
            return {category_name: item}
        });

        // 修改这条数据
        return Article.update({_id: id}, {
            title: title,
            userTime: time,
            children: categoryArr,
            description: description,
            content: new Buffer(content, 'base64').toString()
        });
    }).then(() => {
        // 修改成功
        // res.render('admin/success', {
        //     userInfo: req.userInfo,
        //     message: '文章内容修改成功!',
        //     url: '/admin/article'
        // });
        responseData.message = '文章内容修改成功!';
        res.json(responseData);
    });
});

module.exports = router;