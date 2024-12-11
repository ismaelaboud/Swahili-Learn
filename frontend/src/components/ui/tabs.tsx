"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center space-x-2", className)} {...props} />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
