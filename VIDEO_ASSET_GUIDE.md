# 黄精视频素材接入指南

## 已接入成片

所有用户提供的原始素材保存在 `source_videos/`，剪辑成片保存在 `edited_videos/`：

- `huangjing_growth_story.mp4`：清原采挖与黄精根茎影像。
- `huangjing_process_story.mp4`：企业加工环节与相关产品影像。
- `huangjing_growth_ar_loop.mp4`：AR 表面播放的生长与根茎静音循环。
- `huangjing_harvest_ar_loop.mp4`：AR 表面播放的采挖与机械采收静音循环。
- `poster_growth.webp`、`poster_process.webp`：首页成片封面。

网页投放副本位于 `assets/video/`：

- `huangjing-growth-story.mp4`
- `huangjing-process-story.mp4`

它们与 `edited_videos/` 内的对应成片内容一致，使用独立文件名便于页面静态托管。AR 独立短循环继续从 `edited_videos/` 载入。

首页和 `/ar/` fallback 播放前两条故事短片。礼盒识别后的两个 AR 按钮分别调用两个静音循环。首页及 AR 表面循环使用 `preload="none"`，避免扫码打开后预先下载视频；沉浸模式视频使用 `preload="metadata"`。播放器带 `controls`、`muted`、`playsinline`，不会自动播放声音。

## 原始素材与重剪

当前源片是用户从“裕恒源黄精”官方视频号下载后放在 `D:\黄精\视频` 的文件，已原样复制到本机项目的 `source_videos/`。已保留原始视频的内容、比例和水印，没有覆盖源片。为避免把未剪辑原片一并公开，`source_videos/` 不纳入 Git 提交；`assets/video/` 中的成片是网页展示用 H.264 优化版，不是源片备份。

重剪时：

1. 将官方或企业授权的 MP4 放入 `source_videos/`，保持源文件不变。
2. 在 `scripts/edit_official_videos.py` 中调整片段编号与起止秒数。
3. 确保系统 PATH 可调用 `ffmpeg` 与 `ffprobe`。
4. 在项目根目录运行：

   ```powershell
   rtk proxy python scripts\edit_official_videos.py
   ```

5. 脚本会输出 H.264/AAC、720×1280、`faststart` 的网页短片；同时更新 `assets/video/` 的两个网页投放副本。AR 循环为静音 H.264，采用短淡化衔接。原始画面比例保持 9:16。
6. 剪辑明细、截取时码、时长、尺寸和文件大小写入 `VIDEO_EDIT_REPORT.md`。

本次 `208.mp4` 的原片开场明确出现“长白山”，故没有纳入清原叙事。后续素材若出现其他产区名称，也应排除或仅在可确认的事实语境中使用，不能通过裁切字幕来伪装来源。

## 待企业确认的内容

- 当前公开视频的使用授权范围及长期网页公开展示权限。
- 画面中未明确标注地点的加工片段是否属于同一企业、同一产区。
- 若需写具体加工工艺名称、参数或与本礼盒的生产对应关系，先由企业核实。
- 若企业提供真实清原林地、基地或本批次生产素材，可替换相应章节；在此之前不得称作“本批次溯源”或“完整追溯”。
