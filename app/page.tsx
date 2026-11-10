"use client";

import { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import Signin from "../components/Signin";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    }
  }, []);

  // Prevent hydration flash before reading client storage
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Signin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard />;
}