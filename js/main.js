// content-wrapper
var content = document.getElementById('id-content');
// side-menu
var sideMenu = document.getElementById('id-sideMenu');
// article-wrapper
var article = document.getElementById('id-article');
// menu-icon
var menuIcon = document.getElementById('id-menuIcon');
// top-bar
var topBar = document.getElementById('id-topBar');
var topTxt = document.getElementById('id-topTxt');
// back-top
var backTop = document.getElementById('id-backTop');
// mask
var mask = document.getElementById('id-mask');

var doc = document.documentElement || document.body;
var winH = window.innerHeight; // 页面高度

var mediaMark = 800; // 媒体查询基准值

window.addEventListener('scroll', function () {
    var scrollTop = doc.scrollTop;
    var top = article.offsetTop;
    if (scrollTop > top) {
        // 显示topBar
        topBar.classList.add('opacity_1');
        topTxt.classList.add('txt-show');
    } else {
        topBar.classList.remove('opacity_1');
        topTxt.classList.remove('txt-show');
    }
    if (scrollTop > winH) {
        backTop.classList.add('show');
    } else {
        backTop.classList.remove('show');
    }
});

var mobileMenuIsShow = false;

// 切换菜单
menuIcon.addEventListener('click', function () {
    var winW = window.innerWidth; // 页面宽度
    // 是否为移动端
    if (winW < mediaMark) {
        console.log('mobile...');
        if (mobileMenuIsShow) {
            sideMenu.classList.remove('show');
            mask.classList.remove('show');
            mobileMenuIsShow = false;
        } else {
            sideMenu.classList.add('show');
            mask.classList.add('show');
            mobileMenuIsShow = true;
        }
        return;
    }

    content.classList.toggle('hidden');
    sideMenu.classList.toggle('hidden');
    topBar.classList.toggle('hidden');
});

mask.addEventListener('click', function () {
    sideMenu.classList.remove('show');
    mask.classList.remove('show');
    mobileMenuIsShow = false;
});


// 返回顶部
backTop.addEventListener('click', function () {
    smoothScroll();
});

function smoothScroll() {
    var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
    if (currentScroll > 0) {
        window.requestAnimationFrame(smoothScroll);
        // 每次滚动到总高度的5/4处
        window.scrollTo(0, currentScroll - (currentScroll / 5));
    }
}

