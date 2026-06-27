import { useContext } from 'react';
import { CalendarDays, ChartNoAxesCombined, LayoutGrid, Sparkles } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const items = [
  { id: 'tasks', label: 'Tasks', icon: LayoutGrid },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'ai', label: 'AI Meet', icon: Sparkles },
  { id: 'reports', label: 'Reports', icon: ChartNoAxesCombined },
];

function MobileBottomNav() {
  const { activeTab, switchGlobalTab } = useContext(AppContext);

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
      {items.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => switchGlobalTab(id)}
            className={`mobile-nav-item ${active ? 'mobile-nav-item-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
