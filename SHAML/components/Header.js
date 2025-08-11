import { Moon, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">&lt;&gt;</span>
        </div>
        <span className="text-gray-800 font-semibold text-lg">Zen Coders</span>
      </div>

      {/* User Controls */}
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Moon className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">U2</span>
          </div>
          <span className="text-gray-700 text-sm">user@2025</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 