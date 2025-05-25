import { supabase } from "./supabase"

// Check if user is admin by email
export async function checkAdminAccess(userEmail: string | undefined): Promise<boolean> {
  if (!userEmail) return false

  // Only allow access to the specific admin email
  return userEmail === "jonathanjbarrios@gmail.com"
}

// Alternative function that takes user ID and fetches email
export async function checkAdminAccessById(userId: string | undefined): Promise<boolean> {
  if (!userId) return false

  try {
    const { data: user, error } = await supabase.auth.getUser()

    if (error || !user.user) return false

    return user.user.email === "jonathanjbarrios@gmail.com"
  } catch {
    return false
  }
}

// For backwards compatibility with existing admin_users table approach
export async function requireAdminAuth(userId: string | undefined): Promise<boolean> {
  if (!userId) return false
  return await checkAdminAccessById(userId)
}
