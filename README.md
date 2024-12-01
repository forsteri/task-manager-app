# task-manager-app
## プロジェクト概要
- このプロジェクトはタスク管理アプリの開発を通じて、GitHubやCDK、共同開発の流れを練習することを目的としています。

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
│   ├── lib/             # CDKのスタック定義  
│   │   └── my-stack.ts  
│   ├── test/            # CDKコード用のテスト  
│   │   └── my-stack.test.ts  
├── scripts/             # 補助スクリプトやCI/CD用スクリプト  
│   ├── deploy.sh        # 手動デプロイ用スクリプト  
│   ├── destroy.sh       # 手動削除用スクリプト  
├── .github/             # GitHub Actionsのワークフロー  
│   └── workflows/  
│       └── deploy.yml   # CI/CDの設定  

1. トップレベル
.devcontainer.json / Dockerfile:

コンテナ環境の設定をリポジトリルートに置くことで、見通しを良くする。
LICENSE / README.md:

プロジェクトの概要や利用条件を示すファイル。
.gitignore:

不要なファイル（例: node_modules, cdk.out）がリポジトリに混ざらないように管理。
2. app/（アプリケーションコード）
Lambda関数やフロントエンドコードが入る場所。
例えば、PythonのLambda関数なら、lambda_function.py をここに配置。
3. infra/（CDKコード）
CDKで定義するインフラのコード。
cdk.json:
CDKプロジェクトの設定ファイル。
lib/:
スタック定義をここにまとめる。
例: my-stack.ts にS3バケットやLambdaの定義を記述。
4. scripts/（補助スクリプト）
CI/CD以外で手動デプロイや削除をしたいときのスクリプトを置く場所。
5. .github/（GitHub Actions設定）
CI/CDのワークフロー定義。
deploy.yml にプッシュ時のビルド・デプロイの流れを記述。

## 開発フロー
1. ブランチを切って作業。
2. 作業内容をプルリクエストにまとめる。
3. レビューを受けてマージする。
