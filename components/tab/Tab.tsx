import React from "react";

interface TabProps {
  tabs: { label: string; content: React.ReactNode }[];
}

const Tab: React.FC<TabProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div>
      {/* --- Tab Buttons --- */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`relative px-4 py-2 text-sm font-semibold transition-colors
              ${
                index === activeTab
                  ? "text-black"
                  : "text-red-600 hover:text-black"
              }`}
          >
            {tab.label}
            {index === activeTab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* --- Tab Content --- */}
      <div className="py-4">{tabs[activeTab]?.content}</div>
    </div>
  );
};

export default Tab;
