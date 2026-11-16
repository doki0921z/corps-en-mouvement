# 动作之间

一个用 Vue 2.7.16 制作的 360° 虚拟画廊。可在两个固定视点之间切换、拖拽环顾、缩放并查看三件展品。这个独立学习项目受卢浮宫《Corps en mouvement》启发，与卢浮宫无关。

界面使用 Vue 2，展厅由 Three.js 实时绘制。项目内容和依赖都随仓库部署。

## 本地预览

将仓库根目录作为静态站点提供。Windows 开发环境可在仓库目录运行以下命令。

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

在开发域名已映射到本机的环境中打开 `http://dev.hoyoverse.com:4173/`。

## GitHub Pages

在仓库 Settings → Pages 中，使用 Deploy from a branch，选择 `main` 和 `/ (root)`。

展品素材的出处与许可见 [credits.md](credits.md)。依赖的 MIT 许可证位于 `vendor/`。
