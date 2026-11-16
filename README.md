# 动作之间

一个用 Vue 2.7.16 制作的 360° 虚拟画廊。可探索两个原创视点和一个实拍博物馆大厅，拖拽环顾、缩放并查看三件展品。这个独立学习项目受卢浮宫《Corps en mouvement》启发，与卢浮宫无关。

界面使用 Vue 2，全景播放使用 MIT 许可的 [Pannellum 2.5.7](https://github.com/mpetroff/pannellum/releases/tag/2.5.7)。每个视点先显示轻量模糊预览，再按视野请求六面体瓦片。项目内容和依赖都随仓库部署。

## 全景文件

`panoramas/` 存放三个视点的 JPG。`<场景>_preview.jpg` 是加载预览，瓦片使用 `<场景>_<级别>_<面>_<行>_<列>.jpg`。每块 512×512，最高级别每面 1024×1024，行列从 0 开始。场景、默认视角与热点角度配置在 `gallery.js`。

替换为自有全景时，可用 Pannellum 的 [切片生成工具](https://github.com/mpetroff/pannellum/tree/2.5.7/utils/multires) 处理 2:1 全景母图，再按生成结果更新 `multiRes` 路径和层级参数。

卢浮宫参考视点 `petite_galerie_3` 的资产配置指向 `petite_galerie_4.tiles`。其预览是 256×1536 的竖排六面图，高清面宽分为 512、1150、2300、4600 四档。迁移自有或获授权的同类素材时，需要按 Pannellum 的规则重切，而不是直接改文件名。 [卢浮宫场景配置](https://www.louvre.fr/visites-en-ligne/petitegalerie/saison2/xml_2015/scenes.xml)

## 本地预览

将仓库根目录作为静态站点提供。Windows 开发环境可在仓库目录运行以下命令。

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

在开发域名已映射到本机的环境中打开 `http://dev.hoyoverse.com:4173/`。

## GitHub Pages

在仓库 Settings → Pages 中，使用 Deploy from a branch，选择 `main` 和 `/ (root)`。

展品和实拍全景的出处与许可见 [credits.md](credits.md)。依赖的 MIT 许可证位于 `vendor/`。
