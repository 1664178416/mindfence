# MindFence

MindFence 是一个浏览器专注力插件，支持通过黑名单拦截分心网站，并提供简单的密码锁管理。

## 功能亮点

- 网站黑名单管理（添加、删除）
- 通过 Chrome Storage 持久化拦截列表
- 使用 declarativeNetRequest 动态更新拦截规则
- 弹窗管理界面 + 后台脚本协作

## 技术栈

- React + Vite+
- Chrome Extension Manifest V3
- Tailwind CSS

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

## 项目结构

- src/App.jsx: 弹窗 UI 与管理逻辑
- src/background.js: 后台拦截规则更新
- src/utils/storage.js: 存储读写与消息通信
- manifest.json: 扩展权限与入口配置


## License

MIT

