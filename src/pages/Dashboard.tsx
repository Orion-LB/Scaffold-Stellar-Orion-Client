import { useState } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StakeSection from "@/components/dashboard/StakeSection";
import BorrowSection from "@/components/dashboard/BorrowSection";
import ProfileSection from "@/components/dashboard/ProfileSection";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<'stake' | 'borrow' | 'profile'>('stake');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'stake':
        return <StakeSection />;
      case 'borrow':
        return <BorrowSection />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <StakeSection />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background">
      <DashboardNavbar />
      
      <div className="relative h-full pt-16">
        {/* Base Layer - Sidebar */}
        <DashboardSidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        
        {/* Top Layer - Main Dashboard Content */}
        <main 
          className={`f  overflow-hidden z-20  ${
            sidebarCollapsed 
              ? 'left-14' // Overlap sidebar when collapsed (16px + 16px margin = 32px, overlap at 56px)
              : 'left-56' // Overlap sidebar when expanded (256px + 16px margin = 272px, overlap at 224px)
          }`}
        >
          <div className="h-full p-6 md:p-8 overflow-hidden">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;