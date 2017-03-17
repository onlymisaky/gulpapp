const gulp = require("gulp");
const concat = require("gulp-concat"); // 合并文件
const uglify = require("gulp-uglify"); // 压缩js
const sass = require("gulp-sass"); // sass转css
const cssnano = require("gulp-cssnano"); // 压缩css
const htmlmin = require("gulp-htmlmin"); // 压缩html
const imagemin = require('gulp-imagemin'); // 压缩图片
const cache = require('gulp-cache'); // 缓存
const rename = require("gulp-rename"); // 重命名
const flatten = require('gulp-flatten'); // 移动文件，去掉层级目录
const del = require("del"); // 删除文件        
const browserSync = require('browser-sync').create(); // 及时刷新，浏览器同步
const proxyMiddleware = require('http-proxy-middleware'); //反向代理   
const api = "http://www.api.com";
/**
 * 配置代理
 * /ajax ==> 代理路径
 * target ==> 真实url
 * changeOrigin ==> 
 * pathRewrite ==>
 */
const proxy = proxyMiddleware("/ajax", {
    target: api,
    changeOrigin: true,
    pathRewrite: {
        '^/ajax': ''
    },
    header: {
        // 设置请求头
    }
});

const paths = {
    dist: {
        root: "dist",
        assets: "dist/assets",
        css: "dist/assets/css",
        fonts: "dist/assets/fonts",
        images: "dist/assets/images",
        js: "dist/assets/js",
        lib: "dist/lib",
        views: "dist/views"
    },
    src: {
        root: "src",
        app: "src/app",
        fonts: "src/fonts",
        images: "src/images",
        js: "src/js",
        sass: "src/sass"
    },
    bower: "bower_components"
}

/**
 * 将bower下载的资源复制到 ./dist/assets/js/lib 目录
 */
gulp.task("build:lib", function () {
    return gulp
        .src(paths.bower + "/**/*")
        .pipe(gulp.dest(paths.dist.lib));
});

/**
 * 合并js、添加MD5、 压缩js、重命名为.min.js、 添加MD5
 */
gulp.task("build:js", function () {
    return gulp
        .src([
            paths.src.js + "/*.module.js",
            paths.src.js + "/*.router.js",
            paths.src.js + "/*.controller.js",

            paths.src.app + "/services/*.service.js",
            paths.src.app + "/filters/*.filter.js",
            paths.src.app + "/directives/**/*.directive.js",
            paths.src.app + "/directives/**/*.components.js",

            paths.src.app + "/views/**/*.controller.js",
            paths.src.app + "/views/**/*.router.js"
        ])
        .pipe(concat("app.js"))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(paths.dist.js));
});

/**
 * 合并sass、转换为css、添加MD5、压缩css、重命名为.min.css、 添加MD5
 */
gulp.task("build:css", function () {
    return gulp
        .src([
            paths.src.sass + "/*.sass"
        ])
        .pipe(concat("style.css"))
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(cssnano())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(paths.dist.css));
});

/**
 * 移动fonts文件
 */
gulp.task("build:fonts", function () {
    return gulp
        .src([
            paths.src.fonts + "/*"
        ])
        .pipe(gulp.dest(paths.dist.fonts));
})

/**
 * 移动images文件
 */
gulp.task("build:images", function () {
    return gulp
        .src([
            paths.src.images + "/*"
        ])
        .pipe(cache(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        })))
        .pipe(gulp.dest(paths.dist.images));
});

/**
 * 移动app下html文件
 */
gulp.task("build:html:app", function () {
    return gulp
        .src([paths.src.app + "/*.html"])
        .pipe(gulp.dest(paths.dist.root));
});

/**
 * 移动views下面的视图，保留父级目录
 */
gulp.task("build:html:views", function () {
    return gulp
        .src(paths.src.app + "/views/**/*.html")
        .pipe(flatten())
        .pipe(gulp.dest(paths.dist.views));
});

/**
 * 移动指令对应的视图,去除父级目录
 */
gulp.task("build:html:directives", function () {
    return gulp
        .src(paths.src.app + "/directives/**/*.html")
        .pipe(flatten())
        .pipe(gulp.dest(paths.dist.views + "/directives"));
});

/**
 * 移动组件对应的视图，去除父级目录
 */
gulp.task("build:html:components", function () {
    return gulp
        .src(paths.src.app + "/components/**/*.html")
        .pipe(flatten())
        .pipe(gulp.dest(paths.dist.views + "/components"));
});

/**
 * 所有的html任务
 */
gulp.task("build:html", [
    "build:html:app",
    "build:html:views",
    "build:html:directives",
    "build:html:components"
]);

/**
 * 所有任务
 */
gulp.task("build", [
    "build:lib",
    "build:js",
    "build:css",
    "build:fonts",
    "build:images",
    "build:html"
])


gulp.task("watch", ["build"], function () {
    gulp.watch(paths.bower + "/**/*", ["build:lib"]);
    gulp.watch([
        paths.src.js + "/*.js",
        paths.src.app + "/**/*.js",
        paths.src.app + "/**/**/*.js"
    ], ["build:js"]);
    gulp.watch(paths.src.sass + "/*", ["build:css"]);
    gulp.watch(paths.src.fonts + "/**/*", ["build:fonts"]);
    gulp.watch(paths.src.images + "/**/*", ["build:images"]);
    gulp.watch([
        paths.src.app + "/*.html",
        paths.src.app + "/**/**/*.html"
    ], ["build:html"]);
});

/**
 * 删除项目目录
 */
gulp.task("clean", function () {
    return del(paths.dist.root);
});

gulp.task("run", ["watch"], function () {
    browserSync.init({
        startPath: '/',
        prot: "3000",
        server: {
            baseDir: paths.dist.root
        },
        middleware: [proxy]
        // browser: 'google chrome',
    });
    gulp.watch(paths.dist.root + '/**/*').on('change', browserSync.reload);
});