import React from 'react';
import CustomLoading from './Loading';

interface FullPageLoaderProps {
  isVisible: boolean;
  message?: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  isVisible,
  message = "Loading..."
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-transparent  flex flex-col items-center space-y-4">
        <CustomLoading />
        {message && (
          <p className="text-gray-700 text-lg font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default FullPageLoader;
