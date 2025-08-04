import React, { useState, useEffect, useRef, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { 
  Home, 
  DollarSign, 
  Users, 
  Wrench,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Eye,
  Plus,
  ArrowRight,
  Image,
  MapPin,
  Calendar,
  Star,
  Flame,
  ShieldCheck,
  Sparkles,
  Globe,
  Building2,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Hooks
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isIntersecting];
};

const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);
      setCount(currentCount);
      countRef.current = currentCount;
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  }, [end, duration, start]);
  
  return count;
};

// Animated Components
const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay, 
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20"
    animate={{
      y: [-20, -100],
      x: [0, Math.random() * 100 - 50],
      opacity: [0.2, 0.8, 0],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

const StatCard = ({ icon: Icon, title, value, change, trend, color, delay = 0, prefix = '', suffix = '' }) => {
  const animatedValue = useCountUp(parseInt(value) || 0);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 });
  
  // Use TrendingDown for downward trend
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={isVisible ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group ${color}`}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent group-hover:from-white/10 transition-all duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: 15 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.div 
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
              trend === 'up' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
          >
            <TrendIcon className="w-4 h-4" />
            <span>{change}</span>
          </motion.div>
        </div>
        
        <motion.h3 
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {prefix}{isVisible ? animatedValue : 0}{suffix}
        </motion.h3>
        
        <p className="text-white/70 font-medium">{title}</p>
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        />
      </div>
    </motion.div>
  );
};

const PropertyCard = ({ property, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group"
    >
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <motion.div
          className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Building2 className="w-20 h-20 text-white/50" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${
            property.status === 'Occupied' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            property.status === 'Available' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
            'bg-orange-500/20 text-orange-300 border border-orange-500/30'
          }`}
        >
          {property.status}
        </motion.div>
        
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-lg mb-1">{property.title}</h3>
          <div className="flex items-center space-x-1 text-sm text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{property.location}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-white">
            ${property.rent}<span className="text-sm text-white/60">/month</span>
          </div>
          <div className="flex items-center space-x-4 text-white/70">
            <span className="flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>{property.bedrooms} bed</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{property.tenants}</span>
            </span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <span>Manage Property</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const NotificationCard = ({ notification, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.02, x: 10 }}
    className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
  >
    <motion.div
      whileHover={{ rotate: 10, scale: 1.1 }}
      className={`p-2 rounded-lg ${
        notification.priority === 'high' ? 'bg-red-500/20 text-red-300' :
        notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
        'bg-green-500/20 text-green-300'
      }`}
    >
      {notification.priority === 'high' && <AlertTriangle className="w-5 h-5" />}
      {notification.priority === 'medium' && <Clock className="w-5 h-5" />}
      {notification.priority === 'low' && <CheckCircle className="w-5 h-5" />}
    </motion.div>
    
    <div className="flex-1">
      <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
        {notification.title}
      </h4>
      <p className="text-white/60 text-sm mt-1">{notification.message}</p>
      <span className="text-white/40 text-xs">{notification.time}</span>
    </div>
    
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 transition-all duration-200"
    >
      <Eye className="w-4 h-4 text-white/60" />
    </motion.button>
  </motion.div>
);

const MaintenanceRow = ({ request, delay = 0 }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
    className="border-b border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <td className="py-4 px-6">
      <div>
        <h4 className="font-semibold text-white">{request.title}</h4>
        <p className="text-white/60 text-sm">{request.description}</p>
      </div>
    </td>
    <td className="py-4 px-6 text-white/80">{request.property}</td>
    <td className="py-4 px-6 text-white/60">{request.date}</td>
    <td className="py-4 px-6">
      <span className={`px-3 py-1 rounded-full text-sm ${
        request.priority === 'High' ? 'bg-red-500/20 text-red-300' :
        request.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
        'bg-green-500/20 text-green-300'
      }`}>
        {request.priority}
      </span>
    </td>
    <td className="py-4 px-6">
      <span className={`px-3 py-1 rounded-full text-sm ${
        request.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
        request.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' :
        'bg-gray-500/20 text-gray-300'
      }`}>
        {request.status}
      </span>
    </td>
    <td className="py-4 px-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
      >
        View Details
      </motion.button>
    </td>
  </motion.tr>
);

