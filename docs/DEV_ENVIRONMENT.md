# 開発環境情報

## 概要
このプロジェクトはDev Container環境で動作しています。

## システム情報

### オペレーティングシステム
- **OS**: Debian GNU/Linux 12 (bookworm)
- **カーネル**: Linux 6.14.8-orbstack-00288-g80b66077b748
- **アーキテクチャ**: aarch64
- **コンテナID**: 64cea9b4eaa3

## 開発ツール・ランタイム

### Node.js環境
- **Node.js**: v22.16.0
- **npm**: 10.9.2

### AWS開発環境
- **AWS CLI**: aws-cli/2.27.26
- **AWS CDK**: 2.1017.1 (build 60506e5)

### Python環境
- **Python**: 3.11.2
- **pip**: 23.0.1 (from /opt/venv/lib/python3.11/site-packages/pip)
- **仮想環境**: /opt/venv

## 利用可能なコマンドラインツール
- `apt` - パッケージマネージャー
- `dpkg` - Debianパッケージマネージャー
- `git` - バージョン管理システム
- `gh` - GitHub CLI
- `curl` - HTTP/HTTPSクライアント
- `gpg` - GNU Privacy Guard
- `find` - ファイル検索
- `grep` - テキスト検索
- `unzip` - ZIP展開
- `tar` - アーカイブツール
- `gzip` - 圧縮ツール

## 開発コンテナ
- **環境**: Dev Container
- **ベースOS**: Debian 12 (bookworm)
- **実行環境**: OrbStack (macOS向けコンテナ実行環境)
- **ユーザー**: root

## ブラウザアクセス
ホストのデフォルトブラウザを開くには以下のコマンドを使用:
```bash
"$BROWSER" <url>
```

## バージョン確認コマンド
以下のコマンドで各ツールのバージョンを確認できます:
```bash
# Node.js環境
node -v        # v22.16.0
npm -v         # 10.9.2

# AWS環境
aws --version  # aws-cli/2.27.26
cdk --version  # 2.1017.1 (build 60506e5)

# Python環境
python3 --version  # Python 3.11.2
pip3 --version     # pip 23.0.1
```

## 確認日
このドキュメントは以下のコマンド実行結果を基に作成されました:
- 実行日時: 最新
- 実行場所: /workspace
- 実行ユーザー: root@64cea9b4eaa3
