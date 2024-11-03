import { LogOut } from "lucide-react";
import { Button } from "./button";
import { doLogout } from "@/app/actions";

const Logout = () => {
  return (
    <form action={doLogout} className="w-full">
      <Button
        type="submit"
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <LogOut size={18} className="mr-2" />
        Log Out
      </Button>
    </form>
  );
};

export default Logout;
