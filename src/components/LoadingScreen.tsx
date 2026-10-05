const LoadingScreen = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#E5ECFF] text-gray-800"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white/90 px-8 py-6 shadow-xl backdrop-blur-md">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#258dfc]"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
