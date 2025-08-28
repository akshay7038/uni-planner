import dynamic from "next/dynamic";
const ClientPlanner = dynamic(() => import("../components/ClientPlanner"), { ssr: false });

export default function Page() {
  return <ClientPlanner />;
}
