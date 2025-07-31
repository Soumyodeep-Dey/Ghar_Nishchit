import React from 'react';

const TenantDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-200 dark:border-gray-700">
          Tenant Dashboard
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <a href="#overview" className="px-4 py-2 rounded hover:bg-indigo-600 hover:text-white transition">
            Overview
          </a>
          <a href="#rent" className="px-4 py-2 rounded hover:bg-indigo-600 hover:text-white transition">
            Upcoming Rent
          </a>
          <a href="#maintenance" className="px-4 py-2 rounded hover:bg-indigo-600 hover:text-white transition">
            Maintenance Requests
          </a>
          <a href="#payments" className="px-4 py-2 rounded hover:bg-indigo-600 hover:text-white transition">
            Payment History
          </a>
          <a href="#profile" className="px-4 py-2 rounded hover:bg-indigo-600 hover:text-white transition">
            Profile Settings
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Welcome back, Tenant!</h1>
          <p className="text-gray-600 dark:text-gray-400">Here is your dashboard overview.</p>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Upcoming Rent</h2>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">$1,200</p>
            <p className="text-gray-500 dark:text-gray-400 mt-auto">Due Date: 15th Aug 2024</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Maintenance Requests</h2>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">2 Open</p>
            <p className="text-gray-500 dark:text-gray-400 mt-auto">Last request: 1 day ago</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Messages</h2>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">5 Unread</p>
            <p className="text-gray-500 dark:text-gray-400 mt-auto">From landlord</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Lease Ends</h2>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Dec 31, 2024</p>
            <p className="text-gray-500 dark:text-gray-400 mt-auto">Renewal options available</p>
          </div>
        </section>

        {/* Detailed sections */}
        <section id="overview" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Manage your rental property details, payments, and maintenance requests all in one place.
          </p>
        </section>

        <section id="rent" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Upcoming Rent</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-700 dark:text-gray-300">
              Your next rent payment of <span className="font-semibold">$1,200</span> is due on <span className="font-semibold">15th Aug 2024</span>.
            </p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
              Pay Now
            </button>
          </div>
        </section>

        <section id="maintenance" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Maintenance Requests</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <div className="border-b border-gray-300 dark:border-gray-700 pb-3">
              <h3 className="font-semibold">Leaky Faucet</h3>
              <p className="text-gray-600 dark:text-gray-400">Reported 2 days ago - Status: In Progress</p>
            </div>
            <div>
              <h3 className="font-semibold">Heating Issue</h3>
              <p className="text-gray-600 dark:text-gray-400">Reported 5 days ago - Status: Pending</p>
            </div>
          </div>
        </section>

        <section id="payments" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Payment History</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">Date</th>
                  <th className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">Amount</th>
                  <th className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">2024-07-15</td>
                  <td className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">$1,200</td>
                  <td className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">Paid</td>
                </tr>
                <tr>
                  <td className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">2024-06-15</td>
                  <td className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">$1,200</td>
                  <td className="border-b border-gray-300 dark:border-gray-700 py-2 px-4">Paid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="profile" className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-700 dark:text-gray-300">Update your personal information and preferences.</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
              Edit Profile
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TenantDashboard;
