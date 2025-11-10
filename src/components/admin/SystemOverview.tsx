import { Activity, CheckCircle, AlertTriangle, Server, Users, DollarSign } from "lucide-react";

const SystemOverview = () => {
  const stats = [
    {
      label: "Total Contracts",
      value: "12",
      subtext: "9 deployed, 3 shared",
      icon: Server,
      color: "blue",
    },
    {
      label: "Active Users",
      value: "24",
      subtext: "Whitelisted addresses",
      icon: Users,
      color: "green",
    },
    {
      label: "TVL (Total Value Locked)",
      value: "$125,450",
      subtext: "Across all vaults",
      icon: DollarSign,
      color: "purple",
    },
    {
      label: "System Health",
      value: "100%",
      subtext: "All systems operational",
      icon: Activity,
      color: "emerald",
    },
  ];

  const deploymentStatus = [
    { name: "RWA Invoice Token", address: "CCHUQ75...FBFVV", status: "deployed" },
    { name: "RWA T-Bills Token", address: "Pending", status: "pending" },
    { name: "RWA Real Estate Token", address: "Pending", status: "pending" },
    { name: "stRWA Invoice Token", address: "CCCTL6U...PJUS", status: "deployed" },
    { name: "stRWA T-Bills Token", address: "Pending", status: "pending" },
    { name: "stRWA Real Estate Token", address: "Pending", status: "pending" },
    { name: "Vault Invoice", address: "CB3I43A...H2TT", status: "deployed" },
    { name: "Vault T-Bills", address: "Pending", status: "pending" },
    { name: "Vault Real Estate", address: "Pending", status: "pending" },
  ];

  const botStatus = [
    { name: "Oracle Price Bot", status: "running", lastUpdate: "2 min ago" },
    { name: "Liquidation Bot", status: "running", lastUpdate: "1 min ago" },
    { name: "Auto-Repay Bot", status: "running", lastUpdate: "3 min ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-plus-jakarta text-2xl font-bold text-gray-900 mb-2">
          System Overview
        </h2>
        <p className="text-gray-600">
          Monitor platform health and deployment status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            purple: "bg-purple-100 text-purple-600",
            emerald: "bg-emerald-100 text-emerald-600",
          };

          return (
            <div
              key={stat.label}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="font-antic text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-600">{stat.subtext}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Deployment Status */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900 mb-4">
            Contract Deployment Status
          </h3>
          <div className="space-y-2">
            {deploymentStatus.map((contract, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {contract.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {contract.address}
                  </div>
                </div>
                {contract.status === "deployed" ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-semibold">Deployed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded text-yellow-700">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-xs font-semibold">Pending</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bot Status */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900 mb-4">
            Bot Status
          </h3>
          <div className="space-y-4">
            {botStatus.map((bot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {bot.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Last update: {bot.lastUpdate}
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1 bg-green-100 rounded text-green-700 text-xs font-semibold">
                  Running
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                Restart Bots
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                View Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;
