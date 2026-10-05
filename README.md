# 清原山序｜一盒黄精的山林故事

用于“裕恒源黄精果礼盒”包装二维码的移动端数字故事页面。

**公开预览：** [https://jhg20070623-ai.github.io/qingyuan-shanxu-digital-story/](https://jhg20070623-ai.github.io/qingyuan-shanxu-digital-story/)

本项目使用原生 HTML、CSS 和 JavaScript，可作为静态网站部署，无数据库、外链字体或运行时服务依赖。

## 本地预览

在本目录运行：

```powershell
python -m http.server 4173
```

浏览器打开 `http://localhost:4173`。也可将本目录直接作为 Vercel、Cloudflare Pages 或 GitHub Pages 的静态站点根目录。

## 页面内容

- 首页品牌故事与包装主视觉
- 包装系统、成品应用、山林视觉基因、绿色设计与数字互动体验
- 05「一株黄精的山林旅程」：企业黄精生长与加工影像
- `/ar/`：MindAR + A-Frame 礼盒图像识别体验；相机不可用时可进入山林沉浸模式
- 08 品牌故事末端的裕恒源黄精微信小店码
- 手机导航、键盘焦点提示与减少动态效果偏好支持

## 视觉素材

包装视觉以用户提供的三张设计版面图为源，原图保存在 `assets/source-boards/`：

- `board-01-packaging-hero.png`：主包装视觉
- `board-02-packaging-system.png`：包装平面系统
- `board-03-product-application.png`：成品应用展示

页面的包装细节图与系列展示由这三张原图裁切、缩放后呈现；完整原图可点按查看。山林背景使用用户另行提供的意象图，并以「数字视觉演绎」标识，不作为清原某处实景证明。视频使用项目接入的企业影像素材。

## 二维码

- `qingyuan_shanxu_qr_final_1200.png`：1200 × 1200 黑白高对比二维码，编码公开网页地址。
- `qingyuan_shanxu_qr_final_labelled.png`：二维码下方带“扫码走进清原山序”及主题说明。
- 编码目标：`https://jhg20070623-ai.github.io/qingyuan-shanxu-digital-story/`

## 微信小店入口

网站末端接入用户提供的“裕恒源黄精”微信小店码，作为品牌与购买入口。主包装二维码仍然指向数字故事首页，不直接跳转购物页面。当前项目仅有小店码图片，没有可核验的网页分享 URL，因此 `js/config.js` 中的 `shopUrl` 保持留空。

## 视频素材

企业影像位于 `assets/video/`，页面不会抓取微信视频号内容。视频说明、替换文件名及压缩建议见 [VIDEO_ASSET_GUIDE.md](VIDEO_ASSET_GUIDE.md)。

## 视觉资产与事实边界

包装视觉以本次提供的三张设计版面图为素材。品牌标志取自包装版面，微信小店入口直接使用用户提供的原始小店码；小店码未重绘、变色或裁切。

版面图中的二维码仅作为设计展示图形；正式扫码请使用已核验的独立二维码文件。页面不提供生产批次、检测、认证或医疗功效声明。

## 待接入与待确认

详见 [待确认信息清单](待确认信息清单.md)。

部署与二维码文件说明见 [DEPLOY.md](DEPLOY.md)。
