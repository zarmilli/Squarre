import { Metadata } from "next";
import { CareersSimple01 } from "@/components/marketing/careers/careers-simple-01";

export const metadata: Metadata = {
  title: "Careers | Squarre",
};

export default function CareersPage() {
  return (
    <main>
      <CareersSimple01 />
    </main>
  );
}