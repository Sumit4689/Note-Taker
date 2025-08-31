import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from './Logo';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Logo size={32} />
            <span className="ml-2 text-xl font-bold text-primary">HD</span>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
