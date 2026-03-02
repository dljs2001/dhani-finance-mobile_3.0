import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="w-full max-w-md mx-auto min-h-screen flex flex-col relative md:max-w-xl shadow-2xl bg-white overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;