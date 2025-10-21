import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  accentColor?: 'cyan' | 'green' | 'pink' | 'purple' | 'orange';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  accentColor = 'cyan',
  className = ''
}) => {
  const colorClasses = {
    cyan: 'bg-accent-cyan/5 border-accent-cyan/20',
    green: 'bg-accent-green/5 border-accent-green/20',
    pink: 'bg-accent-pink/5 border-accent-pink/20',
    purple: 'bg-accent-purple/5 border-accent-purple/20',
    orange: 'bg-accent-orange/5 border-accent-orange/20'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-16 text-center ${className}`}>
      <div className={`mb-6 p-6 rounded-2xl border ${colorClasses[accentColor]} transition-all hover:scale-105`}>
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md text-base">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
