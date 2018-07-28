# start

`example` 项目中的前端静态代码都在这个文件夹中，可以直接在本地双击打开。

# node app.js

如果本地有MongoDB数据库运行在27017端口，可以`node app.js`运行起此项目。

```js
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
```

