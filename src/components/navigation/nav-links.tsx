// src/components/navigation/nav-links.tsx

import { ScrollLink } from "@/components/navigation/scroll-link"

export const NavLinks = () => {

    const menuItems = [
        { title: "Hero", id: "heroSection" },
        { title: "Features", id: "featuresSection" },
        { title: "Services", id: "servicesSection" },
        { title: "Contact", id: "contactSection" },
    ]
  return (
    <ul 
        className=" flex flex-col lg:flex-row mt-2 lg:mt-0 lg:space-x-8 space-y-2 lg:space-y-0"
    >
        {menuItems.map((item, index) => (
            <li
                key={index}
                className="text-xl font-medium lg:hover:text-primary hover:bg-secondary lg:hover:bg-transparent rounded-md transition-colors"
            >
                <ScrollLink
                    targetId={item.id}
                    offset={-40}
                    duration={700}
                    smoothScroll={true}
                    threshold={0.4}
                    className="block py-2 pl-3 pr-4 rounded-md"
                    activeClassName="text-primary-foreground lg:text-primary bg-primary lg:bg-transparent transition-all duration-300"
                >
                    {item.title}
                </ScrollLink>
            </li>
        ))}
    </ul>
  )
}
