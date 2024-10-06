"use client";
import React from "react";
import Sidebar from "../../components/ui/Sidebar";
import { motion } from "framer-motion";
import UnifiedFetch from "@/components/unifiedDataFetching/UnifiedFetch";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full h-[90dvh] items-center justify-center gap-2 relative">
      <Sidebar />
      <motion.section className="flex-1 h-full overflow-x-hidden overflow-y-auto relative">
        <UnifiedFetch>{children}</UnifiedFetch>
      </motion.section>
    </div>
  );
};

export default Layout;
