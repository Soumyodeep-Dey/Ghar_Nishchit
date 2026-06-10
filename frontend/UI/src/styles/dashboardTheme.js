/**
 * Shared dashboard theme tokens aligned with landing page & auth.
 * Use these across LANDLORD and TENANT portal pages for visual consistency.
 */

export const dashboardTheme = {
  dark: {
    pageBg: 'bg-slate-950',
    pageBgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    loadingBg: 'from-slate-950 via-slate-900 to-slate-950',
    cardBg: 'bg-slate-900/80',
    cardBorder: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    textAccent: 'text-amber-400',
    headerTitle: 'text-white',
    headerGradient: 'from-amber-400 via-amber-500 to-amber-600',
    tabBg: 'bg-slate-900/60',
    tabBorder: 'border-slate-800',
    tabActive: 'bg-amber-500',
    tabActiveText: 'text-slate-950',
    tabInactive: 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10',
    buttonPrimary: 'from-amber-500 to-amber-600',
    buttonSecondary: 'from-slate-800 to-slate-900',
    iconAccent: 'text-amber-500',
    spinnerBorder: 'border-amber-500/30 border-t-amber-400',
    loadingText: 'text-amber-400/80',
    statCard: {
      cardBg: 'bg-slate-900/80',
      cardBorder: 'border-slate-800',
      iconBg: 'from-amber-500/20 to-amber-600/10',
      iconBorder: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-400',
      trendUp: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      trendDown: 'bg-slate-700/50 text-slate-400 border-slate-600/40',
    },
    metricCard: 'bg-slate-900/60 border-slate-800',
    metricColors: ['text-amber-400', 'text-amber-300', 'text-amber-500'],
    shellBg: 'from-slate-950/98 via-slate-900/98 to-slate-950/98',
    shellBorder: 'border-slate-800',
    menuIdle: 'hover:bg-slate-800/80 hover:border-slate-700/60',
    menuActive: 'from-amber-500 to-amber-600',
    navbar: 'bg-slate-950/80 border-slate-800',
    searchBg: 'bg-slate-800/50 border-slate-700',
    searchFocus: 'focus:border-amber-500',
    dropdown: 'bg-slate-900 border-slate-800',
    dropdownHover: 'hover:bg-slate-800',
    avatar: 'bg-gradient-to-br from-amber-400 to-amber-600',
    unreadBorder: 'border-amber-500 bg-amber-500/10',
    unreadDot: 'bg-amber-500',
  },
  light: {
    pageBg: 'bg-[#fafaf9]',
    pageBgGradient: 'from-[#fafaf9] via-white to-[#fafaf9]',
    loadingBg: 'from-[#fafaf9] via-white to-[#fafaf9]',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-100',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-500',
    textAccent: 'text-amber-600',
    headerTitle: 'text-slate-900',
    headerGradient: 'from-slate-900 via-slate-800 to-amber-700',
    tabBg: 'bg-white/80',
    tabBorder: 'border-slate-100',
    tabActive: 'bg-amber-500',
    tabActiveText: 'text-white',
    tabInactive: 'text-slate-600 hover:text-amber-600 hover:bg-amber-50',
    buttonPrimary: 'from-amber-500 to-amber-600',
    buttonSecondary: 'from-slate-900 to-slate-800',
    iconAccent: 'text-amber-600',
    spinnerBorder: 'border-amber-200 border-t-amber-500',
    loadingText: 'text-amber-700',
    statCard: {
      cardBg: 'bg-white',
      cardBorder: 'border-slate-100',
      iconBg: 'from-amber-50 to-amber-100/80',
      iconBorder: 'border-amber-200/60',
      iconColor: 'text-amber-600',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-500',
      trendUp: 'bg-amber-50 text-amber-700 border-amber-200',
      trendDown: 'bg-slate-100 text-slate-500 border-slate-200',
    },
    metricCard: 'bg-white border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]',
    metricColors: ['text-amber-600', 'text-amber-700', 'text-amber-500'],
    shellBg: 'from-white/98 via-[#fafaf9]/98 to-white/98',
    shellBorder: 'border-amber-100',
    menuIdle: 'hover:bg-amber-50/80 hover:border-amber-100',
    menuActive: 'from-amber-500 to-amber-600',
    navbar: 'bg-white/80 border-amber-100',
    searchBg: 'bg-slate-50/80 border-slate-100',
    searchFocus: 'focus:border-amber-500',
    dropdown: 'bg-white border-slate-100',
    dropdownHover: 'hover:bg-amber-50',
    avatar: 'bg-gradient-to-br from-amber-400 to-amber-600',
    unreadBorder: 'border-amber-500 bg-amber-50/50',
    unreadDot: 'bg-amber-500',
  },
};

export const getDashboardTheme = (isDark) => (isDark ? dashboardTheme.dark : dashboardTheme.light);

/** Decorative dot-pattern background used on landing/auth */
export const dotPatternStyle = {
  backgroundImage: 'radial-gradient(#d97706 0.5px, transparent 0.5px)',
  backgroundSize: '24px 24px',
};

/** Sidebar menu item accent — amber-first palette */
export const sidebarMenuColors = {
  dashboard: 'from-amber-400 to-amber-600',
  properties: 'from-amber-500 to-orange-600',
  tenants: 'from-amber-600 to-amber-700',
  payments: 'from-slate-800 to-slate-900',
  maintenance: 'from-amber-400 to-amber-500',
  messages: 'from-amber-500 to-amber-600',
  contracts: 'from-amber-600 to-orange-600',
};

/** Standard page wrapper classes for portal pages */
export const portalPageShell = (isDark) => {
  const t = getDashboardTheme(isDark);
  return {
    root: `min-h-screen bg-gradient-to-br ${t.pageBgGradient} flex relative transition-colors duration-500`,
    dotOverlay: 'absolute inset-0 opacity-[0.25] dark:opacity-[0.12] pointer-events-none',
    glow: 'absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none',
    main: 'flex-1 flex flex-col relative z-10 transition-all duration-700',
    content: 'flex-1 overflow-y-auto',
    section: 'p-6 space-y-8',
    card: `${t.cardBg} backdrop-blur-xl border ${t.cardBorder} rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)]`,
    cardPadding: 'p-8',
    heading: `text-3xl font-black tracking-tighter ${t.headerTitle}`,
    subheading: `text-lg ${t.textSecondary} font-medium`,
    btnPrimary: `bg-gradient-to-r ${t.buttonPrimary} text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all`,
    btnSecondary: `border-2 ${isDark ? 'border-slate-800 bg-slate-900/50 text-white hover:bg-slate-800' : 'border-slate-100 bg-white text-slate-900 hover:bg-slate-50'} font-black rounded-2xl transition-all`,
    input: isDark
      ? 'w-full px-4 py-3 rounded-2xl border-2 bg-slate-800/50 border-slate-700 focus:border-amber-500 text-white outline-none font-medium'
      : 'w-full px-4 py-3 rounded-2xl border-2 bg-slate-50/80 border-slate-100 focus:border-amber-500 text-slate-900 outline-none font-medium',
    badge: 'px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500 text-white',
    spinner: `w-12 h-12 border-4 ${t.spinnerBorder} rounded-full animate-spin`,
  };
};
