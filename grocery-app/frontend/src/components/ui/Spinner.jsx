// Spinner — animated loading indicator
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };
  return (
    <div className={`${sizes[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin ${className}`} />
  );
};

// Full page loading spinner
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-500 dark:text-dark-muted">Loading...</p>
    </div>
  </div>
);

export default Spinner;
