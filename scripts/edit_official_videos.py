"""Curate official Huangjing account footage without replacing source files."""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source_videos"
OUTPUT = ROOT / "edited_videos"
WEB_OUTPUT = ROOT / "assets" / "video"
TEMP = ROOT / "tmp" / "video-edit"
FONT = "C:/Windows/Fonts/msyh.ttc"

# Source timestamps are seconds into the original vertical account videos.
GROWTH = [("216", 0, 7), ("216", 10, 18), ("216", 18, 24), ("10", 0, 7), ("216", 24, 38.6)]
PROCESS = [("47", 12, 22), ("41", 11, 19), ("44", 95, 105), ("200", 3, 11), ("224", 34, 44), ("224", 48, 56)]
GROWTH_LOOP = [("216", 3, 7), ("216", 25, 29), ("53", 5, 9)]
HARVEST_LOOP = [("216", 17, 21), ("10", 0, 5), ("216", 29, 34)]


def run(args: list[str]) -> None:
    subprocess.run(args, cwd=ROOT, check=True)


def probe(path: Path) -> dict:
    raw = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=codec_name,codec_type,width,height",
        "-of", "json", str(path)
    ], cwd=ROOT, text=True)
    data = json.loads(raw)
    video = next(s for s in data["streams"] if s["codec_type"] == "video")
    return {
        "duration": float(data["format"]["duration"]),
        "size": int(data["format"]["size"]),
        "width": int(video["width"]),
        "height": int(video["height"]),
        "codec": video["codec_name"],
    }


def extract_segments(name: str, cuts: list[tuple[str, float, float]], with_audio: bool) -> list[Path]:
    result = []
    for index, (video_id, start, end) in enumerate(cuts):
        source = SOURCE / f"{video_id}.mp4"
        if not source.exists():
            raise FileNotFoundError(source)
        duration = end - start
        target = TEMP / f"{name}-{index:02d}.mp4"
        command = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{start:.3f}",
            "-i", str(source), "-t", f"{duration:.3f}", "-map", "0:v:0",
        ]
        if with_audio:
            command += ["-map", "0:a:0?"]
        command += [
            "-vf", "scale=720:1280:flags=lanczos,fps=30,setsar=1,format=yuv420p",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        ]
        if with_audio:
            command += ["-af", "aresample=48000,loudnorm=I=-19:TP=-2:LRA=11", "-c:a", "aac", "-b:a", "112k", "-ar", "48000", "-ac", "2"]
        else:
            command += ["-an"]
        command += ["-movflags", "+faststart", str(target)]
        run(command)
        result.append(target)
    return result


def make_caption_plate(name: str, index: int, title: str, subtext: str = "") -> Path:
    plate = Image.new("RGBA", (680, 112), (0, 0, 0, 0))
    draw = ImageDraw.Draw(plate)
    draw.rounded_rectangle((1, 1, 679, 111), radius=17, fill=(7, 47, 39, 224), outline=(207, 160, 72, 220), width=2)
    title_font = ImageFont.truetype(FONT, 27 if subtext else 29)
    title_box = draw.textbbox((0, 0), title, font=title_font)
    title_x = (680 - (title_box[2] - title_box[0])) / 2
    draw.text((title_x, 17 if subtext else 38), title, font=title_font, fill=(249, 246, 235, 255), stroke_width=0)
    if subtext:
        sub_font = ImageFont.truetype(FONT, 16)
        sub_box = draw.textbbox((0, 0), subtext, font=sub_font)
        sub_x = (680 - (sub_box[2] - sub_box[0])) / 2
        draw.text((sub_x, 70), subtext, font=sub_font, fill=(232, 204, 145, 255))
    output = TEMP / f"{name}-caption-{index:02d}.png"
    plate.save(output)
    return output


