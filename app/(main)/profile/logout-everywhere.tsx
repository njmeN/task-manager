"use client";

import { LoadingButton } from "@/components/loading-button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutEverywhereButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogoutEverywhere() {
    // TODO: Handle logout everywhere
  }

  return (
    <LoadingButton
      variant="destructive"
      onClick={handleLogoutEverywhere}
      loading={loading}
      className="w-full"
    >
      Log out everywhere
    </LoadingButton>
  );
}