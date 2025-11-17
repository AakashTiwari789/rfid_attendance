"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function AttendanceTable() {
  const [data, setData] = useState([]);
  const [notice, setNotice] = useState(null);
  const lastSeenEventAtRef = useRef(null);

  useEffect(() => {
    const loadData = () => {
      axios
        .get("http://localhost:5000/attendance")
        .then((res) => setData(res.data))
        .catch((err) => console.error("API Error:", err));
    };

    const loadEvent = () => {
      axios
        .get("http://localhost:5000/last-event")
        .then((res) => {
          const evt = res.data;
          if (!evt) return;
          // Only show when it's a new event
          if (lastSeenEventAtRef.current !== evt.at) {
            lastSeenEventAtRef.current = evt.at;
            setNotice(evt);
            // Auto clear after 6 seconds
            setTimeout(() => {
              setNotice((current) => (current && current.at === evt.at ? null : current));
            }, 6000);
          }
        })
        .catch(() => {});
    };

    loadData();
    loadEvent();
    const interval = setInterval(() => {
      loadData();
      loadEvent();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6 pt-6">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Attendance Records
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Live updates every 2 seconds.
        </p>
      </div>

      {notice && (
        <div
          className={
            "mx-6 mt-4 rounded-md border px-4 py-3 text-sm " +
            (notice.type === "duplicate"
              ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200"
              : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-200")
          }
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {notice.type === "duplicate" ? "⚠️" : "✅"}
            </div>
            <div>
              <p className="font-medium">
                {notice.message}
              </p>
              <p className="mt-1 text-xs opacity-80">
                UID: {notice.uid} • {notice.name}
                {notice.nextAllowedAt && (
                  <> • Next allowed at: {new Date(notice.nextAllowedAt).toLocaleTimeString()} </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/70 text-gray-600 dark:text-gray-300">
            <tr className="border-y border-gray-200 dark:border-gray-800">
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Name</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">UID</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Timestamp</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((item) => (
              <tr key={item._id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-900/40">
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">
                  {item.name}
                </td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">
                  {item.uid}
                </td>
                <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  className="px-6 py-6 text-gray-500 dark:text-gray-400 text-center"
                  colSpan={3}
                >
                  No attendance yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="h-4" />
    </div>
  );
}
