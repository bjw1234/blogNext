$(document).ready(function () {

    var base64 = new Base64();

    // 设置样式
    $('#bjw-previous').css({
        "height": "815px",
        "padding": "10px",
        "overflow": "auto",
        "border-radius": "5px",
        "border": "2px solid gainsboro"
    });

    // marked相关配置
    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        highlight: function (code) {
            return hljs.highlightAuto(code).value;
        }
    });

    // MarkDown语法解析内容预览
    $('#bjw-content').on('keyup blur', function () {
        $('#bjw-previous').html(marked($('#bjw-content').val()));
    });

    // 使文本域支持tab缩进
    $('#bjw-content').on('keydown', function (e) {
        if (e.keyCode === 9) {
            var position = this.selectionStart + 2;
            this.value = this.value.substr(0, this.selectionStart) + '  ' + this.value.substr(this.selectionStart);
            this.selectionStart = position;
            this.selectionEnd = position;
            this.focus();
            e.preventDefault();
        }
    });

    // 用 Ctrl + B 实现内容全选
    $('#bjw-content').on('keydown', function (e) {
        if (e.ctrlKey && e.keyCode === 66) {
            this.selectionStart = 0;
            this.selectionEnd = this.value.length;
        }
    });


    /**
     * 用户添加图片
     * @type {jQuery|HTMLElement}
     */
    var formPhotosAdd = $('#form-photos-add');
    $('#photos-add').click(function () {
        $.ajax({
            type: 'POST',
            url: '/admin/photos/add',
            data: {
                time: formPhotosAdd.find('[name="time"]').val(),
                topic: formPhotosAdd.find('[name="topic"]').val(),
                photos: formPhotosAdd.find('[name="photos"]').val()
            },
            success: function (response) {
                if (!response.code) {
                    showDialog(response.message, 1, function () {
                        window.location.href = "/admin/photos";
                    });
                } else {
                    showDialog(response.message, 2);
                }
            }
        });
    });

    /**
     * 用户修改图片
     */
    /**
     * 用户添加图片
     * @type {jQuery|HTMLElement}
     */
    var formPhotosEdit = $('#form-photos-edit');
    $('#photos-edit').click(function () {
        $.ajax({
            type: 'POST',
            url: '/admin/photos/edit',
            data: {
                id: formPhotosEdit.find('[name="id"]').val(),
                time: formPhotosEdit.find('[name="time"]').val(),
                topic: formPhotosEdit.find('[name="topic"]').val(),
                photos: formPhotosEdit.find('[name="photos"]').val()
            },
            success: function (response) {
                if (!response.code) {
                    showDialog(response.message, 1, function () {
                        window.location.href = "/admin/photos";
                    });
                } else {
                    showDialog(response.message, 2);
                }
            }
        });
    });

    /**
     * 管理员对文章
     * 添加
     * 修改
     * 的操作
     * **********************************************
     **/
        // 文章内容添加
    var formArticleAdd = $('#form-article-add');
    $('#article-add').click(function () {
        console.log('action="/admin/article/add"');
        $.ajax({
            type: 'POST',
            url: '/admin/article/add',
            data: {
                title: formArticleAdd.find('[name="title"]').val(),
                time: formArticleAdd.find('[name="time"]').val(),
                category: formArticleAdd.find('[name="category"]').val(),
                description: formArticleAdd.find('[name="description"]').val(),
                content: base64.encode(formArticleAdd.find('[name="content"]').val())
            },
            success: function (response) {
                if (!response.code) {
                    showDialog(response.message, 1, function () {
                        window.location.href = "/admin/article";
                    });
                } else {
                    showDialog(response.message, 2);
                }
            }
        });
    });

    // 文章内容编辑
    var formArticleEdit = $('#form-article-edit');
    $('#article-edit').click(function () {
        $.ajax({
            type: 'POST',
            url: '/admin/article/edit',
            data: {
                id: formArticleEdit.find('[name="id"]').val(),
                title: formArticleEdit.find('[name="title"]').val(),
                time: formArticleEdit.find('[name="time"]').val(),
                category: formArticleEdit.find('[name="category"]').val(),
                description: formArticleEdit.find('[name="description"]').val(),
                content: base64.encode(formArticleEdit.find('[name="content"]').val())
            },
            success: function (response) {
                if (!response.code) {
                    showDialog(response.message, 1, function () {
                        window.location.href = "/admin/article";
                    });
                } else {
                    showDialog(response.message, 2);
                }
            }
        });
    });
});

// 当登录错误显示弹框
function showDialog(text, icon, callback) {
    layer.open({
        time: 1500,
        anim: 4,
        offset: 't',
        icon: icon,
        content: text,
        btn: false,
        title: false,
        closeBtn: 0,
        end: function () {
            callback && callback();
        }
    });
}

