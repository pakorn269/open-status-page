# 🎨 Design Specifications (Claude / Atlassian Style)

This document outlines the design system used for the Open Status Page, inspired by the minimal and professional look of Atlassian Statuspage (e.g., Claude Status).

## 🛠 Framework
* **CSS Framework:** Tailwind CSS (via CDN)
* **Icons:** Emojis or Heroicons (SVG)
* **Font:** System Sans-Serif (`font-sans`) for UI, and optionally a Serif font for the logo/header to match Claude's aesthetic.

## 🎨 Color Palette (Tailwind Classes)
* **Background:** Very light gray/off-white (`bg-[#f9fafb]`)
* **Text (Primary):** Dark gray almost black (`text-gray-900`)
* **Text (Secondary/Muted):** Medium gray (`text-gray-500`)
* **Borders & Dividers:** Light gray (`border-gray-200`)

### 🚥 Status Colors (Uptime Grid)
We use a block-based grid system to show historical uptime. Each block represents a specific time frame (e.g., a day or an hour).
* **Operational (100%):** Green (`bg-[#2fcc66]` or Tailwind `bg-green-500`)
* **Degraded / Minor Outage:** Yellow/Orange (`bg-[#f5a623]` or Tailwind `bg-yellow-500`)
* **Major Outage:** Red (`bg-[#e05550]` or Tailwind `bg-red-500`)
* **No Data / Future:** Light Gray (`bg-gray-200`)

## 📐 Layout Structure
1. **Container:** Centered with max-width (`max-w-4xl mx-auto px-4 py-10`).
2. **Header:** Flexbox with Logo on the left and a dark "Subscribe" button on the right.
3. **Tabs:** Simple text tabs (`Incidents` | `Uptime`). Active tab has a bottom border (`border-b-2 border-gray-900`).
4. **Uptime Grid:** A flex/grid layout of small square blocks (`w-5 h-5 rounded-sm`) with a tooltip on hover.