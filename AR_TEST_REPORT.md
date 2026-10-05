# AR 与移动端测试报告

测试日期：2026-09-27  
项目：清原山序数字故事  
测试环境：本地静态 HTTP 服务、Chromium 桌面浏览器移动视口、Playwright 虚拟摄像头、SwiftShader WebGL。

## 测试结果

| 项目 | 结果 | 验证方式与说明 |
|---|---|---|
| 首页移动布局 | 通过 | 375、390、430 px 视口下检查，无横向溢出。 |
| 首页黄精视频 | 通过 | 两条视频元数据载入；时长约 42.6 秒、54 秒；均为静音、内联播放。点击“观看生长影像”后可播放。 |
| 五段章节导航 | 通过 | 点击“林下环境”章节后，生长短片跳至约 00:11 并开始静音播放。 |
| AR 运行库 | 通过 | A-Frame、MindAR Image 系统和 WebGL 均成功初始化；目标 `.mind` 文件返回 HTTP 200。 |
| 礼盒图像识别链路 | 模拟通过 | 虚拟摄像头输入由礼盒正面 target 图生成；模拟输入下识别事件触发、识别 HUD 收起、包装表面视频平面显示。此项不等于真实手机对实体包装的现场识别。 |
| AR 视频表面播放 | 通过（模拟环境） | 识别模拟后，静音循环视频纹理进入播放状态并显示在礼盒表面。 |
| 摄像头拒绝 fallback | 通过 | 模拟 `getUserMedia` 权限拒绝后，进入“清原山林意象 · 数字视觉演绎”沉浸模式，390 px 下无横向溢出。 |
| AR 页面移动布局 | 通过 | 扫描页、识别结果页、AR 视频页与 fallback 页面均以 390 × 844 移动视口检查。 |

## 截图

- `screenshots/ar-target-features.png`：礼盒正面图像目标特征分布。
- `screenshots/ar-scanner-390x844.png`：移动端 AR 扫描页。
- `screenshots/ar-recognition-emulated-390x844.png`：虚拟摄像头识别后的效果。
- `screenshots/ar-video-emulated-390x844.png`：黄精影像显示于礼盒识别平面。
- `screenshots/ar-fallback-390x844.png`：摄像头拒绝后的沉浸模式。
- `screenshots/mobile-video-390x844.png`：首页视频模块。

## 兼容性范围

当前完成的是 Chromium 桌面端的移动视口和虚拟摄像头自动化检查，不是 iOS 或 Android 真机验收。Safari、微信内置浏览器、不同型号手机的摄像头权限行为、实体礼盒在不同光线/角度/距离下的识别稳定性仍需真机检查。需要 HTTPS 与用户摄像头授权；用户拒绝或识别超时会显示网页 fallback。

## UI V2 回归复核（2026-10-01）

- Chromium 移动视口下 `/ar/` 正常载入；`target/giftbox-front.png`、`target/giftbox-front.mind` 及 fallback 包装预览图均返回 HTTP 200。
- 自动化拒绝相机权限后成功进入沉浸模式；当前 UI 复核截图见 `screenshots/ui-v2/ar-scanner-390.png`、`ar-fallback-390.png` 与 `ar-fallback-full-390.png`。
- 本次 UI 调整仅更换拆分样式表的加载链接并优化 fallback 展示图格式，没有改动 target 文件或 MindAR 识别代码。
- 本次未重跑虚拟摄像头识别模拟，也未进行真机测试；既有识别模拟结果与其限制仍以本报告上文为准。

## 复测步骤

1. 用 iPhone Safari、Android Chrome 和微信内置浏览器打开公开站点。
2. 点击“AR 走进清原”，允许摄像头，将礼盒正面完整置于画面内并保持稳定。
3. 检查识别动画、黄精视频按钮、清原山林沉浸模式和返回首页链接。
4. 分别拒绝摄像头授权、遮挡 target 或断开网络，确认 fallback 与提示可用。

## 事实边界

扫描目标使用项目内的礼盒正面设计图；视频属于用户提供的企业公开视频号素材剪辑。虚拟摄像头测试只能证明网页的 AR 识别交互链路可运行，不能作为对实体商品的实地识别或产地、本批次溯源证明。fallback 场景标注为“清原山林意象 · 数字视觉演绎”。
