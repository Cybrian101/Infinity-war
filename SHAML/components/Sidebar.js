import { 
  LayoutDashboard, 
  Upload, 
  Briefcase,
  ClipboardList, 
  TrendingUp, 
  Link, 
  Trophy, 
  Medal, 
  Settings 
} from 'lucide-react';

const Sidebar = ({ activePage = 'resume-upload' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume-upload', label: 'Resume Upload', icon: Upload },
    { id: 'create-vacancy', label: 'Create Vacancy', icon: Briefcase },
    { id: 'assessments', label: 'Assessments', icon: ClipboardList },
    { id: 'progress-tracker', label: 'Progress Tracker', icon: TrendingUp },
    { id: 'learning-path', label: 'Learning Path', icon: Link },
    { id: 'hackathons', label: 'Hackathons', icon: Trophy },
    { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <li key={item.id}>
                <a
                  href={`/${item.id}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 