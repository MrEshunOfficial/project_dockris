"use client";
import React from "react";
import Sidebar from "../../components/ui/Sidebar";
import { motion } from "framer-motion";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full h-full items-center justify-center gap-2 relative">
      <Sidebar />
      <motion.section className="flex-1 h-full overflow-x-hidden overflow-y-auto relative">
        {children}
      </motion.section>
    </div>
  );
};

export default Layout;
