// config/mobileLogout.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { API_BASE_URL } from "./api";

/**
 * Centralised logout for the mobile app.
 *
 * NOTE:
 * - This is used by mobileApiClient when refresh fails,
 *   so we **don't** have the user's password here.
 * - If you want to call /api/auth/logout with username/password,
 *   do it from the Me screen where you still have those values.
 */
export async function mobileLogout() {
  try {
    // 🔸 (Optional) backend logout – only if your API allows it without password
    // await fetch(`${API_BASE_URL}/api/auth/logout`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username: "admin", password: "password123" }),
    // });

    // 🔹 Clear local auth data
    await AsyncStorage.multiRemove([
      "authToken",
      "refreshToken",
      "currentUser",
    ]);
  } catch (err) {
    console.log("[mobileLogout] error:", err);
  }

  // 🔹 Hard reset to login so user can’t go “back” into the app
  router.replace("/login" as any);
}
