export const services = [
    {
        icon: '🖥️',
        title: 'Screen Replacement',
        description: 'Fast replacement with original Apple screens'
    },
    {
        icon: '🔋',
        title: 'Battery Replacement',
        description: 'High-performance original batteries'
    },
    {
        icon: '💧',
        title: 'Water Damage Repair',
        description: 'Professional drying and repair process'
    }
]

export const steps = [
    {
        title: 'Select Your Device',
        description: 'Identify your model'
    },
    {
        title: 'Report Issue',
        description: 'Describe your problem'
    },
    {
        title: 'Quick Repair',
        description: 'Express service available'
    }
]

export const testimonials = [
    {
        text: "Excellent service experience!",
        author: "Ahmet Yilmaz"
    },
    {
        text: "They provide fast and reliable solutions.",
        author: "Mehmet Demir"
    }
]

export const faqs = [
    {
        question: "How long does the repair take?",
        answer: "Standard repairs are completed within 2-4 hours."
    },
    {
        question: "What is the warranty coverage?",
        answer: "We provide a 6-month warranty for all our repair services."
    }
]

// User data (for front-end demo)
export const users = [
    {
        id: 1,
        firstName: "Admin",
        lastName: "User",
        email: "admin@irevix.com",
        password: "Admpass123!",
        phone: "5551234567",
        role: "admin",
        address: "",
        serviceLocations: "Istanbul, Ankara, Izmir",
        serviceHistory: [],
        userPreferences: {
            notifications: true,
            marketing: false
        }
    },
    {
        id: 2,
        firstName: "Customer", // Changed from "Müşteri"
        lastName: "User", // Changed from "Kullanıcı"
        email: "customer@example.com", // Changed from "musteri@example.com"
        password: "Customer123!", // Changed from "Musteri123!"
        phone: "5559876543",
        role: "customer",
        address: "Istanbul, Kadikoy", // Removed accents
        serviceHistory: [
            {
                serviceId: 101,
                date: "2024-02-15",
                deviceType: "iPhone 13",
                issue: "Screen Replacement", // Changed from "Ekran Değişimi"
                status: "Completed", // Changed from "Tamamlandı"
                cost: 2500
            },
            {
                serviceId: 102,
                date: "2024-03-10",
                deviceType: "MacBook Pro",
                issue: "Battery Replacement", // Changed from "Batarya Değişimi"
                status: "Completed", // Changed from "Tamamlandı"
                cost: 1800
            }
        ],
        userPreferences: {
            notifications: true,
            marketing: true
        }
    },
    {
        id: 3,
        firstName: "Ahmet",
        lastName: "Technician", // Changed from "Tamirci"
        email: "technician@irevix.com", // Changed from "tamirci@irevix.com"
        password: "Techpass123!", // Changed from "Tamirci123!"
        phone: "5551234588",
        role: "tamirci", // Changed from "tamirci"
        address: "Istanbul, Besiktas", // Removed accents
        serviceLocations: "Istanbul, Besiktas, Sisli", // Removed accents
        specialties: ["Phone Repair", "Tablet Repair", "Computer Repair"], // Translated
        experience: "5 years", // Changed from "5 yıl"
        certification: "Electronics Repair Certificate", // Translated
        serviceHistory: [],
        userPreferences: {
            notifications: true,
            marketing: false
        }
    }
]