const LandlordDashboard = () => {
  const [currentSection] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced mock data
  const stats = [
    { 
      icon: Building2, 
      title: 'Total Properties', 
      value: '24', 
      change: '+12%', 
      trend: 'up', 
      color: 'from-blue-500 to-indigo-600' 
    },
    { 
      icon: DollarSign, 
      title: 'Monthly Revenue', 
      value: '28500', 
      change: '+8.2%', 
      trend: 'up', 
      color: 'from-green-500 to-emerald-600',
      prefix: '$'
    },
    { 
      icon: Users, 
      title: 'Active Tenants', 
      value: '156', 
      change: '+5.1%', 
      trend: 'up', 
      color: 'from-purple-500 to-pink-600' 
    },
    { 
      icon: Wrench, 
      title: 'Maintenance Requests', 
      value: '8', 
      change: '-23%', 
      trend: 'down', 
      color: 'from-orange-500 to-red-600' 
    }
  ];

  const properties = [
    {
      id: 1,
      title: "Modern Downtown Loft",
      location: "Manhattan, NY",
      rent: 2800,
      bedrooms: 2,
      tenants: 2,
      status: "Occupied"
    },
    {
      id: 2,
      title: "Luxury Penthouse",
      location: "Brooklyn, NY",
      rent: 4200,
      bedrooms: 3,
      tenants: 1,
      status: "Available"
    },
    {
      id: 3,
      title: "Cozy Studio Apartment",
      location: "Queens, NY",
      rent: 1800,
      bedrooms: 1,
      tenants: 1,
      status: "Maintenance"
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "New Maintenance Request",
      message: "Tenant reported a leaky faucet in Apt 4B",
      time: "2 hours ago",
      priority: "high"
    },
    {
      id: 2,
      title: "Rent Payment Received",
      message: "Monthly rent payment from John Doe",
      time: "1 day ago",
      priority: "low"
    },
    {
      id: 3,
      title: "Property Inspection Due",
      message: "Annual inspection for Downtown Loft",
      time: "3 days ago",
      priority: "medium"
    }
  ];

  const maintenanceRequests = [
    {
      id: 1,
      title: "Plumbing Issue",
      description: "Kitchen sink is clogged",
      property: "Modern Downtown Loft",
      date: "2024-01-15",
      priority: "High",
      status: "In Progress"
    },
    {
      id: 2,
      title: "AC Repair",
      description: "Air conditioning not cooling",
      property: "Luxury Penthouse",
      date: "2024-01-14",
      priority: "Medium",
      status: "Pending"
    },
    {
      id: 3,
      title: "Light Fixture",
      description: "Replace broken light in hallway",
      property: "Cozy Studio",
      date: "2024-01-13",
      priority: "Low",
      status: "Completed"
    }
  ];

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-8"
          />
          <motion.h2
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl font-bold text-white mb-4"
          >
            Loading Dashboard...
          </motion.h2>
          <p className="text-white/60">Preparing your property insights</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      <LandlordSideBar currentSection={currentSection} />
      
      <div className="flex-1 flex flex-col relative z-10">
        <LandlordNavBar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <motion.h1
                className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Welcome Back, Landlord! 
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xl text-white/70 max-w-2xl mx-auto"
              >
                Your comprehensive property management dashboard with real-time insights and analytics
              </motion.p>
              
              {/* Floating icons */}
              <div className="relative mt-8">
                <motion.div
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-1/4 top-0"
                >
                  <Sparkles className="w-6 h-6 text-purple-400 opacity-60" />
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute right-1/4 top-0"
                >
                  <Star className="w-5 h-5 text-blue-400 opacity-60" />
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <StatCard
                  key={stat.title}
                  {...stat}
                  delay={index * 0.1}
                />
              ))}
            </div>

            {/* Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex space-x-4 mb-8 bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-white/10"
            >
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'properties', label: 'Properties', icon: Building2 },
                { key: 'notifications', label: 'Notifications', icon: Bell },
                { key: 'maintenance', label: 'Maintenance', icon: Wrench }
              ].map(({ key, label, icon: Icon }) => (
                <motion.button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Quick Actions */}
                  <AnimatedCard className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                      <Flame className="w-8 h-8 text-orange-400" />
                      <span>Quick Actions</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Add New Property', icon: Plus, color: 'from-green-500 to-emerald-600' },
                        { label: 'Schedule Inspection', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
                        { label: 'Generate Report', icon: BarChart3, color: 'from-purple-500 to-pink-600' }
                      ].map((action, index) => (
                        <motion.button
                          key={action.label}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          className={`p-6 bg-gradient-to-br ${action.color} rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group`}
                        >
                          <action.icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </AnimatedCard>

                  {/* Performance Metrics */}
                  <AnimatedCard delay={0.2} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                      <span>Performance Overview</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-green-400 mb-2">94%</div>
                        <div className="text-white/70">Occupancy Rate</div>
                      </div>
                      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-blue-400 mb-2">4.8</div>
                        <div className="text-white/70">Avg Rating</div>
                      </div>
                      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-purple-400 mb-2">2.1</div>
                        <div className="text-white/70">Avg Response (hrs)</div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'properties' && (
                <motion.div
                  key="properties"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedCard className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                        <Building2 className="w-10 h-10 text-blue-400" />
                        <span>Your Properties</span>
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Property</span>
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                      {properties.map((property, index) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          delay={index * 0.1}
                        />
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedCard className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center space-x-3">
                      <Bell className="w-10 h-10 text-yellow-400" />
                      <span>Recent Notifications</span>
                    </h2>

                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          delay={index * 0.1}
                        />
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center mt-8"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
                      >
                        View All Notifications
                      </motion.button>
                    </motion.div>
                  </AnimatedCard>
                </motion.div>
              )}

              {activeTab === 'maintenance' && (
                <motion.div
                  key="maintenance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedCard className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl overflow-hidden">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center space-x-3">
                      <Wrench className="w-10 h-10 text-orange-400" />
                      <span>Maintenance Requests</span>
                    </h2>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left py-4 px-6 text-white/80 font-semibold">Request</th>
                            <th className="text-left py-4 px-6 text-white/80 font-semibold">Property</th>
                            <th className="text-left py-4 px-6 text-white/80 font-semibold">Date</th>
                            <th className="text-left py-4 px-6 text-white/80 font-semibold">Priority</th>
                            <th className="text-left py-4 px-6 text-white/80 font-semibold">Status</th>
                            <th className="text-left py-4 px-6 text-white/80 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {maintenanceRequests.map((request, index) => (
                            <MaintenanceRow
                              key={request.id}
                              request={request}
                              delay={index * 0.1}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AnimatedCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandlordDashboard;
