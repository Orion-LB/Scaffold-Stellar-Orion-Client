import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Server,
  Database,
  DollarSign,
  Users,
  Activity,
  Settings,
  CheckCircle,
  AlertCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import HeroBackground from "@/components/HeroBackground";
import ContractDeployment from "@/components/admin/ContractDeployment";
import ContractInitialization from "@/components/admin/ContractInitialization";
import FundingManagement from "@/components/admin/FundingManagement";
import OracleManagement from "@/components/admin/OracleManagement";
import UserManagement from "@/components/admin/UserManagement";
import BotMonitoring from "@/components/admin/BotMonitoring";
import SystemOverview from "@/components/admin/SystemOverview";

type AdminSection =
  | "overview"
  | "deploy"
  | "initialize"
  | "funding"
  | "oracle"
  | "users"
  | "bots";

const Admin = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  const navItems = [
    { id: "overview" as const, label: "Overview", icon: Activity },
    { id: "deploy" as const, label: "Deploy Contracts", icon: Server },
    { id: "initialize" as const, label: "Initialize", icon: Database },
    { id: "funding" as const, label: "Funding", icon: DollarSign },
    { id: "oracle" as const, label: "Oracle", icon: TrendingUp },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "bots" as const, label: "Bots", icon: Settings },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <SystemOverview />;
      case "deploy":
        return <ContractDeployment />;
      case "initialize":
        return <ContractInitialization />;
      case "funding":
        return <FundingManagement />;
      case "oracle":
        return <OracleManagement />;
      case "users":
        return <UserManagement />;
      case "bots":
        return <BotMonitoring />;
      default:
        return <SystemOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroBackground />

      {/* Header */}
      <div className="relative z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-plus-jakarta text-2xl font-bold text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600">
                  Orion Platform Administration
                </p>
              </div>
            </div>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Admin Access
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-3">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-plus-jakarta text-sm">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
              <h3 className="font-plus-jakarta text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contracts</span>
                  <span className="text-sm font-semibold text-green-600">
                    9/9
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bots</span>
                  <span className="text-sm font-semibold text-green-600">
                    3/3
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Oracle</span>
                  <span className="text-sm font-semibold text-green-600">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;
