# 发布与二维码

## 生产地址

- 网页：[https://jhg20070623-ai.github.io/qingyuan-shanxu-digital-story/](https://jhg20070623-ai.github.io/qingyuan-shanxu-digital-story/)
- GitHub 仓库：[https://github.com/jhg20070623-ai/qingyuan-shanxu-digital-story](https://github.com/jhg20070623-ai/qingyuan-shanxu-digital-story)
- 发布方式：GitHub Pages，`main` 分支根目录；纯静态文件，无构建步骤。

## 二维码文件

- `qingyuan-shanxu-qr-1200.png`：1200 × 1200 像素，二维码编码生产网页地址。
- `qingyuan-shanxu-qr-labelled.png`：含标题与地址的版面预览图。

印刷前请用手机扫描 1200 × 1200 版本并确认跳转到生产网页；网页地址变更时重新生成二维码。

## 更新页面

修改本目录文件后提交并推送到 `main`，GitHub Pages 会重新发布。站点设置位于仓库 **Settings → Pages**，发布源为 `main` 分支根目录。

本地预览：在本目录运行 `python -m http.server 4173`，然后打开 `http://localhost:4173`。本地地址不能编码进包装二维码。

## 上线前仍需确认

1. 品牌方核准公开使用的裕恒源 Logo、包装 V5.5 效果图和六袋图稿。
2. 如接入品牌官网或官方店铺，先核实真实链接，再填写 `js/config.js` 的 `brandUrl` 和 `shopUrl` 并重新部署。
3. 页面中的盒型尺寸、材料、工艺和产品信息均待企业及供应商确认；当前页面不作产品溯源或功效承诺。
