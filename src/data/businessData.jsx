// src/data/businessData.js
import { Building2, Briefcase, Calendar, Monitor } from 'lucide-react';

export const businessUnits = [
  {
    id: 1,
    name: "Interior Design Unit",
    description: "Premium interior solutions for homes and luxury villas.",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616489953149-864c29928a07?auto=format&fit=crop&w=800&q=80"
    ],
    products: ["Modular Kitchen", "Living Room Decor"],
    icon: <Building2 />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    location: "Business Bay, Dubai",
    creditsPerDeal: 50
  },
  {
    id: 2,
    name: "Manpower Solutions",
    description: "Skilled labor and industrial staff supply services.",
    coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&w=800&q=80"
    ],
    products: ["Construction Labor", "Safety Staff"],
    icon: <Briefcase />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    location: "Al Quoz, Dubai",
    creditsPerDeal: 35
  }
  // Bakki units-um ithupole add cheyyaam [cite: 58]
];