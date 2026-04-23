# SC Exam Study

> 情報処理安全確保支援士（SC）試験対策のWebアプリケーション

## Features

- 科目A（午前）対策クイズ -- カテゴリ別・ランダム出題に対応
- 計算トレーニング -- 暗号・リスク・ネットワーク等の数値計算問題
- 科目B（午後）演習 -- シナリオベースの実践的問題
- 学習進捗管理 -- localStorageによる解答履歴の記録
- ダークテーマUI -- 目に優しいネイビー系カラースキーム

## Contents

### Quiz（科目A）
- 250問
- カテゴリ一覧（問題数）:
  - Cryptography: 35
  - Network Security: 30
  - Emerging Threats: 30
  - Application Security: 25
  - Security Architecture: 25
  - Access Control: 25
  - Risk Management: 25
  - Incident Response: 20
  - Governance & Compliance: 20
  - Physical Security: 15
- クイズモード: カテゴリ選択、ランダム出題、解説表示

### Calc Training（計算トレーニング）
- 120問
- カテゴリ一覧（問題数）:
  - Cryptographic Calculations: 20
  - Encryption Performance: 20
  - Risk Quantification: 20
  - Incident Metrics: 15
  - Network Security: 15
  - Access Control Math: 15
  - Compliance Costs: 15

### Subject B（科目B演習）
- 100問
- カテゴリ一覧（問題数）:
  - Comprehensive Scenarios: 25
  - Security Design: 20
  - Incident Response Scenarios: 20
  - Security Policy: 15
  - Risk Assessment: 10
  - Compliance Audit: 10

### Progress（進捗管理）
- 解答履歴と正答率の確認

## Tech Stack

- React 19 + TypeScript
- Vite（ビルドツール）
- Tailwind CSS（スタイリング）
- localStorage（進捗データ永続化）

## Usage

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス。

## Deployment

```bash
npm run build
```

`dist/` ディレクトリを任意の静的ホスティングサービスにデプロイ。

## License: MIT
