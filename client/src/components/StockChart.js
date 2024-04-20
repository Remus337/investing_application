import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockChart = ({ stockData }) => {
  return (
    <div>
      {stockData.map(stock => {
        const chartData = {
          labels: stock.data.map(item => new Date(item.t).toLocaleDateString()),
          datasets: [
            {
              label: `${stock.symbol} Close Price`,
              data: stock.data.map(item => item.c),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
              label: `${stock.symbol} High Price`,
              data: stock.data.map(item => item.h),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
              label: `${stock.symbol} Low Price`,
              data: stock.data.map(item => item.l),
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.5)',
            }
          ]
        };

        return (
          <div key={stock.symbol}>
            <h2>{stock.symbol} Stock Data Chart</h2>
            <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: false } } }} />
          </div>
        );
      })}
    </div>
  );
};

export default StockChart;
