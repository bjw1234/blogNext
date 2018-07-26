const mongoose = require('mongoose');
const Category = require('./categorySch');

module.exports = new mongoose.Schema({
    // 关联字段
    children: [
        Category
    ],
    // 作者
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // 用户自定义时间
    userTime: {
        type: String,
        default: ''
    },
    // 添加时间
    addTime: {
        type: Date,
        default: new Date()
    },
    // 阅读量
    views: {
        type: Number,
        default: 0
    },
    // 标题
    title: String,
    // 简介
    description: {
        type: String,
        default: ''
    },
    // 内容
    content: {
        type: String,
        default: ''
    }
});