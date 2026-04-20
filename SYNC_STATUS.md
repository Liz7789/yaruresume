同步状态记录

## 本地仓库状态
- 所有 31 张图片 + 网站代码已提交到本地 git
- 合并了远程原有的 `kimi web/` 目录（保留旧版本）
- 新内容位于仓库根目录：`index.html`, `style.css`, `script.js`, `assets/`

## GitHub 同步问题
SSH key 无权限访问仓库，需要以下任一方式完成 push：

**方式 A（推荐）：GitHub Token**
```bash
git remote set-url origin https://TOKEN@github.com/Liz7789/yaruresume.git
git push origin main
```

**方式 B：手动下载上传**
生成 zip → 下载 → 在本地解压 push

## 视频展示
技术上可以嵌入视频（HTML5 `<video>` 标签），但建议：
1. **上传到视频平台**（B站/YouTube）→ 嵌入链接（不占用仓库空间）
2. **或压缩为 <5MB 的短视频** → 放 `assets/videos/` 目录

请发视频文件给我，或提供视频链接，我帮你嵌入到网站。
