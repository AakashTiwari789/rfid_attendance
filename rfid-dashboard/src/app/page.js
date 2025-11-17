import Image from "next/image";
import AttendanceTable from "./components/AttendanceTable";

export default function Home() {
  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-6">
        <AttendanceTable />
      </div>
    </main>
  );
}
