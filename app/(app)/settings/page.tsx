"use client";

import ChefLogo from "@/app/components/ChefLogo";
import { CookingGifBackdrop } from "@/app/components/CookingGifPlaster";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | null;
  hasProAccess?: boolean;
}

export default function SettingsPage() {
  console.log("[CHAOS render] SettingsPage");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "danger">("profile");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch((err) => console.error("Failed to fetch user profiles:", err));
    }
  }, []);

  async function handleCancelSubscription() {
    const confirmCancel = window.confirm("Are you sure you want to cancel your subscription?");
    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to cancel subscription (${res.status})`);
      }
      alert("Your subscription has been cancelled.");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to cancel subscription.");
    }
  }

  async function handleUpgrade() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const raw = await res.text();
    let data: { url?: string; error?: string } = {};
    try {
      data = raw ? (JSON.parse(raw) as typeof data) : {};
    } catch {
    }
    if (!res.ok) {
      alert(data.error ?? `Could not start billing (${res.status}).`);
      return;
    }
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Billing did not return a link.");
    }
  }

  async function handleDeleteAccount() {
    if (deleteInputText.trim().toLowerCase() !== "delete account") {
      alert("Please type 'delete account' exactly to confirm.");
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Your account has been deleted successfully.");
      router.push("/login");
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert("Failed to delete account. Please try again later.");
      setIsDeleting(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
          <p className="text-gray-400 text-xs font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-sans bg-white text-gray-900">
      <CookingGifBackdrop position="absolute" stackClass="z-[1]" />

      <div className="relative z-10 p-6 lg:p-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account profile, subscription plan, and security settings.</p>
          </div>
          <div className="hidden sm:block">
            <ChefLogo size={32} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 md:flex-initial text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "profile"
                ? "bg-gray-100/80 text-gray-900"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex-1 md:flex-initial text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "billing"
                ? "bg-gray-100/80 text-gray-900"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
            >
              Billing & Plan
            </button>
            <button
              onClick={() => setActiveTab("danger")}
              className={`flex-1 md:flex-initial text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "danger"
                ? "bg-red-50/50 text-red-700"
                : "text-gray-500 hover:text-red-600 hover:bg-red-50/30"
                }`}
            >
              Delete Account
            </button>
          </div>

          <div className="flex-1 max-w-2xl">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-500 mt-1">This is your personal information details registered on the Chef platform.</p>
                </div>

                <div className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none cursor-not-allowed select-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Plan & Subscription</h2>
                  <p className="text-sm text-gray-500 mt-1">Review your currently active subscription tier or update payment methods.</p>
                </div>

                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-6 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Current Account Plan</span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {user.hasProAccess ? "Pro Plan" : "Free Plan"}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${user.hasProAccess
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.hasProAccess ? "bg-green-600" : "bg-gray-400"}`}></span>
                        {user.hasProAccess ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider font-sans">Price</span>
                    <p className="text-lg font-extrabold text-gray-900 mt-1">
                      {user.hasProAccess ? "$9.99/mo" : "$0.00/mo"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  {!user.hasProAccess ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        Upgrade to Pro to unlock advanced AI-powered recipe generation, custom nutrition filters, and unlimited meal planning schedules.
                      </p>
                      <button
                        onClick={handleUpgrade}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        Upgrade to Pro Plan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        All premium features are fully active on your account. If you would like to end your subscription, you can click the button below to cancel your recurring billing setup.
                      </p>
                      {!user.cancelAtPeriodEnd && (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") ? (
                        <button
                          onClick={handleCancelSubscription}
                          className="bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 transition-all cursor-pointer"
                        >
                          Cancel Plan
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Your subscription is canceling (access active until period end)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-red-600">Delete Account</h2>
                  <p className="text-sm text-gray-500 mt-1">These settings are highly sensitive. Once executed, they cannot be undone.</p>
                </div>

                <div className="border border-red-100 rounded-2xl p-6 space-y-4 bg-red-50/10">
                  <h3 className="text-sm font-bold text-gray-900">Delete account permanently</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    By deleting your account, you will lose access to all custom recipes, ingredients list records, meal plan archives, and AI chat histories. All data will be permanently wiped.
                  </p>
                  <button
                    onClick={() => {
                      setDeleteInputText("");
                      setIsDeleteModalOpen(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DELETION CONFIRMATION MODAL */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <div
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs transition-opacity"
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
            />

            {/* Modal content */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150 ease-out z-10">
              <h3 className="text-base font-bold text-gray-900 mb-2">Are you absolutely sure?</h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                This will permanently delete your account and all associated data. To confirm, type <strong className="text-red-600 font-bold select-all">delete account</strong> below.
              </p>

              <input
                type="text"
                value={deleteInputText}
                onChange={(e) => setDeleteInputText(e.target.value)}
                disabled={isDeleting}
                placeholder="Type 'delete account'"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 mb-5 transition-all"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteInputText.trim().toLowerCase() !== "delete account"}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-30"
                >
                  {isDeleting ? "Deleting..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
