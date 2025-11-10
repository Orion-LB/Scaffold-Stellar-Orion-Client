import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Activity,
  RefreshCw,
  Play,
  Square,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const BotMonitoring = () => {
  const [bots, setBots] = useState([
    {
      id: "oracle_bot",
      name: "Oracle Price Bot",
      icon: TrendingUp,
      status: "running",
      uptime: "23h 45m",
      lastUpdate: "12 seconds ago",
      updates: 1234,
      color: "blue",
      description: "Updates RWA asset prices every 60 seconds",
      config: {
        interval: "60 seconds",
        assets: "3 assets",
        lastPrice: "$1.05 (Invoice RWA)",
      },
    },
    {
      id: "liquidation_bot",
      name: "Liquidation Bot",
      icon: Shield,
      status: "running",
      uptime: "23h 45m",
      lastUpdate: "3 seconds ago",
      updates: 845,
      color: "red",
      description: "Monitors loan health and triggers liquidations",
      config: {
        interval: "30 seconds",
        threshold: "Health < 1.10",
        monitored: "6 active loans",
      },
    },
    {
      id: "autorepay_bot",
      name: "Auto-Repay Bot",
      icon: Zap,
      status: "running",
      uptime: "23h 45m",
      lastUpdate: "18 seconds ago",
      updates: 567,
      color: "green",
      description: "Automatically repays loans using vault yields",
      config: {
        interval: "120 seconds",
        vaults: "3 vaults monitored",
        repayments: "12 today",
      },
    },
  ]);

  const handleToggleBot = async (botId: string) => {
    setBots(prev =>
      prev.map(bot =>
        bot.id === botId
          ? { ...bot, status: bot.status === "running" ? "stopped" : "running" }
          : bot
      )
    );

    const bot = bots.find(b => b.id === botId);
    const newStatus = bot?.status === "running" ? "stopped" : "running";

    toast.success(
      `${bot?.name} ${newStatus === "running" ? "started" : "stopped"}!`
    );
  };

  const handleRestartBot = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    toast.info(`Restarting ${bot?.name}...`);

    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`${bot?.name} restarted successfully!`);
  };

  const handleRestartAll = async () => {
    toast.info("Restarting all bots...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("All bots restarted successfully!");
  };

  const colorClasses = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      border: "border-red-200",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      border: "border-green-200",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-plus-jakarta text-2xl font-bold text-gray-900 mb-2">
            Bot Monitoring
          </h2>
          <p className="text-gray-600">
            Monitor and control automated platform bots
          </p>
        </div>
        <Button
          onClick={handleRestartAll}
          className="bg-primary hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Restart All Bots
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-gray-900">
              All Systems
            </span>
          </div>
          <div className="font-antic text-2xl font-bold text-green-600">
            Operational
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Running Bots
            </span>
          </div>
          <div className="font-antic text-3xl font-bold text-gray-900">
            {bots.filter(b => b.status === "running").length}/{bots.length}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-900">
              Total Updates
            </span>
          </div>
          <div className="font-antic text-3xl font-bold text-gray-900">
            {bots.reduce((sum, b) => sum + b.updates, 0)}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-gray-900">
              Alerts
            </span>
          </div>
          <div className="font-antic text-3xl font-bold text-gray-900">0</div>
        </div>
      </div>

      {/* Bot Cards */}
      <div className="space-y-4">
        {bots.map((bot) => {
          const Icon = bot.icon;
          const colors = colorClasses[bot.color as keyof typeof colorClasses];
          const isRunning = bot.status === "running";

          return (
            <div
              key={bot.id}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${colors.bg}`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">
                        {bot.name}
                      </h3>
                      {isRunning ? (
                        <div className="flex items-center gap-2 px-2 py-1 bg-green-100 rounded">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-semibold text-green-700">
                            Running
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          <span className="text-xs font-semibold text-gray-700">
                            Stopped
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {bot.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(bot.config).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-gray-600 capitalize mb-1">
                            {key.replace(/([A-Z])/g, " $1")}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleBot(bot.id)}
                    variant={isRunning ? "outline" : "default"}
                    size="sm"
                    className={isRunning ? "" : "bg-green-600 hover:bg-green-700"}
                  >
                    {isRunning ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRestartBot(bot.id)}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">Uptime:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {bot.uptime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Update:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {bot.lastUpdate}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Updates:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {bot.updates.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bot Logs */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900 mb-4">
          Recent Bot Activity
        </h3>
        <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
          {[
            { time: "14:32:15", bot: "Oracle Bot", message: "Updated Invoice RWA price to $1.05" },
            { time: "14:32:08", bot: "Liquidation Bot", message: "Checked 6 loans, all healthy" },
            { time: "14:31:55", bot: "Auto-Repay Bot", message: "Processed repayment for 0x4c5b..." },
            { time: "14:31:15", bot: "Oracle Bot", message: "Updated T-Bills price to $1.02" },
            { time: "14:30:45", bot: "Liquidation Bot", message: "Health factor check: all clear" },
            { time: "14:30:15", bot: "Oracle Bot", message: "Updated Real Estate price to $1.08" },
          ].map((log, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 bg-gray-50 rounded"
            >
              <span className="text-gray-500">[{log.time}]</span>
              <span className="text-primary font-semibold">{log.bot}:</span>
              <span className="text-gray-700">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Info */}
      <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
        <h3 className="font-plus-jakarta text-sm font-semibold text-blue-900 mb-3">
          🔧 Bot Environment
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Network:</strong> Stellar Testnet
          </div>
          <div>
            <strong>Node Version:</strong> v18.17.0
          </div>
          <div>
            <strong>Server:</strong> AWS EC2 (us-east-1)
          </div>
          <div>
            <strong>Logs:</strong> /var/log/orion-bots/
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotMonitoring;
