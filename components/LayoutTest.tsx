import React from 'react';

const LayoutTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Test Header */}
      <div className="lg:hidden bg-red-500 text-white p-4 text-center">
        Mobile Header Visible (lg:hidden)
      </div>
      <div className="hidden lg:block bg-blue-500 text-white p-4 text-center">
        Desktop Header Visible (hidden lg:block)
      </div>

      {/* Test Layout */}
      <div className="flex">
        {/* Test Sidebar */}
        <div className="hidden lg:flex w-[80px] xl:w-[275px] bg-green-500 text-white p-4">
          Sidebar (hidden lg:flex)
        </div>

        {/* Test Main Content */}
        <div className="flex-1 bg-yellow-500 text-white p-4">
          Main Content (flex-1)
        </div>

        {/* Test Right Panel */}
        <div className="hidden md:block w-[320px] xl:w-[350px] bg-purple-500 text-white p-4">
          Right Panel (hidden md:block)
        </div>
      </div>

      {/* Test Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-orange-500 text-white p-4 text-center">
        Bottom Nav (md:hidden)
      </div>

      {/* Breakpoint Info */}
      <div className="fixed top-20 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
        <div>Current Breakpoints:</div>
        <div>sm: 640px</div>
        <div>md: 768px</div>
        <div>lg: 1024px</div>
        <div>xl: 1280px</div>
        <div className="mt-2 text-xs">
          Resize window to test responsive layout
        </div>
      </div>
    </div>
  );
};

export default LayoutTest;
