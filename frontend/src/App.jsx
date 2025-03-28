import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import './App.css';

export default function App() {
  const [data, setData] = useState({
    encryptedAssets: 0,
    antivirusCoverage: 0,
    edrCoverage: 0,
    obsolescenceRate: 0,
    criticalObsoleteSystems: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const assetsResponse = await fetch("/assets_inventory.json");
        const assets = await assetsResponse.json();
        
        const criticalAssets = assets.filter(a => a.criticality === "Critique");
        const encryptedCriticalAssets = criticalAssets.filter(a => a.encryption);
        const obsolescenceCount = assets.filter(a => a.os.includes("Windows 7") || a.os.includes("Server 2012"));
        const criticalObsolete = criticalAssets.filter(a => obsolescenceCount.includes(a));

        const edrResponse = await fetch("/edr_status.json");
        const edrData = await edrResponse.json();
        const edrCoverage = (edrData.filter(e => e.edr_installed).length / edrData.length) * 100;

        const avResponse = await fetch("/antivirus_status.csv");
        const avText = await avResponse.text();
        const avLines = avText.split("\n").slice(1).filter(l => l.trim());
        const protectedAssets = avLines.filter(line => line.includes("Protected")).length;
        const avCoverage = (protectedAssets / avLines.length) * 100;

        setData({
          encryptedAssets: (encryptedCriticalAssets.length / criticalAssets.length) * 100,
          antivirusCoverage: avCoverage,
          edrCoverage,
          obsolescenceRate: (obsolescenceCount.length / assets.length) * 100,
          criticalObsoleteSystems: (criticalObsolete.length / criticalAssets.length) * 100,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Couverture de Sécurité',
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'État des Systèmes',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Tableau de Bord Cybersécurité
          </h1>
          <p className="text-xl text-gray-600">
            Aperçu complet de la sécurité de votre infrastructure
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { title: "Assets Critiques Chiffrés", value: data.encryptedAssets },
                { title: "Couverture Antivirus", value: data.antivirusCoverage },
                { title: "Couverture EDR", value: data.edrCoverage },
                { title: "Taux d'Obsolescence", value: data.obsolescenceRate },
                { title: "Systèmes Critiques Obsolètes", value: data.criticalObsoleteSystems },
              ].map((stat, index) => (
                <StatCard 
                  key={index} 
                  title={stat.title} 
                  value={`${stat.value.toFixed(2)}%`} 
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Bar
                  data={{
                    labels: ["Assets Chiffrés", "Antivirus", "EDR"],
                    datasets: [
                      {
                        label: "Couverture (%)",
                        data: [data.encryptedAssets, data.antivirusCoverage, data.edrCoverage],
                        backgroundColor: ["#0088FE", "#00C49F", "#FFBB28"],
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Pie
                  data={{
                    labels: ["Obsolètes", "À jour"],
                    datasets: [
                      {
                        data: [data.obsolescenceRate, 100 - data.obsolescenceRate],
                        backgroundColor: ["#FF8042", "#00C49F"],
                      },
                    ],
                  }}
                  options={pieChartOptions}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl text-center">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}