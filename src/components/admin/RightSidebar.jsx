import React from 'react'
import { Bug, UserPlus, Radio, X } from "lucide-react";

const RightSidebar = ({ isOpen, onClose }) => {
  return (
    <aside
    className={`
      fixed top-0 right-0 z-10 h-screen border-l border-gray-200 shadow flex flex-col
      transition-transform duration-300 ease-in-out will-change-transform
      ${isOpen ? "translate-x-0" : "translate-x-full"}
      w-[212px] overflow-hidden
      bg-primary dark:bg-primary-dark
      text-primary-dark dark:text-primary
    `}
    >
      {/* Notifications */}
      <div className="p-4">
        {/* Cross Button */}
        {isOpen && (
          <button
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 focus:outline-none z-20 md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        )}
        <h2 className="text-sm font-medium mb-2 text-gray-500">Notifications</h2>
        <ul className="space-y-2 text-sm ">
          <li className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-start gap-2">
            <span className="p-1 rounded-md bg-indigo-50"><Bug className="w-4 h-4" /></span>
            <div className="flex-1">
              <div className="">You fixed a bug.</div>
              <div className="text-xs text-gray-500">Just now</div>
            </div>
          </li>
          <li className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-start gap-2">
            <span className="p-1 rounded-md bg-blue-50"><UserPlus className="w-4 h-4" /></span>
            <div className="flex-1">
              <div className="">New user registered.</div>
              <div className="text-xs text-gray-500">59 minutes ago</div>
            </div>
          </li>
          <li className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-start gap-2">
            <span className="p-1 rounded-md bg-indigo-50"><Bug className="w-4 h-4" /></span>
            <div className="flex-1">
              <div className="">You fixed a bug.</div>
              <div className="text-xs text-gray-500">12 hours ago</div>
            </div>
          </li>
          <li className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-start gap-2">
            <span className="p-1 rounded-md bg-blue-50"><Radio className="w-4 h-4" /></span>
            <div className="flex-1">
              <div className="">Andi Lane subscribed to you.</div>
              <div className="text-xs text-gray-500">Today, 11:59 AM</div>
            </div>
          </li>
        </ul>
      </div>

      {/* Activities */}
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Activities</h2>
        <ul className="space-y-2 text-sm">
          <li className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-100 inline-flex items-center justify-center">A</span>
            <div className="flex-1">
              <div className="">Changed the style.</div>
              <div className="text-xs text-gray-500">Just now</div>
            </div>
          </li>
          {/* ...rest of your activities */}
        </ul>
      </div>

      {/* Contacts */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Contacts</h2>
        <ul className="space-y-3">
          {[
            "Natali Craig",
            "Drew Cano",
            "Andi Lane",
            "Koray Okumus",
            "Kate Morrison",
            "Melody Macy",
          ].map((name) => (
            <li key={name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                {name.split(" ").map((n) => n[0]).join("")}
              </div>
              <span className="text-sm">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default RightSidebar
