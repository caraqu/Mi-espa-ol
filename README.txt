西语学习 App v54.1 — GitHub上传修复包

1. 先解压ZIP。
2. 在原仓库、原来的index所在目录，选择 Add file → Upload files。
3. 把解压后的 index.html、sw.js、lesson-assets 文件夹一起拖入，一次Commit。
   不要上传ZIP本身；不要增加一层外层文件夹。
4. 其他原有manifest和图标不用删除。部署后页脚应显示 v54.1，课程到Lesson73。

这次必须把 lesson-assets 文件夹一并上传，不能只替换index。
23张原图完整保留，只从index中移到同目录的配套文件夹。
以后新增课程不会再把图片塞进index，避免再次超过GitHub网页单文件限制。
原题目和词条ID、学习进度读取方式保持。无需卸载App或清理数据。

两份MD为项目记录，无需为了网页运行而上传。
代码／数据检查通过，真实GitHub部署及iPhone离线更新尚待用户环境确认。
