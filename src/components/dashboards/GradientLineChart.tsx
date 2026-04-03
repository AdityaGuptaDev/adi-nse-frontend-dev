import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const GradientLineChart = () => {
  const chartRef = useRef(null);

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "AUM Growth",
        data: [12, 14, 15, 16, 17, 18],
        fill: true,
        borderWidth: 3,
        borderColor: "#4f46e5",
        pointBackgroundColor: "#4f46e5",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#f3f4f6",
        callbacks: {
          label: (context) => `₹ ${context.parsed.y.toFixed(2)} Cr`,
        },
      },
      legend: { display: false },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
    },
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, "rgba(79,70,229,0.4)");
    gradient.addColorStop(1, "rgba(79,70,229,0)");

    chart.data.datasets[0].backgroundColor = gradient;
    chart.update();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-white p-6 rounded-xl shadow-md"
    >
      <h2 className="text-gray-700 font-semibold mb-3">AUM Growth (Animated)</h2>
      <Line ref={chartRef} data={data} options={options} />
    </motion.div>
  );
};

export default GradientLineChart;
