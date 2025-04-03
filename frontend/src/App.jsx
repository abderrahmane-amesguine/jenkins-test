import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import './App.css';

export default function App() {
  const [data, setData] = useState({
    // KPIs existants
    encryptedAssets: 0,
    antivirusCoverage: 0,
    edrCoverage: 0,
    obsolescenceRate: 0,
    criticalObsoleteSystems: 0,
    mfaCoverage: 0,
    
    // Nouveaux KPIs de gestion des accès
    leastPrivilegeRate: 0,
    inactiveAccountsRemoved: 0,
    privilegedAccountsReviewed: 0,
    genericAccountsRate: 0,
    avgAccessRevocationTime: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Données simulées pour les nouveaux KPIs
  const simulatedAccessData = {
    
    accounts: [
      // Simulation de 100 comptes avec des attributs aléatoires
      ...Array(100).fill().map((_, i) => ({
        id: `acc_${i}`,
        is_least_privilege: Math.random() > 0.3, // 70% des comptes sont "least privilege"
        is_generic: Math.random() < 0.15, // 15% sont génériques
      }))
    ],
    inactiveAccounts: {
      total_inactive_accounts: 45,
      removed_accounts: 32
    },
    privilegedAccounts: {
      total_privileged_accounts: 25,
      reviewed_accounts: 20
    },
    accessRevocation: [
      // Simulation de 30 révocations avec des temps aléatoires
      ...Array(30).fill().map(() => ({
        revocation_time_hours: 2 + Math.random() * 24 // Entre 2 et 26 heures
      }))
    ]
  };

  // Données simulées pour MFA (puisque le CSV n'existe pas)
  const simulatedMfaData = {
    users: [
      // Simulation de 200 utilisateurs avec MFA activé ou non
      ...Array(200).fill().map((_, i) => ({
        status: Math.random() > 0.25 ? "activé" : "désactivé" // 75% ont MFA activé
      }))
    ]
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Simulation des données pour éviter les erreurs de fichiers manquants
        // En production, vous remplaceriez ceci par de véritables appels API

        // PARTIE ORIGINALE - SIMULÉE POUR LES TESTS
        // --------------------------------------------
        // Simulation des assets
        const assets = Array(500).fill().map((_, i) => ({
          id: `asset_${i}`,
          criticality: Math.random() > 0.7 ? "Critique" : "Normal",
          encryption: Math.random() > 0.4,
          os: Math.random() > 0.85 ? 
            "Windows 7" : (Math.random() > 0.9 ? "Server 2012" : "Windows 10")
        }));
        
        // Filtrer les assets critiques
        const criticalAssets = assets.filter(a => a.criticality === "Critique");
        const encryptedCriticalAssets = criticalAssets.filter(a => a.encryption);
        const obsolescenceCount = assets.filter(a => a.os.includes("Windows 7") || a.os.includes("Server 2012"));
        const criticalObsolete = criticalAssets.filter(a => 
          a.os.includes("Windows 7") || a.os.includes("Server 2012")
        );

        // Simulation EDR
        const edrData = Array(450).fill().map(() => ({
          edr_installed: Math.random() > 0.2
        }));
        const edrCoverage = (edrData.filter(e => e.edr_installed).length / edrData.length) * 100;

        // Simulation Antivirus data
        const avLines = Array(500).fill().map(() => 
          Math.random() > 0.15 ? "Protected" : "Vulnerable"
        );
        const protectedAssets = avLines.filter(line => line.includes("Protected")).length;
        const avCoverage = (protectedAssets / avLines.length) * 100;

        // Simulation MFA data
        const mfaLines = simulatedMfaData.users.map(u => u.status);
        const mfaEnabled = mfaLines.filter(line => line.includes("activé")).length;
        const mfaCoverage = (mfaEnabled / mfaLines.length) * 100;

        // NOUVEAUX CALCULS - UTILISANT LES DONNÉES SIMULÉES
        // --------------------------------------------------
        // Taux de comptes conformes au principe "least privilege"
        const leastPrivilegeAccounts = simulatedAccessData.accounts.filter(acc => acc.is_least_privilege === true);
        const leastPrivilegeRate = (leastPrivilegeAccounts.length / simulatedAccessData.accounts.length) * 100;
        
        // Taux de comptes inactifs supprimés
        const inactiveData = simulatedAccessData.inactiveAccounts;
        const inactiveAccountsRemoved = (inactiveData.removed_accounts / inactiveData.total_inactive_accounts) * 100;
        
        // Taux de revue des comptes à privilèges
        const privilegedData = simulatedAccessData.privilegedAccounts;
        const privilegedAccountsReviewed = (privilegedData.reviewed_accounts / privilegedData.total_privileged_accounts) * 100;
        
        // Taux de comptes génériques
        const genericAccountsCount = simulatedAccessData.accounts.filter(acc => acc.is_generic === true).length;
        const genericAccountsRate = (genericAccountsCount / simulatedAccessData.accounts.length) * 100;
        
        // Temps moyen de révocation des accès (en heures)
        const revocationData = simulatedAccessData.accessRevocation;
        const avgAccessRevocationTime = revocationData.reduce((sum, item) => 
          sum + item.revocation_time_hours, 0) / revocationData.length;

        // Mise à jour des données calculées
        setData({
          encryptedAssets: (encryptedCriticalAssets.length / criticalAssets.length) * 100,
          antivirusCoverage: avCoverage,
          edrCoverage,
          obsolescenceRate: (obsolescenceCount.length / assets.length) * 100,
          criticalObsoleteSystems: (criticalObsolete.length / criticalAssets.length) * 100,
          mfaCoverage,
          
          // Nouveaux KPIs
          leastPrivilegeRate,
          inactiveAccountsRemoved,
          privilegedAccountsReviewed,
          genericAccountsRate,
          avgAccessRevocationTime,
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

  const accessBarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'KPIs de Gestion des Accès',
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
            {/* Partie originale */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sécurité des Systèmes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[ 
                { title: "Assets Critiques Chiffrés", value: data.encryptedAssets },
                { title: "Couverture Antivirus", value: data.antivirusCoverage },
                { title: "Couverture EDR", value: data.edrCoverage },
                { title: "Taux d'Obsolescence", value: data.obsolescenceRate },
                { title: "Systèmes Critiques Obsolètes", value: data.criticalObsoleteSystems },
                { title: "Couverture MFA", value: data.mfaCoverage },
              ].map((stat, index) => (
                <StatCard 
                  key={index} 
                  title={stat.title} 
                  value={`${stat.value.toFixed(2)}%`} 
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Bar
                  data={{
                    labels: ["Assets Chiffrés", "Antivirus", "EDR", "MFA"],
                    datasets: [
                      {
                        label: "Couverture (%)",
                        data: [data.encryptedAssets, data.antivirusCoverage, data.edrCoverage, data.mfaCoverage],
                        backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"],
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

            {/* Nouvelle partie pour les KPIs de gestion des accès */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-12">Gestion des Accès</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[ 
                { title: "Comptes 'Least Privilege'", value: data.leastPrivilegeRate },
                { title: "Comptes Inactifs Supprimés", value: data.inactiveAccountsRemoved },
                { title: "Comptes à Privilèges Revus", value: data.privilegedAccountsReviewed },
                { title: "Taux de Comptes Génériques", value: data.genericAccountsRate },
                { title: "Temps Moyen Révocation (h)", value: data.avgAccessRevocationTime, isHours: true },
              ].map((stat, index) => (
                <StatCard 
                  key={index} 
                  title={stat.title} 
                  value={stat.isHours ? `${stat.value.toFixed(2)}h` : `${stat.value.toFixed(2)}%`} 
                />
              ))}
            </div>

            {/* Nouveau graphique pour les KPIs d'accès */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <Bar
                data={{
                  labels: [
                    "Comptes 'Least Privilege'", 
                    "Comptes Inactifs Supprimés", 
                    "Comptes à Privilèges Revus", 
                    "Comptes Génériques"
                  ],
                  datasets: [
                    {
                      label: "Taux (%)",
                      data: [
                        data.leastPrivilegeRate, 
                        data.inactiveAccountsRemoved, 
                        data.privilegedAccountsReviewed, 
                        data.genericAccountsRate
                      ],
                      backgroundColor: ["#4299E1", "#48BB78", "#F6AD55", "#FC8181"],
                    },
                  ],
                }}
                options={accessBarChartOptions}
              />
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