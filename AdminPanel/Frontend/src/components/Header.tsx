import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, User, Settings, Shield, LogOut, MapPin, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, userSession, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/auth');
  };

  const notifications = [
    {
      id: 1,
      title: "New Submission Received",
      message: "Establishment of Indian Multi-Disciplinary Partnership (MDP) firm, 2025 received 2 new stakeholder comments",
      time: "2 minutes ago",
      type: "submission",
      unread: true
    },
    {
      id: 2,
      title: "Analysis Complete",
      message: "Sentiment analysis completed for Insolvency & Bankruptcy Code consultation",
      time: "31 days ago",
      type: "analysis",
      unread: true
    },
    {
      id: 3,
      title: "System Update",
      message: "Platform maintenance scheduled for tonight 11 PM - 1 AM",
      time: "3 hours ago",
      type: "system",
      unread: false
    },
    {
      id: 4,
      title: "Weekly Report Ready",
      message: "Stakeholder engagement summary for week of Sep 23-29 is available",
      time: "1 day ago",
      type: "report",
      unread: false
    },
    {
      id: 5,
      title: "Consultation Deadline Reminder",
      message: "Establishment of Indian MDP firms consultation ends in 3 days",
      time: "2 days ago",
      type: "reminder",
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 py-3 fixed top-0 left-0 right-0 z-30 h-16">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden mr-3 text-slate-600 hover:text-slate-800"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <img 
          src="https://raw.githubusercontent.com/Ishaan145/Saaransh/main/saaransh-app/public/mca.png" 
          alt="MCA Emblem" 
          className="h-10 mr-2 sm:mr-4"
        />
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
            Project Saaransh
          </h1>
          <p className="text-xs text-slate-600 hidden sm:block">
            AI-powered sentiment analysis for MCA e-consultation feedback
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-5">
        <Button 
          onClick={() => navigate('/reports')}
          variant="outline" 
          size="sm"
          className="hidden md:flex"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
        
        <div className="hidden sm:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-100 rounded-lg pl-10 pr-4 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="text-slate-500 hover:text-slate-800 relative p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0 -right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-30">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.unread ? 'bg-blue-500' : 'bg-slate-300'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-200">
                <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 cursor-pointer p-1"
          >
            <img 
              src={user?.avatar || "https://placehold.co/40x40/E2E8F0/475569?text=U"} 
              alt="User Avatar" 
              className="rounded-full h-9 w-9" 
            />
            <div className="hidden md:block text-sm">
              <p className="font-semibold text-slate-700">{user?.name}</p>
              <p className="text-slate-500">{user?.role}</p>
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-30">
              <div className="p-3 border-b border-slate-200">
                <p className="font-semibold text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email}
                </p>
                {userSession && (
                  <div className="mt-2 text-xs text-slate-500 flex items-center">
                    <MapPin size={12} className="mr-1.5" />
                    Last login from {userSession.location}
                  </div>
                )}
              </div>
              <div className="p-2">
                <a 
                  href="#" 
                  onClick={() => handleMenuClick('/profile')} 
                  className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  <User size={16} className="mr-3" />
                  My Profile
                </a>
                <a 
                  href="#" 
                  onClick={() => handleMenuClick('/settings')} 
                  className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  <Settings size={16} className="mr-3" />
                  User Settings
                </a>
                <a 
                  href="#" 
                  onClick={() => handleMenuClick('/authorizations')} 
                  className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  <Shield size={16} className="mr-3" />
                  Authorizations
                </a>
              </div>
              <div className="border-t border-slate-200 p-2">
                <a 
                  href="#" 
                  onClick={handleLogout} 
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut size={16} className="mr-3" />
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;