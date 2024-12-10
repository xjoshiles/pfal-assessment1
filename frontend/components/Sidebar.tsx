'use client'

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useUserContext } from "@/context/UserContext"
import { useLogout } from "@/lib/logout"
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  Cog6ToothIcon,
  HomeIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserCircleIcon,
  UserPlusIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

type menuType = {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  gapAfter?: boolean
  path: string
}

export default function Sidebar() {
  const user = useUserContext()
  const { handleLogout } = useLogout()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const NavItems: menuType[] = [
    {
      title: "Home",
      icon: HomeIcon,
      path: "/"
    }
  ]

  if (user.id) {
    NavItems.push(
      {
        title: "My Library",
        icon: UserCircleIcon,
        gapAfter: true,
        path: `/users/${user.id}`
      },
      {
        title: "Sets",
        icon: RectangleStackIcon,
        path: "/sets"
      },
      {
        title: "Collections",
        icon: WalletIcon,
        gapAfter: true,
        path: "/collections",
      },
      {
        title: "Account",
        icon: Cog6ToothIcon,
        path: "/account",
      })

    if (user.admin) {
      NavItems.push(
        {
          title: "Admin",
          icon: LockClosedIcon,
          path: "/admin"
        })
    }

  } else {
    NavItems.push(
      {
        title: "Login",
        icon: ArrowRightStartOnRectangleIcon,
        path: "/login"
      },
      {
        title: "Register",
        icon: UserPlusIcon,
        path: "/register"
      })
  }

  return (
    <div className="flex flex-col">

      {/* Hamburger Button for Small Screens */}
      <div className="bg-black-200 p-4 md:hidden flex items-center justify-between z-40">
        <div onClick={() => setIsMobileOpen(!isMobileOpen)} className="cursor-pointer flex-between gap-4">
          <Image
            alt="TestVar logo"
            src="/logo4.svg"
            className={`cursor-pointer duration-500 ${isMobileOpen && "rotate-[360deg]"}`}
            width={36}
            height={34} />
          <h1
            className="text-white origin-left font-medium text-2xl"
          >
            TestVar
          </h1>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-white focus:outline-none"
        >
          {isMobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-8 h-8" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-30 bg-black-200 p-4 pt-4
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative
          ${isOpen ? "md:w-[210px]" : "md:w-[72px]"} w-[210px]
          transition-transform duration-500 ease-in-out 
          md:transition-[width] md:duration-500
          flex flex-col justify-between`}
      >
        <div>
          <div className="flex gap-x-4 items-center">
            <Image
              alt="TestVar logo"
              src="/logo4.svg"
              className={`cursor-pointer duration-500 ${isOpen && "rotate-[360deg]"}`}
              width={36}
              height={34}
              onClick={() => setIsOpen(!isOpen)}
            />
            <h1
              className={`text-white origin-left font-medium text-2xl ${isOpen ? "menu-fade-in" : "menu-fade-out"}`}
            >
              TestVar
            </h1>
          </div>
          <ul className="pt-6 font-semibold">
            {NavItems.map((item, index) => (
              <li key={index} className="mb-1">
                <Link href={item.path} passHref tabIndex={-1}>
                  <button
                    className={`${item.path === pathname ? "menu-button-selected" : "menu-button"}`}
                  >
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    <span
                      className={`ml-2 overflow-hidden whitespace-nowrap ${isOpen || isMobileOpen ? "menu-fade-in" : "menu-fade-out"}`}
                    >
                      {item.title}
                    </span>
                  </button>
                </Link>
                {/* Place a divider after the item if required */}
                {item.gapAfter && <hr className="my-4 border-black-300" />}
              </li>
            ))}
          </ul>
        </div>
        <div className="pb-4 font-semibold mt-auto">
          {user.id && (
            <button
              onClick={() => { handleLogout() }}
              className="menu-button"
            >
              <ArrowLeftStartOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
              <span
                className={`ml-2 overflow-hidden whitespace-nowrap ${isOpen || isMobileOpen ? "menu-fade-in" : "menu-fade-out"}`}
              >
                Logout
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Overlay for Mobile Menu */}
      {isMobileOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  )
}
