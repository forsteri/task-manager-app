# task-manager-app
## プロジェクト概要
- このプロジェクトはタスク管理アプリの開発を通じて、種々の技術を学習することを目的とする。
- 具体的には、以下の項目を目的とする。
  - コーディングエージェントの自律的能力の検証
  - CDK構築の再現で過去との比較

使用技術と制約
- CDK : TypeScriptで記述
- Lambda : Pythonで記述
- デプロイ環境 : AWS

## 詳細ドキュメント
- [要件定義](docs/requirements.md) - 機能要件、技術仕様、API設計
- [プロジェクト進行ステップ](docs/project-steps.md) - 開発手順とマイルストーン

## リポジトリ構成
task-manager-app/  
├── .devcontainer/  
│   ├── devcontainer.json # Dev Containerの設定  
│   └── Dockerfile # コンテナのビルド定義  
├── LICENSE              # ライセンスファイル  
├── README.md            # リポジトリの概要説明  
├── .gitignore           # Gitで追跡しないファイルを指定  
├── app/                 # アプリケーションコード（Lambdaなど）  
│   ├── __init__.py  
│   ├── lambda_function.py  
│   └── requirements.txt  # Lambdaの依存ライブラリ  
├── infra/               # CDKのコード（インフラ定義）  
│   ├── cdk.json         # CDKプロジェクト設定  
│   ├── tsconfig.json    # TypeScriptの設定  
│   ├── package.json     # Node.js依存関係  
├── docs/                 # プロジェクト詳細ドキュメント
│   ├── requirements.md      # 要件定義
│   └── project-steps.md     # 開発ステップ
├── scripts/             # 補助スクリプトやCI/CD用スクリプト  
│   ├── deploy.sh        # 手動デプロイ用スクリプト  
│   ├── destroy.sh       # 手動削除用スクリプト  
├── .github/             # GitHub Actionsのワークフロー  
│   └── workflows/  
│       └── deploy.yml   # CI/CDの設定  
├── serverless/         # 旧プロジェクトファイル群（利用しない）

## 開発フロー
1. ブランチを切って作業
2. 作業内容をプルリクエストにまとめる
3. レビューを受けてマージする


