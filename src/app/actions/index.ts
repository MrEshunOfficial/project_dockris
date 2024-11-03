// app/actions.ts
'use server'

import { signIn, signOut } from "@/auth"


export async function doSocialLogin(formData: FormData) {
  const action = formData.get("action") as string
  
  if (!action) {
    throw new Error("Provider action is required")
  }

  try {
    await signIn(action, { redirectTo: "/" })
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}

export async function doLogout() {
  await signOut({redirectTo: '/'})
}

