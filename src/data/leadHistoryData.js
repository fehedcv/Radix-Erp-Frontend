/**
 * VYNX INFRASTRUCTURE - MASTER LEAD REPOSITORY
 * This is the 'Source of Truth' for initial data.
 */

export const initialLeads = [
  {
    id: "L-801",
    clientName: "Rahul Sharma",
    clientPhone: "+971 50 123 4567",
    clientAddress: "Apartment 4B, Marina Heights, Dubai",
    businessUnit: "Interior Design Unit",
    service: "Modular Kitchen",
    description: "Looking for a modern L-shaped kitchen with marble finish.",
    status: "Pending",
    date: "2025-12-18",
    credits: 0, // Mandatory for Admin Settlement Logic
    agentName: "Zaid Al-Farsi",
    agentId: "A-401"
  },
  {
    id: "L-802",
    clientName: "Sarah Khan",
    clientPhone: "+971 55 987 6543",
    clientAddress: "Villa 12, Jumeirah 3, Dubai",
    businessUnit: "IT Solutions",
    service: "Web App Development",
    description: "Need an e-commerce website for a boutique fashion brand.",
    status: "Pending",
    date: "2025-12-19",
    credits: 0, // Initial value before Admin manual release
    agentName: "Sarah Mehmood",
    agentId: "A-402"
  },
  {
    id: "L-803",
    clientName: "Muhammad Ali",
    clientPhone: "+971 52 445 8890",
    clientAddress: "Al Barsha, Dubai",
    businessUnit: "Manpower Solutions",
    service: "Safety Staffing",
    description: "Urgent need for safety officers for construction site.",
    status: "Verified",
    date: "2025-12-19",
    credits: 0,
    agentName: "Omar Al-Hassan",
    agentId: "A-403"
  }
];