# [記帳小精靈](https://budget-elf.vercel.app/)

記帳小精靈為一個多人線上記帳網站，具備會員系統、多帳簿管理、邀請其他使用者，以及即時資料同步等功能

### Demo: [https://budget-elf.vercel.app/](https://budget-elf.vercel.app/)

# 技術介紹
### 技術特點
- **使用Firebase onSnapshot() + React useEffect() 實現多位使用者同時操作下也能及時同步更新資料的功能**
- **設計多人帳本共享與權限處理邏輯，實作多使用者角色與互動狀態管理**
- **使用Context + Custom Hooks 處理全域狀態管理，解決需要跨頁傳遞狀態的情況**

### 技術架構
- **前端**
  - React + Next.js (App Router)
    - 利用 Server/Client Component 分離機制，加速初次載入速度並提升效能
    - UI拆分出不同元件，使功能邏輯集中、可重複使用
  - **React Context + Custom Hooks**
    - 實現跨元件資料傳遞，並管理共用邏輯
  - TypeScript
    - 進行型別管理，提升開發可靠性與維護性
  - Tailwind CSS, Headless UI
    - 快速構建互動式UI，搭配自訂元件提升使用者體驗
  
- **後端(依靠第三方服務，透過前端串接)**
  - Firebase Authentication
    - 實現使用者登入、註冊以及進行身分驗證
  - **Firestore Security Rules**
    - 控制不同角色的存取權限
      - 例如：是否可以邀請其他人共用、是否可以刪除記帳紀錄
    
- **資料庫**
  - Cloud Firestore（NoSQL）
    - **onSnapshot()**
      - 監聽資料庫，當資料變更時，結合前端useEffect()同步更新所有使用者的畫面
    - **runTransaction()**
      - 確保多人同時操作時的資料一致性


# 主要功能介紹
### 邀請其他使用者共用
  輸入其他使用者註冊的email後，送出共用邀請給該使用者
  ![邀請其他使用者共用](https://github.com/YU-20-10/budget_elf/blob/main/public/gif/addShareInvite.gif)

### 其他使用者同意邀請，開始共同記帳
其他使用者在「帳簿管理」的介面中，會即時收到共用邀請，同意邀請後開始共同記帳
![其他使用者同意邀請，開始共同記帳](https://github.com/YU-20-10/budget_elf/blob/main/public/gif/acceptInvite.gif)

### 新增記帳紀錄
![新增記帳紀錄](https://github.com/YU-20-10/budget_elf/blob/main/public/gif/addAccountingRecord.gif)

