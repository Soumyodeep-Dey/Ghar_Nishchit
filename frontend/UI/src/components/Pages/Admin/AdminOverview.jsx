import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Home, FileText, IndianRupee, AlertTriangle, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6'];

const StatCard = ({ icon: Icon, label, value, sub, color, onClick, active }) => (
  <div
    onClick={onClick}
    className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${active ? 'border-indigo-500 scale-105 shadow-xl' : 'border-transparent hover:scale-102 hover:shadow-lg'} ${color} text-white`}
  >
    <div className="flex items-center gap-4">
      <div className="bg-white/20 p-3 rounded-xl"><Icon size={28} /></div>
      <div>
        <p className="text-sm opacity-80">{label}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
        {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

export default function AdminOverview({ analytics, setActiveTab }) {
  const a = analytics || {};
  const totalUsers     = a.totalUsers     ?? 0;
  const totalLandlords = a.totalLandlords ?? 0;
  const totalTenants   = a.totalTenants   ?? 0;
  const totalRevenue   = a.totalRevenue   ?? 0;
  const occupiedProperties  = a.occupiedProperties  ?? 0;
  const availableProperties = a.availableProperties ?? 0;
  const slaBreaches    = a.slaBreaches    ?? 0;
  const failedPayments = a.failedPayments ?? 0;
  const monthlyGrowth  = a.monthlyGrowth  ?? [];

  const pieData = [
    { name: 'Landlords', value: totalLandlords },
    { name: 'Tenants',   value: totalTenants },
  ];
  const occupancyData = [
    { name: 'Occupied',  value: occupiedProperties },
    { name: 'Available', value: availableProperties },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} sub={`${totalLandlords}L / ${totalTenants}T`} color="bg-indigo-600" onClick={() => setActiveTab('users')} />
        <StatCard icon={Home} label="Properties" value={occupiedProperties + availableProperties} sub={`${occupiedProperties} occupied`} color="bg-teal-600" onClick={() => setActiveTab('properties')} />
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${(totalRevenue / 1000).toFixed(0)}k`} sub="Paid transactions" color="bg-violet-600" onClick={() => setActiveTab('payments')} />
        <StatCard icon={FileText} label="Contracts" value={a.totalContracts ?? 0} sub={`${a.activeContracts ?? 0} active`} color="bg-rose-600" onClick={() => setActiveTab('contracts')} />
        <StatCard icon={AlertTriangle} label="SLA Breaches" value={slaBreaches} sub=">7 days open" color={slaBreaches > 0 ? 'bg-amber-600' : 'bg-green-600'} onClick={() => setActiveTab('maintenance')} />
        <StatCard icon={TrendingUp} label="Failed Payments" value={failedPayments} sub="Need attention" color={failedPayments > 0 ? 'bg-red-700' : 'bg-green-600'} onClick={() => setActiveTab('payments')} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
          <h3 className="font-bold text-base mb-4 text-gray-700 dark:text-gray-200">Platform Growth (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="#e0e7ff" name="New Users" />
              <Area type="monotone" dataKey="properties" stroke="#14b8a6" fill="#ccfbf1" name="New Properties" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Charts */}
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow flex-1">
            <h3 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-200">User Roles</h3>
            <ResponsiveContainer width="100%" height={90}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow flex-1">
            <h3 className="font-bold text-sm mb-2 text-gray-700 dark:text-gray-200">Occupancy</h3>
            <ResponsiveContainer width="100%" height={90}>
              <PieChart><Pie data={occupancyData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {occupancyData.map((_, i) => <Cell key={i} fill={COLORS[i + 2]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
        <h3 className="font-bold text-base mb-4 text-gray-700 dark:text-gray-200">Monthly Revenue (₹)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Bar dataKey="payments" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
