import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function EvolutionGraph({ data7j, data14j, label }) {
  // data7j et data14j : tableaux de valeurs (kcal ou extras)
  // label : string ("Extras" ou "Calories")
  const labels7 = data7j?.labels || ['J-6','J-5','J-4','J-3','J-2','J-1','J'];
  const labels14 = data14j?.labels || Array.from({length: 14}, (_,i) => `J-${13-i}`);

  const chartData = {
    labels: data14j ? labels14 : labels7,
    datasets: [
      {
        label: label || 'Évolution',
        data: data14j ? data14j.values : data7j?.values,
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54,162,235,0.1)',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div style={{width: '100%', maxWidth: 400, margin: '0 auto'}}>
      <Line data={chartData} options={options} />
    </div>
  );
}