def concat_story(name: str, pieces: list[Path], captions: list[tuple[float, float, str, str]], out_name: str) -> Path:
    listing = TEMP / f"{name}-concat.txt"
    listing.write_text("".join(f"file '{p.as_posix()}'\n" for p in pieces), encoding="utf-8")
    raw = TEMP / f"{name}-joined.mp4"
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "112k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", str(raw)])
    plates = [make_caption_plate(name, i, title, subtext) for i, (_start, _end, title, subtext) in enumerate(captions)]
    output = OUTPUT / out_name
    inputs = ["-i", str(raw)]
    graph = []
    previous = "0:v"
    for i, ((start, end, _title, _subtext), plate) in enumerate(zip(captions, plates), start=1):
        inputs += ["-loop", "1", "-framerate", "30", "-i", str(plate)]
        node = f"caption{i}"
        graph.append(f"[{previous}][{i}:v]overlay=(W-w)/2:48:enable='between(t,{start:.3f},{end:.3f})':eof_action=pass[{node}]")
        previous = node
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
        "-filter_complex", ";".join(graph), "-map", f"[{previous}]", "-map", "0:a:0?",
        "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "112k", "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart", "-metadata", "title=" + out_name, str(output)
    ])
    return output


def make_loop(name: str, cuts: list[tuple[str, float, float]], out_name: str) -> Path:
    pieces = extract_segments(name, cuts, with_audio=False)
    inputs: list[str] = []
    for p in pieces:
        inputs += ["-i", str(p)]
    fade = 0.45
    graph = []
    current = "0:v"
    accumulated = probe(pieces[0])["duration"]
    for index in range(1, len(pieces)):
        next_node = f"x{index}"
        offset = accumulated - fade
        graph.append(f"[{current}][{index}:v]xfade=transition=fade:duration={fade}:offset={offset:.3f}[{next_node}]")
        accumulated = offset + probe(pieces[index])["duration"]
        current = next_node
    output = OUTPUT / out_name
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
        "-filter_complex", ";".join(graph), "-map", f"[{current}]", "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", "-metadata", "title=" + out_name, str(output)
    ])
    return output


def make_poster(video: Path, name: str) -> Path:
    poster = OUTPUT / name
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", "1.0", "-i", str(video),
         "-frames:v", "1", "-c:v", "libwebp", "-quality", "86", str(poster)])
    return poster


