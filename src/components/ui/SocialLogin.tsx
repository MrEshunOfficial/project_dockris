import React from "react";
import { Button } from "./button";
import { doSocialLogin } from "@/app/actions";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function SocialLogin() {
  return (
    <form
      action={doSocialLogin}
      className="mt-6 space-y-4 flex flex-col gap-3 items-center"
    >
      <Button
        type="submit"
        name="action"
        value="google"
        variant="outline"
        className="w-3/4"
      >
        <FcGoogle size={24} className="mr-2" />
        Sign-up with Google
      </Button>

      <Button
        type="submit"
        name="action"
        value="github"
        variant="outline"
        className="w-3/4"
      >
        <FaGithub size={24} className="mr-2 text-blue-500" />
        Sign-up with Github
      </Button>
    </form>
  );
}
