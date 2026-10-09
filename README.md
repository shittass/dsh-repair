# DeepSeek Harness 文件工具修复版

给官方 `@deepseek-ai/dsh` 换上带**文件工具修复引擎**的版本：模型读文件、改文件时常见的坏参数和错路径会被自动纠正，而不是白跑一次再把错误丢回给模型。

## 安装

```sh
npm i -g @swoop111/dsh
```

装完就能直接用 `dsh`，和官方 CLI 完全一样。

## 装完多了什么

1. **重复读取拒绝** — 同一个文件的同一段内容在几步内被重读时直接拦下，并告诉模型「这段还在上面，继续读请用 `offset=N`，确实要重读请加 `force=true`」。
2. **参数自动归一** — `offset=0`、`offset=-1` 归到第 1 行；`limit` 超过上限就钳到上限。一个坏参数不再浪费一整次调用。
3. **路径自动重锚** — 读、改、写碰到不存在的路径时，按本会话用过的路径和目录内容找到真实目标并重试，读还会给出「Did you mean ...?」。
4. **窗口结构补齐** — 读到的窗口如果正好切在代码块、括号块或缩进块中间，自动补上开头和结尾那几行，模型看到的是完整结构。
5. **创建漂移提示** — 新建文件时如果路径像某个已有文件的笔误，给出提示（只提示，不改写你的意图——新建是合法的）。

每一次自动纠正都会在结果里说明改了什么，不会静默改写。

## 验证装的是修复版

```sh
dsh --version
# 0.2.0-rc.2

dsh --profile headless --dump-config-schema | grep -c '"readRepair"'
# 1 —— 如果是 0，说明装到的是官方原版，修复引擎没有被替换进来
```

## 限制

- **只支持 npm。** pnpm 不读取安装根目录的 `overrides`，所以 `pnpm add -g` 装出来的是官方原版，没有修复能力。
- **版本与官方绑定。** 当前对应 `@deepseek-ai/dsh@0.2.0-rc.2`，上游发新版本前不会自动跟进。
- **需要 Node `^22.19 || >=24`。**
- 如果本机 npm 缓存较热，直接装可能解析到旧的占位版本，写死版本号最稳：

  ```sh
  npm i -g @swoop111/dsh@0.2.0-rc.2
  ```

## 卸载

```sh
npm uninstall -g @swoop111/dsh
```

## 它是怎么做的

只发 4 个包，不改动官方任何东西：

- `@swoop111/dsh` — 安装入口，里面只有一份 `package.json` 和一个 `bin.js`。
- `@swoop111/dsh-tool-fs`、`@swoop111/dsh-fs-edit-repair`、`@swoop111/dsh-arg-repair` — 官方同名包加上修复引擎后的副本。

根包的 `dependencies` 和 `overrides` 用 `npm:@swoop111/...@0.2.0-rc.2` 把官方那三个名字指向上面这三个包。因为 npm 只认安装根目录的 `overrides`，而这里装的就是根包，所以重定向在所有平台上都生效——不需要发布权，也不需要改官方那套 300 多个包。

```json
{
  "dependencies": {
    "@deepseek-ai/dsh": "0.2.0-rc.2",
    "@deepseek-ai/dsh-tool-fs": "npm:@swoop111/dsh-tool-fs@0.2.0-rc.2"
  },
  "overrides": {
    "@deepseek-ai/dsh-tool-fs": "npm:@swoop111/dsh-tool-fs@0.2.0-rc.2"
  }
}
```

## 说明

本仓库只是一个把修复引擎接进 DeepSeek Harness 的再分发入口，与 DeepSeek 官方无关。harness 本体版权归其原作者，许可见官方仓库。
