import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, BarChart3, Settings, Menu, X, Cat } from 'lucide-react';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/log', label: 'Content Log', icon: FileText },
  { to: '/prompts', label: 'Prompts', icon: MessageSquare },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavItem({ link, end, onClick, gap }) {
  const IconComponent = link.icon;
  return (
    <NavLink
      to={link.to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-${gap} px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <IconComponent className="w-4 h-4" />
      {link.label}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Cat className="w-6 h-6" />
            Content Cat
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavItem key={link.to} link={link} end={link.to === '/'} gap="2" />
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 px-4 pb-4 pt-2 space-y-1">
          {links.map((link) => (
            <NavItem
              key={link.to}
              link={link}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              gap="3"
            />
          ))}
        </div>
      )}
    </nav>
  );
}
