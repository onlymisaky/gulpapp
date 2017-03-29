# gulpapp

用gulp构建angular项目

## 目录结构

```
--src （开发目录） 
    |----app（angular开发目录）   
        |----components（自定义组件目录） 
        |----directives（自定义指令目录） 
        |----filters（自定义过滤器目录） 
        |----services（自定义服务目录）       
        |----views（视图目录） 
        |----index.html
    |----fonts 
    |----images 
    |----js（根js文件） 
    |----rev（缓存信息目录）
    |----sass
--dist（生产目录） 
    |----assets（依赖资源目录）    
        |----css         
        |----fonts      
        |----images       
        |----js（app.js目录）
    |----lib（依赖的包目录）      
    |----views（视图目录）     
        |----components（自定义组件视图）    
        |----directives（自定义指令视图）     
    |----index.html
```
## 使用

```
npm i
bower i
gulp run #运行项目
gulp clean #删除生产目录
```

## 注意

请注意文件路径的引用，在开发环境中，以生产目录为标准来引用文件

请根据项目的需求修改`gulpfile.js`的代码

请根据项目的需求配置`bower.json`