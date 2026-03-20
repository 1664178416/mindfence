# MindFence

MindFence 是一个浏览器专注力插件，支持通过黑名单拦截分心网站，并提供简单的密码锁管理。

## 当前状态

- 商店上架状态: 申请中
- 当前推荐安装方式: GitHub Releases 下载后手动安装

## 功能亮点

- 网站黑名单管理（添加、删除）
- 通过 Chrome Storage 持久化拦截列表
- 使用 declarativeNetRequest 动态更新拦截规则
- 弹窗管理界面 + 后台脚本协作

## 技术栈

- React + Vite+
- Chrome Extension Manifest V3
- Tailwind CSS

## 安装

### 方式 1: GitHub Releases 安装（当前推荐）

1. 进入 Releases 页面下载最新 zip 包
2. 解压 zip 到本地目录
3. 打开浏览器扩展页

- Edge: edge://extensions
- Chrome: chrome://extensions

4. 开启开发者模式
5. 点击加载已解压的扩展程序
6. 选择解压后的目录（目录内应直接包含 manifest.json）

提示:

- 不要直接把 zip 文件拖入扩展页
- 不要选择上一层目录（避免目录内再套一层 dist）

### 方式 2: 商店安装（审核通过后）

商店审核通过后，这里会补充官方安装链接。

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 启动开发

```bash
npm run dev
```

3. 在浏览器加载插件

- 打开扩展管理页
- 开启开发者模式
- 选择加载已解压的扩展
- 指向 dist 目录

## 构建

```bash
npm run build
```

## 发布 GitHub Releases

```bash
git add .
git commit -m "chore: release v1.0.1"
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

然后在 GitHub 仓库的 Releases 页面创建新版本，并上传打包好的 zip 安装包。

建议发布前执行:

```bash
npm run lint
npm run build
```

## 项目结构

- src/App.jsx: 弹窗 UI 与管理逻辑
- src/background.js: 后台拦截规则更新
- src/utils/storage.js: 存储读写与消息通信
- manifest.json: 扩展权限与入口配置

## 常见问题

### 为什么不启动 npm run dev 就用不了?

开发模式依赖本地开发服务，仅用于开发调试。实际使用请加载构建产物或 Releases 包。

正确流程:

1. 先执行 npm run build
2. 加载 dist 目录（或其解压结果）
3. 每次代码改动后重新 build 并在扩展页重新加载


## License

MIT

