"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { Filter } from "@prisma/client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { Separator } from "./ui/separator";

interface FormatedFilters {
  href: string;
  label: string;
  active: boolean;
}

export const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();
  const params = useParams();
  const [filters, setFilters] = useState<FormatedFilters[]>([]);
  useEffect(() => {
    axios.get(`/api/${params.storeId}/filters`).then((res) => {
      setFilters(
        res.data.map((item: Filter) => ({
          href: `/${params.storeId}/filters/${item.id}/${item.name}`,
          label: item.name,
          active:
            pathname === `/${params.storeId}/filters/${item.id}/${item.name}`,
        }))
      );
    });
  }, [pathname]);

  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Overview",
      active: pathname === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: "Billboards",
      active: pathname === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/categories`,
      label: "Categories",
      active: pathname === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: "Sizes",
      active: pathname === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/colors`,
      label: "Colors",
      active: pathname === `/${params.storeId}/colors`,
    },
    {
      href: `/${params.storeId}/filters`,
      label: "Filters",
      active: pathname === `/${params.storeId}/filters`,
      filters: filters,
    },

    {
      href: `/${params.storeId}/products`,
      label: "Products",
      active: pathname === `/${params.storeId}/products`,
    },
    {
      href: `/${params.storeId}/orders`,
      label: "Orders",
      active: pathname === `/${params.storeId}/orders`,
    },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      active: pathname === `/${params.storeId}/settings`,
    },
  ];
  return (
    <nav className={cn("flex items-center space-x-2 lg:space-x-4", className)}>
      {routes.map((route) => {
        if (!route?.href) {
          return null;
        }
        if (route?.filters) {
          return (
            <NavigationMenu key={route.href}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary">
                      {route.label}
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className=" flex flex-col gap-3 p-4  ">
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          route?.active
                            ? "text-black dark:text-white"
                            : "text-muted-foreground"
                        )}
                      >
                        Filters
                      </Link>
                      <Separator />

                      {route.filters.map((filterRoute) => (
                        <Link
                          key={filterRoute.href}
                          href={filterRoute.href}
                          className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            filterRoute?.active
                              ? "text-black dark:text-white"
                              : "text-muted-foreground"
                          )}
                        >
                          {filterRoute.label}
                        </Link>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          );
        }
        return (
          <Link
            href={route?.href}
            key={route?.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route?.active
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            <Button variant={"ghost"} size={"sm"}>
              {route.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};