def timecode(value: float) -> str:
    minutes = int(value // 60)
    seconds = value - minutes * 60
    return f"{minutes:02d}:{seconds:05.2f}"


def source_table(cuts: list[tuple[str, float, float]]) -> str:
    return "\n".join(f"| `{video_id}.mp4` | {timecode(start)}–{timecode(end)} |" for video_id, start, end in cuts)


def main() -> None:
    shutil.which("ffmpeg") or (_ for _ in ()).throw(RuntimeError("ffmpeg is not on PATH"))
    shutil.which("ffprobe") or (_ for _ in ()).throw(RuntimeError("ffprobe is not on PATH"))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    TEMP.mkdir(parents=True, exist_ok=True)

    growth_captions = [
        (0, 4, "一株黄精的山林旅程", "辽宁 · 抚顺 · 清原"),
        (4, 11, "清原满族自治县", "黄精采挖影像"),
        (11, 19, "山林作业场景", "裕恒源黄精官方公开视频"),
        (19, 25, "采挖与根茎整理", "黄精生长故事"),
        (25, 32, "机械采收影像", "企业公开视频"),
        (32, 39, "黄精根茎 · 采后整理", "企业公开视频"),
        (39, 43, "山林为脉 · 黄精为珍", "裕恒源黄精官方公开视频"),
    ]
    process_captions = [
        (0, 4, "从鲜黄精到黄精果", "企业公开影像剪辑"),
        (4, 14, "黄精原料与整理影像", "企业公开视频"),
        (14, 22, "企业加工影像", "画面内容展示"),
        (22, 32, "黄精加工环节画面", "不代表具体工艺参数"),
        (32, 40, "企业加工现场", "裕恒源黄精官方公开视频"),
        (40, 49, "黄精加工影像", "企业公开视频"),
        (49, 54, "黄精相关产品画面", "裕恒源黄精官方公开视频"),
    ]

    growth_pieces = extract_segments("growth", GROWTH, with_audio=True)
    process_pieces = extract_segments("process", PROCESS, with_audio=True)
    growth_story = concat_story("growth", growth_pieces, growth_captions, "huangjing_growth_story.mp4")
    process_story = concat_story("process", process_pieces, process_captions, "huangjing_process_story.mp4")
    growth_loop = make_loop("growth-loop", GROWTH_LOOP, "huangjing_growth_ar_loop.mp4")
    harvest_loop = make_loop("harvest-loop", HARVEST_LOOP, "huangjing_harvest_ar_loop.mp4")
    growth_poster = make_poster(growth_story, "poster_growth.webp")
    process_poster = make_poster(process_story, "poster_process.webp")
    WEB_OUTPUT.mkdir(parents=True, exist_ok=True)
    deployed_stories = [
        (growth_story, WEB_OUTPUT / "huangjing-growth-story.mp4"),
        (process_story, WEB_OUTPUT / "huangjing-process-story.mp4"),
    ]
    for source_path, deployed_path in deployed_stories:
        shutil.copy2(source_path, deployed_path)

    report_lines = [
        "# VIDEO_EDIT_REPORT", "",
        "视频来自用户提供的 `D:\\黄精\\视频`，已先原样复制到 `source_videos/`。所有输出均为独立新文件，未覆盖源片。主片保留并响度归一化源音轨；AR 循环静音、无新增字幕，并使用短淡化衔接。",
        "", "## 黄精生长短片", "", "片名：《一株黄精的山林旅程》", "", "| 源文件 | 采用时间段 |", "|---|---:|", source_table(GROWTH), "",
        "## 加工影像短片", "", "片名：《从鲜黄精到黄精果》", "", "| 源文件 | 采用时间段 |", "|---|---:|", source_table(PROCESS), "",
        "## AR 循环片段", "", "### 生长与根茎", "", "| 源文件 | 采用时间段 |", "|---|---:|", source_table(GROWTH_LOOP), "",
        "### 采挖与机械采收", "", "| 源文件 | 采用时间段 |", "|---|---:|", source_table(HARVEST_LOOP), "",
        "## 文件参数", "", "| 文件 | 时长 | 分辨率 | 编码 | 文件大小 |", "|---|---:|---:|---|---:|"
    ]
    for path in [growth_story, process_story, growth_loop, harvest_loop, growth_poster, process_poster]:
        info = probe(path) if path.suffix == ".mp4" else {"duration": "—", "width": "—", "height": "—", "codec": "WebP", "size": path.stat().st_size}
        dimensions = f"{info['width']}×{info['height']}" if isinstance(info["width"], int) else "—"
        duration = f"{info['duration']:.2f}s" if isinstance(info["duration"], float) else "—"
        report_lines.append(f"| `{path.relative_to(ROOT).as_posix()}` | {duration} | {dimensions} | {info['codec']} | {info['size'] / 1_000_000:.2f} MB |")
    for _, deployed_path in deployed_stories:
        info = probe(deployed_path)
        report_lines.append(f"| `{deployed_path.relative_to(ROOT).as_posix()}` | {info['duration']:.2f}s | {info['width']}×{info['height']} | {info['codec']} | {info['size'] / 1_000_000:.2f} MB |")
    report_lines += [
        "", "编码：主片 H.264 + AAC，720×1280，`faststart`；AR 循环 H.264 静音，720×1280，`faststart`。片段画幅保持 9:16，未拉伸。", "",
        "## 筛选说明", "", "`208.mp4` 未进入任何成片：其原片开场字幕明确提到“长白山”，不将其他产区画面放入清原叙事。生长短片使用画面标有“清原满族自治县”的 `216.mp4`；其余加工影像保持“企业加工影像”“相关产品画面”等审慎描述。",
        "", "## 核验说明", "", "由 ffprobe 读取成片编码、时长、分辨率与文件体积；网页播放器采用 `controls`、`muted`、`playsinline`、`preload=metadata`，不自动播放。素材名称不代表某个具体批次或某一盒礼盒的唯一加工链路。", ""
    ]
    (ROOT / "VIDEO_EDIT_REPORT.md").write_text("\n".join(report_lines), encoding="utf-8")


if __name__ == "__main__":
    main()
