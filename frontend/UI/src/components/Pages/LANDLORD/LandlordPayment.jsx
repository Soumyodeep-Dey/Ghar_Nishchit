import React, { useState, useEffect, useMemo } from 'react';
import LandlordSideBar from './LandlordSideBar';
import LandlordNavBar from './LandlordNavBar';
import { getCurrentYear } from '../../../utils/dateUtils.js';
import {
  CreditCard, IndianRupee, TrendingUp, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, Receipt, Crown, Building2, Users, Plus, Edit, Trash2, Wallet, Trophy, X, Check, Info, Database, ShieldCheck, Loader, RotateCcw, ArrowRight, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api.js';
import LandlordRazorpayCheckout from './LandlordRazorpayCheckout';

// Import the shared DarkModeContext instead of using custom theme hook
import { useDarkMode } from '../../../useDarkMode.js';
