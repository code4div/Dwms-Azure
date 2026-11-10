import Signin from "@/components/Signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — DWMS Rajasthan Ore Hub",
  description: "Sign in to Digital Wear Monitoring System",
};

export default function SigninPage() {
  return <Signin />;
}
