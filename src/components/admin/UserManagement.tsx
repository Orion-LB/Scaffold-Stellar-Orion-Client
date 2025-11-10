import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, UserCheck, Search, X } from "lucide-react";
import { toast } from "sonner";

const UserManagement = () => {
  const [newUserAddress, setNewUserAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isWhitelisting, setIsWhitelisting] = useState(false);

  const [whitelistedUsers, setWhitelistedUsers] = useState([
    {
      address: "GCDNZ...XYZ123",
      addedDate: "2024-01-15",
      status: "active",
      totalStaked: "15,230",
      loans: 2,
    },
    {
      address: "GBVKL...ABC456",
      addedDate: "2024-01-14",
      status: "active",
      totalStaked: "8,500",
      loans: 1,
    },
    {
      address: "GAXYZ...DEF789",
      addedDate: "2024-01-13",
      status: "active",
      totalStaked: "22,100",
      loans: 3,
    },
  ]);

  const handleWhitelistUser = async () => {
    if (!newUserAddress || newUserAddress.length < 10) {
      toast.error("Please enter a valid Stellar address");
      return;
    }

    setIsWhitelisting(true);
    try {
      // Simulate whitelisting
      await new Promise(resolve => setTimeout(resolve, 1500));

      setWhitelistedUsers(prev => [
        ...prev,
        {
          address: newUserAddress,
          addedDate: new Date().toISOString().split('T')[0],
          status: "active",
          totalStaked: "0",
          loans: 0,
        },
      ]);

      toast.success("User whitelisted successfully!");
      setNewUserAddress("");
    } catch (error: any) {
      toast.error(error.message || "Whitelisting failed");
    } finally {
      setIsWhitelisting(false);
    }
  };

  const handleRemoveUser = async (address: string) => {
    try {
      setWhitelistedUsers(prev => prev.filter(u => u.address !== address));
      toast.success("User removed from whitelist");
    } catch (error: any) {
      toast.error("Failed to remove user");
    }
  };

  const filteredUsers = whitelistedUsers.filter(user =>
    user.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-plus-jakarta text-2xl font-bold text-gray-900 mb-2">
          User Management
        </h2>
        <p className="text-gray-600">
          Whitelist and manage platform users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Total Users
            </span>
          </div>
          <div className="font-antic text-3xl font-bold text-gray-900">
            {whitelistedUsers.length}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-gray-900">
              Active Users
            </span>
          </div>
          <div className="font-antic text-3xl font-bold text-gray-900">
            {whitelistedUsers.filter(u => u.status === "active").length}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Total Staked
            </span>
          </div>
          <div className="font-antic text-2xl font-bold text-gray-900">
            ${whitelistedUsers.reduce((sum, u) => sum + parseFloat(u.totalStaked.replace(/,/g, '')), 0).toLocaleString()}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Active Loans
            </span>
          </div>
          <div className="font-antic text-3xl font-bold text-gray-900">
            {whitelistedUsers.reduce((sum, u) => sum + u.loans, 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[350px_1fr] gap-6">
        {/* Whitelist New User */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white h-fit">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">
              Whitelist User
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Stellar Address
              </label>
              <input
                type="text"
                value={newUserAddress}
                onChange={(e) => setNewUserAddress(e.target.value)}
                placeholder="GCDNZ..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleWhitelistUser}
              disabled={isWhitelisting || !newUserAddress}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isWhitelisting ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2 animate-pulse" />
                  Whitelisting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Whitelist User
                </>
              )}
            </Button>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Whitelisted users can mint RWA tokens
                and stake them in vaults. Remove users to revoke access.
              </p>
            </div>
          </div>
        </div>

        {/* Whitelisted Users List */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">
              Whitelisted Users ({filteredUsers.length})
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Address
              </div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Added Date
              </div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Total Staked
              </div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Active Loans
              </div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Action
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div
                  key={user.address}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <code className="text-sm text-gray-900 font-mono">
                      {user.address}
                    </code>
                  </div>
                  <div className="text-sm text-gray-700 flex items-center">
                    {user.addedDate}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 flex items-center">
                    ${user.totalStaked}
                  </div>
                  <div className="text-sm text-gray-700 flex items-center">
                    {user.loans} {user.loans === 1 ? "loan" : "loans"}
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleRemoveUser(user.address)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove user"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {searchQuery
                      ? "No users found matching your search"
                      : "No users whitelisted yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
