[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENCE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Greasy Fork](https://img.shields.io/badge/GreasyFork-670000?logo=greasyfork&logoColor=white)](https://greasyfork.org/)

## プロジェクト構成

### ディレクトリ構造

```
/
├── dist/                # ビルド成果物（配布用のユーザースクリプトやマップファイル）
│   ├── userscript.user.js
│   ├── userscript.user.js.map
├── images/              # 画像リソース一式
│   ├── assets/          # UIや説明資料用の素材画像
│   ├── icons/           # 拡張機能やPWA用のアイコン
│       ├── icon-16.webp
│       ├── icon-48.webp
│       ├── icon-128.webp
│       ├── icon-512.webp
├── scripts/             # 開発補助スクリプト
│   ├── dev-server.ts    # ローカル開発サーバーの起動スクリプト
├── src/                 # ソースコード本体
│   ├── core/            # アプリケーションのコアロジック
│   ├── ui/              # UI関連コンポーネント
│   ├── i18n.ts          # 多言語対応（国際化処理）
│   ├── main.ts          # エントリーポイント
│   ├── metadata.ts      # ユーザースクリプト用メタデータ
│   ├── storage.ts       # ストレージ操作関連（設定保存など）
├── .gitignore           # Git管理から除外するファイル定義
├── bun.lock             # Bunの依存関係ロックファイル
├── LICENCE              # ライセンス情報
├── package.json         # npmパッケージ定義・スクリプト
├── README.md            # 英語のREADME
├── tsconfig.json        # TypeScriptコンパイル設定
└── vite.config.ts       # Viteのビルド設定

```

### 各ディレクトリの役割

- **dist/**: ビルド成果物（配布用のユーザースクリプトやソースマップ）
- **images/**: 画像リソース（UI 素材や拡張機能用アイコン）
- **scripts/**: 開発補助用スクリプト（ローカルサーバー起動など）
- **src/**: ソースコード本体（コアロジック、UI、多言語対応、ストレージ処理など）

## ローカル開発手順

### 開発環境セットアップ

1. **依存関係のインストール**

```bash
bun install
```

2. **`package.json` の設定**

- `name`: GitHub プロジェクト名と同名にする（メタデータ生成に利用される）
- `version`: 自動的にメタデータに反映される

3.  **アイコンの設定**

`images/icons/` に追加

- **icon-16.webp**（ブラウザのツールバーやタブ）
- **icon-48.webp**（Tampermonkey の管理画面のリスト表示）
- **icon-128.webp**（インストール確認画面や大きめのプレビュー）
- **icon-512.webp**（高解像度ディスプレイやアイコン生成用）

> [!WARNING]  
> `icon-48.webp` は icon 生成に用いるため必須

4.  **メタデータの設定**

- **必須**
  - **name**（プロジェクト名）
  - **description**（プロジェクトの説明）
  - **match**（実行するサイト）
- **任意**
  - **grant（初期値**: `["", , "GM_setValue", "GM_getValue"]`）
  - **license（初期値**: `MIT`）

> [!NOTE]  
> `version`: `package.json` 依存  
> `icon`: 自動設定（`images/icons/icon-48.webp` を利用）

### コマンド

```bash
bun run dev         # 開発サーバーを起動（scripts/dev-server.ts を実行）
bun run build:dev   # 開発モードでビルド（デバッグ用成果物を出力）
bun run build       # 本番モードでビルド（配布用成果物を出力）
bun run type-check  # 型チェックのみ実行（出力ファイルなし）
```

ローカル開発手順は削除する

---

## Overview

## Features

## Usage

## License

This project is licensed under the [MIT](LICENCE).
