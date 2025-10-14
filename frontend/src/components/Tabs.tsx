import React, { useState } from 'react'

export interface TabProps {
  label: string
  children: React.ReactNode
  icon?: string
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <div>{children}</div>
}

interface TabsProps {
  children: React.ReactElement<TabProps>[]
  defaultTab?: number
}

const Tabs: React.FC<TabsProps> = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700 mb-6">
        {children.map((child, index) => {
          const isActive = index === activeTab

          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                px-6 py-3 font-medium text-sm transition-all relative
                ${
                  isActive
                    ? 'text-science-accent border-b-2 border-science-accent'
                    : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              {child.props.icon && (
                <span className="mr-2">{child.props.icon}</span>
              )}
              {child.props.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="py-4">{children[activeTab]}</div>
    </div>
  )
}

export default Tabs
