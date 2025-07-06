import React from 'react';
import SideNavbar from '../components/sidenavbar';

const PostLoginHome = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SideNavbar />

      {/* Main content area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 text-xl">
          Main Content Area
        </div>
      </div>
    </div>
  );
};

export default PostLoginHome;
