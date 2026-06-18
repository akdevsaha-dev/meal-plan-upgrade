"use client";

import React from "react";

// 1. Recipes list loader skeleton
export function RecipesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200/60 rounded-none flex flex-col h-full animate-pulse shadow-xs">
          <div className="relative aspect-[16/10] bg-neutral-250/70 dark:bg-neutral-800 rounded-none border-b border-neutral-100" />
          <div className="p-6 flex flex-col grow text-left space-y-4">
            <div>
              {/* Category & Tags */}
              <div className="h-2.5 bg-neutral-200 w-1/3 rounded-none mb-2" />
              {/* Title */}
              <div className="h-4.5 bg-neutral-300 w-3/4 rounded-none" />
            </div>
            {/* Description */}
            <div className="space-y-2 grow">
              <div className="h-3 bg-neutral-100 w-full rounded-none" />
              <div className="h-3 bg-neutral-100 w-5/6 rounded-none" />
            </div>
            {/* Specs Bar */}
            <div className="border-t border-neutral-100 pt-4 mb-1 flex items-center gap-2">
              <div className="h-3 bg-neutral-100 w-16 rounded-none" />
              <span className="text-neutral-200 text-[8.5px]">|</span>
              <div className="h-3 bg-neutral-100 w-16 rounded-none" />
              <span className="text-neutral-200 text-[8.5px]">|</span>
              <div className="h-3 bg-neutral-100 w-20 rounded-none" />
            </div>
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <div className="h-9.5 bg-neutral-300 flex-1 rounded-none" />
              <div className="h-9.5 bg-neutral-200 w-16 rounded-none" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 2. Chat window history loader skeleton
export function ChatSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-pulse">
      {/* User Message Skeleton */}
      <div className="flex items-start gap-3.5 justify-end">
        <div className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl rounded-tr-none px-5 py-4 w-1/3 h-12 shadow-md" />
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
      </div>
      
      {/* Assistant Message Skeleton */}
      <div className="flex items-start gap-3.5 justify-start">
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
        <div className="space-y-4 flex-1 max-w-[80%]">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl rounded-tl-none px-5 py-4 h-16 shadow-xs w-2/3" />
          
          {/* Pulsing Recipe Card in Chat */}
          <div className="pl-0 max-w-2xl w-full">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 rounded-3xl shadow-xl overflow-hidden">
              {/* Recipe Header Banner Image */}
              <div className="h-44 sm:h-52 w-full bg-neutral-250 dark:bg-neutral-850" />
              {/* Tabs Menu Navigation */}
              <div className="flex border-b border-neutral-150 dark:border-neutral-800 bg-neutral-55 dark:bg-neutral-900/30">
                <div className="flex-1 py-3.5 border-r border-neutral-100 dark:border-neutral-800 h-9" />
                <div className="flex-1 py-3.5 border-r border-neutral-100 dark:border-neutral-800 h-9" />
                <div className="flex-1 py-3.5 h-9" />
              </div>
              {/* Card Body Content */}
              <div className="p-6 space-y-5">
                <div className="space-y-2.5">
                  <div className="h-3 bg-neutral-150 dark:bg-neutral-800 w-full rounded-md" />
                  <div className="h-3 bg-neutral-150 dark:bg-neutral-800 w-5/6 rounded-md" />
                </div>
                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-3 bg-neutral-50 dark:bg-neutral-950/30 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-850 w-24 rounded-full" />
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-850 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Message Skeleton */}
      <div className="flex items-start gap-3.5 justify-end">
        <div className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl rounded-tr-none px-5 py-4 w-1/4 h-10 shadow-md" />
        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
      </div>
    </div>
  );
}

// 3. Meal plans overview loader skeleton
export function MealPlansSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-neutral-200/60 rounded-xl flex flex-col h-full animate-pulse shadow-sm"
        >
          <div className="p-8 flex flex-col grow justify-between space-y-6 text-left">
            <div>
              {/* Card Top / Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-neutral-300 w-2/3 rounded-md" />
                  <div className="h-3.5 bg-neutral-100 w-1/2 rounded-md" />
                </div>
                <div className="h-8 bg-neutral-200 w-20 rounded-md shrink-0" />
              </div>

              {/* Previews / Thumbnails Stack */}
              <div className="mt-6 mb-2">
                <div className="h-3 bg-neutral-100 w-1/4 rounded-md mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 bg-neutral-200 rounded-md"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="border-t border-neutral-100 pt-6 mt-4">
              <div className="h-4 bg-neutral-200 w-1/3 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 4. Meal plan detail loader skeleton
