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

- 清原山林与黄精果礼盒故事
- 礼盒正面、六袋系列、开盒体验与礼赠组合的重点视觉
- 三张整版设计图可点按放大，并用滑动与缩放查看细节
- 手机导航、键盘焦点提示与减少动态效果偏好支持

## 视觉素材

网页使用本次提供的三张设计版面图，原图保存在 `assets/source-boards/`：

- `board-01-packaging-hero.png`：主包装视觉
- `board-02-packaging-system.png`：包装平面系统
- `board-03-product-application.png`：成品应用展示

页面展示的重点区域由这三张原图通过网页裁切呈现；完整原图可点按查看。页面不再引用此前的包装渲染图、单袋图、Logo 图或版画素材。

## 二维码

- `qingyuan_shanxu_qr_final_1200.png`：1200 × 1200 黑白高对比二维码，编码公开网页地址。
- `qingyuan_shanxu_qr_final_labelled.png`：二维码下方带“扫码走进清原山序”及主题说明。
- 编码目标：`https://jhg20070623-ai.github.io/qingyuan-shanxu-digital-story/`

## 微信小店入口

网站末端接入用户提供的“裕恒源黄精”微信小店码，作为品牌与购买入口。主包装二维码仍然指向数字故事首页，不直接跳转购物页面。当前项目仅有小店码图片，没有可核验的网页分享 URL，因此 `js/config.js` 中的 `shopUrl` 保持留空。

## 视觉资产与事实边界

包装视觉以本次提供的三张设计版面图为素材。品牌收尾处另展示项目已有的裕恒源 Logo，以及用户提供的微信小店码原图；小店码未重绘、变色或裁切。

版面图中的二维码仅作为设计展示图形；正式扫码请使用已核验的独立二维码文件。页面不提供生产批次、检测、认证或医疗功效声明。

## 待接入与待确认

详见 [待确认信息清单](待确认信息清单.md)。

部署与二维码文件说明见 [DEPLOY.md](DEPLOY.md)。
