import { useEffect, useState } from "react";
import { Button } from "antd";
import _, { isEmpty } from "lodash";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export const PopulationBarChart = ({ dataPopulation }) => {
  const [data] = useState(dataPopulation.dataGraph);
  const [regionation] = useState(dataPopulation.region);
  const [intervalId, setIntervalId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    return () => clearInterval(intervalId);
  }, [intervalId]);

  const updatePopulationData = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= data[0].population.length - 1) {
        clearInterval(intervalId);
        setIntervalId(null);
        return prevIndex;
      } else {
        return prevIndex + 1;
      }
    });
  };

  const handleClick = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    } else {
      const newIntervalId = setInterval(updatePopulationData, 200);
      setIntervalId(newIntervalId);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalId);
  }, []);

  const top12Countries = data
    ?.map((country) => ({
      ...country,
      currentPopulation: country.population[currentIndex],
    }))
    .sort((a, b) => b.currentPopulation - a.currentPopulation)
    .slice(0, 12);

  const chartData = {
    labels: top12Countries?.map((item) => item.country),
    datasets: [
      {
        label: "Population",
        data: top12Countries?.map((item) => item.population[currentIndex]),
        backgroundColor: top12Countries?.map((item) => item.color),
        borderColor: "#fff",
        borderWidth: 1,
        xAxisID: "x1",
      },
    ],
  };

  const drawIconsPlugin = {
    id: "drawIcons",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];

      dataset.data.forEach((value, index) => {
        const country = top12Countries && top12Countries[index];
        if (!country || !country.icon) return;
        const icon = new Image();
        icon.src = country.icon;

        const meta = chart.getDatasetMeta(0);

        const bar = meta.data[index];

        const x = bar.x - 25;
        const y = bar.y - 10;

        ctx.drawImage(icon, x, y, 20, 20);
      });
    },
  };

  const options = {
    indexAxis: "y",
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
    responsive: true,

    plugins: {
      legend: {
        position: "top",
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x1: {
        position: "top",
        beginAtZero: true,
      },
      x2: {
        type: "category",
        position: "bottom",
        labels: Array.from({ length: 71 }, (_, i) => 1951 + i),
        title: {
          display: true,
          text: "Year",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 14,
          },

          display: true,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const calculateTotalPopulationForCurrentYear = () => {
    return top12Countries?.reduce(
      (total, country) => total + country.currentPopulation,
      0
    );
  };

  const totalPopulationCurrentYear = calculateTotalPopulationForCurrentYear();

  return (
    !isEmpty(data) && (
      <div>
        <h2>Population Growth per country, 1950 t0 2021</h2>
        <p>
          Region:{" "}
          {regionation?.map((rg, i) => (
            <span key={i} style={{ marginRight: "10px" }}>
              <FontAwesomeIcon
                icon={faCircle}
                fontSize={12}
                color={rg.color}
                style={{ paddingRight: 5 }}
              />
              {rg.key}
            </span>
          ))}{" "}
        </p>
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "10%",
            fontSize: "25px",
            fontWeight: "bold",
            color: "gray",
            textAlign: "right",
          }}
        >
          <p> {currentIndex + 1950}</p>
          <p>Total: {totalPopulationCurrentYear?.toLocaleString()}</p>
        </div>
        <Bar data={chartData} options={options} plugins={[drawIconsPlugin]} />
        <Button type="primary" onClick={handleClick}>
          {intervalId ? "Stop" : "Start"}
        </Button>
      </div>
    )
  );
};