export function MealPlanDetailSkeleton() {
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

  return (
    <div className="animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-300 mb-6 uppercase tracking-[0.2em]">
        <span>MEAL PLANS</span>
        <span>/</span>
        <div className="h-3.5 bg-neutral-200 w-32 rounded-md" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-900/10 mb-8">
        <div className="space-y-2.5">
          <div className="h-9 bg-neutral-300 w-64 rounded-md" />
          <div className="h-3.5 bg-neutral-200 w-44 rounded-md" />
        </div>
        <div className="h-10 bg-neutral-200 w-36 rounded-lg shrink-0" />
      </div>

      {/* Dashboard Split Screen Layout Skeleton */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

        {/* Sidebar Overview Skeleton */}
        <div className="lg:col-span-4 mb-8 lg:mb-0">
          <div className="h-3.5 bg-neutral-200 w-32 rounded-md mb-4 hidden lg:block" />
          <div className="flex overflow-x-auto lg:overflow-x-visible lg:flex-col gap-3 pb-4 lg:pb-0">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex-none w-[180px] lg:w-full p-4 rounded-xl border border-neutral-200 bg-white/50 space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                    {day}
                  </span>
                  <div className="h-4 bg-neutral-200 w-12 rounded-full" />
                </div>
                <div className="h-3 bg-neutral-150 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Agenda Panel Skeleton */}
        <div className="lg:col-span-8 bg-white border border-neutral-200/80 p-6 md:p-8 rounded-xl shadow-xs space-y-6">
          
          <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
            <div className="space-y-2.5">
              <div className="h-5 bg-neutral-300 w-32 rounded-md" />
              <div className="h-3.5 bg-neutral-150 w-48 rounded-md" />
            </div>
            <div className="h-6 bg-neutral-200 w-24 rounded-md" />
          </div>

          <div className="space-y-6">
            {MEAL_TYPES.map((meal) => (
              <div key={meal} className="flex flex-col md:flex-row md:items-start gap-4 p-4 border border-neutral-100 rounded-xl">
                <div className="md:w-28 shrink-0 py-1">
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] block">
                    {meal}
                  </span>
                </div>
                <div className="grow w-full">
                  <div className="flex flex-col sm:flex-row bg-white border border-neutral-200/80 rounded-lg overflow-hidden w-full">
                    <div className="w-full sm:w-44 aspect-video sm:h-28 bg-neutral-200 shrink-0" />
                    <div className="p-4 flex flex-col justify-between grow space-y-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-neutral-300 w-2/3 rounded-md" />
                        <div className="h-3 bg-neutral-150 w-1/3 rounded-md" />
                      </div>
                      <div className="h-3.5 bg-neutral-100 w-16 rounded-md self-end" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

// 5. Settings profile tab loader skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.18em]">
          Profile Information
        </h2>
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5">
          Registered details on the Cater platform
        </p>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex flex-col border-b border-neutral-200 py-3">
          <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
            Full Name
          </div>
          <div className="h-5 bg-neutral-200 w-1/2 rounded-md" />
        </div>
        <div className="flex flex-col border-b border-neutral-200 py-3">
          <div className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
            Email Address
          </div>
          <div className="h-5 bg-neutral-200 w-2/3 rounded-md" />
        </div>
      </div>

      <div className="pt-8 border-t border-neutral-900/10 mt-8">
        <div className="h-10 bg-neutral-200 w-28 rounded-lg" />
      </div>
    </div>
  );
}

// 6. Settings billing tab loader skeleton
export function BillingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-[0.18em]">
          Plan & Subscription
        </h2>
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1.5">
          Review your active subscription tier or upgrade your access
        </p>
      </div>

      <div className="bg-white border border-neutral-200/60 rounded-xl p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-sm">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-neutral-150 w-1/3 rounded-md" />
          <div className="h-6 bg-neutral-200 w-1/2 rounded-md" />
        </div>
        <div className="space-y-2 sm:text-right flex-1 sm:flex sm:flex-col sm:items-end">
          <div className="h-3 bg-neutral-150 w-1/4 rounded-md" />
          <div className="h-6 bg-neutral-200 w-1/3 rounded-md" />
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <div className="h-4 bg-neutral-150 w-3/4 rounded-md" />
        <div className="h-10 bg-neutral-200 w-36 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

// 7. Settings usage tab loader skeleton
export function UsageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Plan Info Card Skeleton */}
      <div className="bg-white border border-neutral-200/60 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-neutral-150 w-1/4 rounded-md" />
          <div className="h-5 bg-neutral-200 w-1/3 rounded-md" />
        </div>
        <div className="space-y-2 sm:text-right flex-1 sm:flex sm:flex-col sm:items-end">
          <div className="h-3 bg-neutral-150 w-1/3 rounded-md" />
          <div className="h-5 bg-neutral-200 w-1/2 rounded-md" />
        </div>
      </div>

      {/* Progress Bars Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-white border border-neutral-200/60 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-neutral-200 w-1/2 rounded-md" />
              <div className="h-3.5 bg-neutral-150 w-12 rounded-md" />
            </div>
            <div className="h-2.5 bg-neutral-100 rounded-full w-full" />
            <div className="h-3 bg-neutral-100 w-1/3 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
