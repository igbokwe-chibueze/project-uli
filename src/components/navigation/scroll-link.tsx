// src/components/navigation/scroll-link.tsx

import { ReactNode, useEffect, useState } from "react";

type ScrollLinkProps = {
    targetId: string; // The ID of the section to scroll to
    offset?: number; // Optional offset for fine-tuning the scroll position
    duration?: number; // Duration of the scroll animation (in milliseconds)
    smoothScroll?: boolean; // Whether to enable smooth scrolling (default: true)
    threshold?: number; // Threshold for visibility (default: 0.6). Percentage of the section that must be visible to trigger the active state.
    children: ReactNode; // Content inside the wrapper (e.g., link, button, etc.)
    activeClassName?: string; // Class to apply when the link is active
    className?: string; // Class to apply when the link is inactive
};

export const ScrollLink = ({
    targetId,
    offset = -80,
    duration = 500,
    smoothScroll = true,
    threshold = 0.6,
    children,
    activeClassName = "", // Default styling for active state
    className = "", // Default styling for inactive state
}: ScrollLinkProps) => {

    const [isActive, setIsActive] = useState(false); // State to track if the link is active

    useEffect(() => {
        // Retrieve the target element by its ID
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return; // If the element doesn't exist, exit early

        // Options for the Intersection Observer
        const observerOptions = {
            root: null, // Observe visibility relative to the viewport
            threshold, // Percentage of the element that must be visible to trigger the callback
        };

        let highestIntersection = 0; // Variable to track the highest intersection ratio

        // Callback function for the Intersection Observer
        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.target.id === targetId) {
                    // Check if this section is intersecting and has the highest intersection ratio
                    if (entry.isIntersecting && entry.intersectionRatio > highestIntersection) {
                        highestIntersection = entry.intersectionRatio; // Update the highest ratio
                        setIsActive(true); // Mark this section as active

                        // Update the hash without adding a history entry
                        if (window.location.hash !== `#${targetId}`) {
                            window.history.replaceState(null, "", `#${targetId}`);
                        }
                    } else {
                        setIsActive(false); // If not intersecting, deactivate
                    }
                }
            });

            // Reset the highest intersection ratio after processing all entries
            highestIntersection = 0;
        };

        // Create a new Intersection Observer and observe the target element
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(targetElement);

        // Cleanup function to disconnect the observer when the component unmounts
        return () => {
            observer.disconnect();
        };
    }, [targetId, threshold]); // Dependencies ensure the effect runs again if these values change

    // Function to handle smooth scrolling to the target section
    const handleScroll = () => {
        const targetElement = document.getElementById(targetId); // Get the target element by its ID
        if (!targetElement) return; // If the element doesn't exist, exit early

        // Calculate the target scroll position with the specified offset
        const targetPosition =
            targetElement.getBoundingClientRect().top + window.scrollY + offset;

        if (smoothScroll) {
            // Perform smooth scrolling if enabled
            smoothScrollTo(targetPosition, duration);
        } else {
            // Perform immediate scrolling if smooth scrolling is disabled
            window.scrollTo(0, targetPosition);
        }
    };

    // Function to perform smooth scrolling animation
    const smoothScrollTo = (target: number, duration: number) => {
        const start = window.scrollY; // Starting scroll position
        const distance = target - start; // Distance to scroll
        const startTime = performance.now(); // Timestamp for animation start

        // Easing function for smooth animation (ease-in-out quadratic)
        const easeInOutQuad = (time: number, start: number, distance: number, duration: number) => {
            time /= duration / 2;
            if (time < 1) return (distance / 2) * time * time + start;
            time--;
            return (-distance / 2) * (time * (time - 2) - 1) + start;
        };

        // Animation loop for smooth scrolling
        const animateScroll = (currentTime: number) => {
            const timeElapsed = currentTime - startTime; // Time elapsed since animation started
            const run = easeInOutQuad(timeElapsed, start, distance, duration); // Calculate the scroll position
            window.scrollTo(0, run); // Scroll to the calculated position
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll); // Continue animation until duration ends
            }
        };

        requestAnimationFrame(animateScroll); // Start the animation
    };

    return (
        <span
            onClick={handleScroll} // Scroll to the target section when clicked
            className={`cursor-pointer ${className} ${isActive ? activeClassName : ""}`}
        >
            {children}
        </span>
    );
}
