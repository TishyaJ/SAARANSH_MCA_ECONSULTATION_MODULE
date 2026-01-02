import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Users } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

interface ConsultationItem {
  id: number;
  bill?: string;
  title: string;
  status: string;
  submissions?: number;
}

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/consultations`);
        const json = await res.json();
        if (json.ok) {
          setConsultations(json.data || []);
        } else {
          setConsultations([]);
        }
      } catch (e) {
        console.error('Failed to fetch consultations', e);
        setConsultations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);


  const location = useLocation();
  
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <aside className={`bg-slate-50 border-r border-slate-200 w-72 fixed top-16 left-0 h-[calc(100vh-4rem)] p-4 flex flex-col z-20 transform ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <nav className="flex-grow overflow-y-auto">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu</h2>
        <ul>
          <li>
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center p-3 my-1 rounded-lg transition-colors text-sm ${
                location.pathname === '/' 
                  ? 'bg-blue-100 text-blue-800 font-semibold' 
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Home size={18} className="mr-3" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/trends"
              onClick={handleLinkClick}
              className={`flex items-center p-3 my-1 rounded-lg transition-colors text-sm ${
                location.pathname === '/trends' 
                  ? 'bg-blue-100 text-blue-800 font-semibold' 
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              <TrendingUp size={18} className="mr-3" />
              <span>Trend Analysis</span>
            </Link>
          </li>
        </ul>
        
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Stakeholders</h2>
        <ul>
          <li>
            <Link
              to="/stakeholderanalytics"
              onClick={handleLinkClick}
              className={`flex items-center p-3 my-1 rounded-lg transition-colors text-sm ${
                location.pathname === '/stakeholderanalytics' 
                  ? 'bg-blue-100 text-blue-800 font-semibold' 
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Users size={18} className="mr-3" />
              <span>Stakeholder Analytics</span>
            </Link>
          </li>
        </ul>
        
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Consultations</h2>
        <ul>
          {consultations.map(consultation => (
            <li key={consultation.id}>
              <Link
                to={`/consultation/${consultation.id}`}
                onClick={handleLinkClick}
                className={`flex flex-col p-3 my-1 rounded-lg transition-colors text-sm ${
                  location.pathname === `/consultation/${consultation.id}` 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'hover:bg-slate-200'
                }`}
              >
                <span className={`font-semibold ${
                  location.pathname === `/consultation/${consultation.id}` ? '' : 'text-slate-700'
                }`}>
                  {consultation.title}
                </span>
                <span className={`text-xs mt-1 ${
                  location.pathname === `/consultation/${consultation.id}` ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {consultation.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="text-center text-xs text-slate-400 p-4">
        <p>&copy; 2025 Ministry of Corporate Affairs</p>
      </div>
    </aside>
  );
};

export default Sidebar;