"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { ProfileSkeleton, BillingSkeleton, UsageSkeleton } from "@/app/components/Skeletons";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

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

interface UsageData {
  plan: "free" | "pro";
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | null;
  usage: {
    recipesToday: number;
    recipesMonth: number;
    chatsMonth: number;
    plannersWeek: number;
  };
  limits: {
    recipesPerDay: number;
    recipesPerMonth: number;
    chatsMonth: number;
    plannersWeek: number;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "usage" | "danger">("profile");
  const [usageData, setUsageData] = useState<UsageData | null>(null);

  const fetchUsageData = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/usage", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setUsageData(data);
          }
        })
        .catch((err) => console.error("Failed to fetch usage data:", err));
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "billing" || tab === "profile" || tab === "usage" || tab === "danger") {
        setActiveTab(tab);
      }
    }
  }, []);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelResultModalOpen, setIsCancelResultModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() || !user) return;
    if (nameInput.trim() === user.name) {
      setIsEditing(false);
      return;
    }

    setIsUpdatingName(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nameInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile name.");
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUpdateSuccess(true);
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error(err);
      setUpdateError(err.message || "Failed to update profile name.");
    } finally {
      setIsUpdatingName(false);
    }
  }

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

  function handleCancelSubscription() {
    setIsCancelModalOpen(true);
  }

  async function executeCancelSubscription() {
    setIsCancelling(true);
    setCancelError(null);
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
      setIsCancelModalOpen(false);
      setIsCancelResultModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setCancelError(err.message || "Failed to cancel subscription.");
      setIsCancelModalOpen(false);
      setIsCancelResultModalOpen(true);
    } finally {
      setIsCancelling(false);
    }
  }

  function handleResultModalClose() {
    setIsCancelResultModalOpen(false);
    if (!cancelError) {
      window.location.reload();
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

  return (
    <div className={`${montserrat.variable} font-sans relative min-h-screen bg-[#FAF9F6] text-[#111111]`}>

      <div className="relative z-10 px-6 sm:px-12 md:px-16 lg:px-20 pt-4 lg:pt-6 pb-12 lg:pb-16 max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-900/10 pb-4 mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[0.25em] uppercase text-neutral-900">
              SETTINGS
            </h1>
            <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase mt-2">
              Manage profile, subscriptions & preferences
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col md:flex-row gap-12">

          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-neutral-900/10 pb-4 md:pb-0 md:pr-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer ${activeTab === "profile"
                ? "border-b-2 md:border-b-0 md:border-l-2 border-neutral-900 bg-neutral-900/5 text-neutral-900"
                : "border-b-2 md:border-b-0 md:border-l-2 border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-900/5"
                }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer ${activeTab === "billing"
                ? "border-b-2 md:border-b-0 md:border-l-2 border-neutral-900 bg-neutral-900/5 text-neutral-900"
                : "border-b-2 md:border-b-0 md:border-l-2 border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-900/5"
                }`}
            >
              Billing & Plan
            </button>
            <button
              onClick={() => setActiveTab("usage")}
              className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer ${activeTab === "usage"
                ? "border-b-2 md:border-b-0 md:border-l-2 border-neutral-900 bg-neutral-900/5 text-neutral-900"
                : "border-b-2 md:border-b-0 md:border-l-2 border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-900/5"
                }`}
            >
              Usage & Quotas
            </button>
            <button
              onClick={() => setActiveTab("danger")}
              className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-none text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer ${activeTab === "danger"
                ? "border-b-2 md:border-b-0 md:border-l-2 border-rose-600 bg-rose-50 text-rose-700"
                : "border-b-2 md:border-b-0 md:border-l-2 border-transparent text-neutral-400 hover:text-rose-600 hover:bg-rose-50/50"
                }`}
            >
              Delete Account
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 max-w-2xl">
            {activeTab === "profile" && (
              !user ? (
                <ProfileSkeleton />
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.18em]">
                      Profile Information
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5">
                      Registered details on the Cater platform
                    </p>
                  </div>

                  <div className="space-y-6 pt-4">
                    {/* Name section (conditional editing UI) */}
                    {isEditing ? (
                      <form onSubmit={handleUpdateName} className="space-y-6">
                        <div className="flex flex-col border-b border-neutral-900 py-1 transition-colors">
                          <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => {
                              setNameInput(e.target.value);
                              setUpdateSuccess(false);
                              if (updateError) setUpdateError(null);
                            }}
                            required
                            autoFocus
                            className="w-full bg-transparent text-xs font-bold text-neutral-800 uppercase tracking-widest focus:outline-none py-1"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setNameInput(user.name);
                            }}
                            className="px-6 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUpdatingName || nameInput.trim() === user.name}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all border border-neutral-900 disabled:opacity-50 cursor-pointer"
                          >
                            {isUpdatingName ? "Saving..." : "Save Name"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col border-b border-neutral-900/10 py-1">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                              Full Name
                            </label>
                            <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest py-1 select-none">
                              {user.name}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setNameInput(user.name);
                              setIsEditing(true);
                            }}
                            className="px-4 py-1.5 border border-neutral-300 hover:bg-neutral-150/40 text-neutral-600 text-[10px] font-extrabold tracking-[0.2em] uppercase rounded-md transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Email address field (readonly) */}
                    <div className="flex flex-col border-b border-neutral-900/10 py-1">
                      <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                        Email Address
                      </label>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest py-1 select-none">
                        {user.email}
                      </span>
                    </div>

                    {/* Feedback status messages */}
                    {updateError && (
                      <p className="text-[10px] text-rose-600 font-bold uppercase tracking-[0.15em] animate-in fade-in slide-in-from-top-1 duration-150">
                        {updateError}
                      </p>
                    )}
                    {updateSuccess && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.15em] animate-in fade-in slide-in-from-top-1 duration-150">
                        Name updated successfully
                      </p>
                    )}
                  </div>

                  {/* Logout Option Below */}
                  <div className="pt-8 border-t border-neutral-900/10 mt-8">
                    <button
                      onClick={handleLogout}
                      className="bg-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-neutral-600 px-8 py-3.5 border border-neutral-200 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )
            )}

            {activeTab === "billing" && (
              (!user || !usageData) ? (
                <BillingSkeleton />
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.18em]">
                      Plan & Subscription
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5">
                      Review your active subscription tier or upgrade your access
                    </p>
                  </div>

                  <div className="bg-white border border-neutral-200/60 rounded-xl p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <div>
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.25em]">Current Account Plan</span>
                      <div className="flex items-center gap-3 mt-2">
                        <h3 className="text-lg font-extrabold text-neutral-950 uppercase tracking-wider">
                          {user.hasProAccess ? "Pro Plan" : "Free Plan"}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${user.hasProAccess
                          ? "bg-green-50 text-green-700 border border-green-200/60"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.hasProAccess ? "bg-green-600 animate-pulse" : "bg-neutral-400"}`}></span>
                          {user.hasProAccess ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="sm:text-right border-t sm:border-t-0 border-neutral-100 pt-4 sm:pt-0">
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.25em]">Price</span>
                      <p className="text-xl font-black text-neutral-950 mt-1 uppercase tracking-wider">
                        {user.hasProAccess ? "$29.99 / mo" : "$0.00 / mo"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    {!user.hasProAccess ? (
                      <div className="space-y-6">
                        <p className="text-xs text-neutral-500 leading-relaxed font-medium uppercase tracking-wider">
                          Upgrade to Pro to unlock advanced AI-powered recipe generation, custom nutrition filters, and unlimited meal planning schedules.
                        </p>
                        <button
                          onClick={handleUpgrade}
                          className="bg-neutral-950 hover:bg-neutral-800 text-[#FAF9F6] px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md border border-neutral-950"
                        >
                          Upgrade to Pro Plan
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-xs text-neutral-500 leading-relaxed font-medium uppercase tracking-wider">
                          All premium features are fully active on your account. If you would like to end your subscription, you can click the button below to cancel your recurring billing setup.
                        </p>
                        {!user.cancelAtPeriodEnd && (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") ? (
                          <button
                            onClick={handleCancelSubscription}
                            className="bg-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-neutral-600 px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase border border-neutral-200 transition-all cursor-pointer"
                          >
                            Cancel Plan
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            Your subscription is canceling (access active until period end)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {activeTab === "usage" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.18em]">
                    Usage & Quotas
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5">
                    Track your plan limits and system usage
                  </p>
                </div>

                {usageData ? (
                  <div className="space-y-6">
                    {/* Plan Info Card */}
                    <div className="bg-white border border-neutral-200/60 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.25em]">Account Plan</span>
                        <h3 className="text-base font-extrabold text-neutral-950 uppercase tracking-wider mt-1">
                          {usageData.plan === "pro" ? "Pro Plan Access" : "Free Plan Account"}
                        </h3>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.25em]">Billing Period / Renewal</span>
                        <p className="text-xs font-bold text-neutral-800 mt-1 uppercase tracking-wider">
                          {usageData.subscriptionStatus === "active" && usageData.currentPeriodEnd
                            ? `${usageData.cancelAtPeriodEnd ? "Expires" : "Renews"} ${new Date(usageData.currentPeriodEnd).toLocaleDateString()}`
                            : "No active subscription billing"}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Recipes Today */}
                      <QuotaProgressBar
                        title="Recipes Created Today"
                        value={usageData.usage.recipesToday}
                        max={usageData.limits.recipesPerDay}
                      />

                      {/* Recipes Month */}
                      <QuotaProgressBar
                        title="Recipes Created This Month"
                        value={usageData.usage.recipesMonth}
                        max={usageData.limits.recipesPerMonth}
                      />

                      {/* Chats Month */}
                      <QuotaProgressBar
                        title="Chef Ferraro Chats This Month"
                        value={usageData.usage.chatsMonth}
                        max={usageData.limits.chatsMonth}
                      />

                      {/* Planners Week */}
                      <QuotaProgressBar
                        title="Meal Planners Created (7d)"
                        value={usageData.usage.plannersWeek}
                        max={usageData.limits.plannersWeek}
                      />

                    </div>

                    {/* Upgrade CTA */}
                    {usageData.plan === "free" && (
                      <div className="border border-neutral-200/60 bg-white rounded-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4 shadow-xs">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Upgrade to Pro Access</h4>
                          <p className="text-xs text-neutral-500 max-w-md leading-relaxed uppercase tracking-wider">
                            Unlock unlimited chats with Chef Ferraro, unlimited weekly planner calendars, and expanded daily/monthly recipe limits.
                          </p>
                        </div>
                        <button
                          onClick={handleUpgrade}
                          className="bg-neutral-950 hover:bg-neutral-800 text-[#FAF9F6] px-6 py-3 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer border border-neutral-950 shrink-0"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <UsageSkeleton />
                )}
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <h2 className="text-sm font-bold text-rose-600 uppercase tracking-[0.18em]">
                    Delete Account
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5">
                    Sensitive settings. These actions cannot be undone.
                  </p>
                </div>

                <div className="border border-rose-200/60 rounded-xl p-8 space-y-5 bg-rose-50/10 shadow-xs">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Delete account permanently</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed uppercase tracking-wider">
                    By deleting your account, you will lose access to all custom recipes, ingredients list records, meal plan archives, and AI chat histories. All data will be permanently wiped.
                  </p>
                  <button
                    onClick={() => {
                      setDeleteInputText("");
                      setIsDeleteModalOpen(true);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer border border-rose-600"
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
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
            />

            {/* Modal content */}
            <div className="relative bg-[#FAF9F6] border border-neutral-200 p-8 text-center rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-w-md w-full space-y-6 z-10">
              <div>
                <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-2">
                  Permanently delete account?
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium uppercase tracking-wider">
                  This action is irreversible. To proceed, please type <strong className="text-rose-600 font-bold select-all">delete account</strong> below.
                </p>
              </div>

              <div className="flex flex-col border-b border-neutral-300 py-1 focus-within:border-rose-600 transition-colors text-left">
                <label className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1">
                  CONFIRMATION PHRASE
                </label>
                <input
                  type="text"
                  value={deleteInputText}
                  onChange={(e) => setDeleteInputText(e.target.value)}
                  disabled={isDeleting}
                  placeholder="TYPE 'DELETE ACCOUNT'"
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 placeholder-neutral-300 uppercase tracking-widest focus:outline-none py-1.5"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="order-2 sm:order-1 px-6 py-3.5 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteInputText.trim().toLowerCase() !== "delete account"}
                  className="order-1 sm:order-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-rose-600 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION CANCELLATION CONFIRMATION MODAL */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <div
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
              onClick={() => !isCancelling && setIsCancelModalOpen(false)}
            />

            {/* Modal content */}
            <div className="relative bg-[#FAF9F6] border border-neutral-200 p-8 text-center rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-w-md w-full space-y-6 z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 shadow-xs">
                <svg className="h-8 w-8 text-rose-600 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-2">
                  Cancel subscription?
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium uppercase tracking-wider px-2">
                  You will lose access to premium AI-assisted meal planning, custom nutrition filters, and advanced recipe generation at the end of your billing cycle.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isCancelling}
                  className="order-2 sm:order-1 px-6 py-3.5 border border-neutral-300 hover:bg-neutral-100/50 text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Keep Pro Plan
                </button>
                <button
                  onClick={executeCancelSubscription}
                  disabled={isCancelling}
                  className="order-1 sm:order-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all text-center border border-rose-600 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isCancelling ? "Processing..." : "Yes, Cancel Plan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION CANCELLATION RESULT MODAL */}
        {isCancelResultModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <div
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
              onClick={() => !cancelError && handleResultModalClose()}
            />

            {/* Modal content */}
            <div className="relative bg-[#FAF9F6] border border-neutral-200 p-8 text-center rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-w-sm w-full space-y-6 z-10">
              {cancelError ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 shadow-xs">
                    <svg className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-2">
                      Cancellation Failed
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-medium uppercase tracking-wider px-2">
                      {cancelError}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCancelResultModalOpen(false)}
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 border border-neutral-950 cursor-pointer"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 shadow-xs">
                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-[0.2em] mb-2">
                      Plan Cancelled
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-medium uppercase tracking-wider px-2">
                      Your subscription has been successfully cancelled. Access active until the end of your billing cycle.
                    </p>
                  </div>
                  <button
                    onClick={handleResultModalClose}
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-3.5 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 border border-neutral-950 cursor-pointer"
                  >
                    Got it, thanks
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuotaProgressBar({
  title,
  value,
  max,
}: {
  title: string;
  value: number;
  max: number;
}) {
  const isInfinite = max === Infinity || max === null || max === undefined || (typeof max === "string" && (String(max).toLowerCase() === "infinity" || String(max).toLowerCase() === "infinite"));
  const percentage = isInfinite ? 0 : Math.min(100, Math.round((value / max) * 100));
  const remaining = isInfinite ? "Unlimited" : Math.max(0, max - value);
  const isWarning = !isInfinite && percentage >= 85;

  return (
    <div className="bg-white border border-neutral-200/60 rounded-xl p-6 space-y-4 hover:border-neutral-400 transition-colors shadow-xs">
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">
          {title}
        </span>
        <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider text-right whitespace-nowrap">
          {value} / {isInfinite ? "∞" : max}
        </span>
      </div>

      {!isInfinite && (
        <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden border border-neutral-200/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${isWarning ? "bg-rose-600 animate-pulse" : "bg-neutral-900"
              }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest pt-1">
        <span className="text-neutral-400">
          {isInfinite ? "Status" : "Remaining Quota"}
        </span>
        <span className={isWarning ? "text-rose-600" : "text-neutral-800"}>
          {isInfinite ? "Unlimited" : `${remaining} Left`}
        </span>
      </div>
    </div>
  );
}

