export const defaultPaymentRules = [
  {
    name: "現金",
    reward: 0,
    limit: null,
    period: null,
    condition: {
      單筆消費: null,
      當月消費: null,
      需登錄: false,
      指定通路: [],
      不回饋: [],
    },
  },
  {
    name: "一般信用卡",
    reward: 0.01,
    limit: null,
    period: null,
    condition: {
      單筆消費: null,
      當月消費: null,
      需登錄: false,
      指定通路: [],
      不回饋: [],
    },
  },
  {
    name: "玉山U bear卡",
    reward: 0.03,
    limit: 7500,
    period: {
      start: new Date("2025-03-01"),
      end: new Date("2025-08-31"),
    },
    condition: {
      單筆消費: null,
      當月消費: null,
      需登錄: false,
      指定通路: ["LINE Pay", "街口支付", "網購", "外送"],
      不回饋: ["超商", "全聯", "繳費", "保費", "速食", "AMAZON"],
    },
  },
];
