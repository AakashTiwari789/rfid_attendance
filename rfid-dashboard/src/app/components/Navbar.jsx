export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            RFID Attendance Dashboard
          </h1>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Realtime monitoring
          </span>
        </div>
      </div>
    </nav>
  );
}
