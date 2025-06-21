"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

type DoughnutChartPropsType = {
  labels: string[];
  data: number[];
};

export default function DoughnutChart({
  labels,
  data,
}: DoughnutChartPropsType) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;
    Chart.register(ChartDataLabels);
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels.length > 0 ? labels : ["該區間尚未有紀錄"],
        datasets: [
          {
            data: data.length > 0 ? data : [1],
            backgroundColor:
              data.length > 0
                ? [
                    "rgb(255, 226, 226)",
                    "rgb(255, 237, 212)",
                    "rgb(254, 249, 194)",
                    "rgb(220, 252, 231)",
                    "rgb(219, 234, 254)",
                    "rgb(243, 232, 255)",
                    "rgb(243, 244, 246)",
                    "rgb(255, 228, 230)",
                    "rgb(254, 243, 198)",
                    "rgb(236, 252, 202)",
                    "rgb(206, 250, 254)",
                    "rgb(237, 233, 254)",
                  ]
                : ["rgb(243, 244, 246)"],
            hoverOffset: 4, // 被選取的區塊往外4px
            datalabels: {
              labels: {
                name: {
                  align: "top",
                  font: { size: 16 },
                  formatter: (value, ctx) =>
                    ctx.chart.data.labels?.[ctx.dataIndex],
                },
                value: {
                  align: "bottom",
                  backgroundColor: "white",
                  borderColor: "white",
                  borderWidth: 2,
                  borderRadius: 4,
                  color: "black",
                  formatter: (value) => {
                    if (value > 2) {
                      return `- ${value}`;
                    }else{
                      return 0
                    }
                  },
                  padding: 8,
                },
              },
            },
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                if (data.length > 0) {
                  const label = context.label;
                  const value = context.formattedValue;
                  return `${label}: ${value}`;
                } else {
                  return context.label;
                }
              },
            },
          },
          datalabels: {
            font: { weight: "bold" },
            offset: 0,
            padding: 0,
          },
        },
      },
    });

    // ummounted時清除chart
    return () => {
      chart.destroy();
    };
  }, [data, labels]);

  // ref={} 當canva元素mounted時，把該元素存入指定的ref(等同於純JS綁定元素)
  return <canvas ref={canvasRef} />;
}
