type PeriodType = {
  start: Date;
  end: Date;
};

export type PaymentRulesType = {
  name: string;
  reward: number;
  limit: number | null;
  period: PeriodType | null;
  condition: {
    單筆消費: number | null;
    當月消費: number | null;
    需登錄: boolean;
    指定通路: string[];
    不回饋: string[];
  };
};
