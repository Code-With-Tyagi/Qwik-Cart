import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const scrollTargets = [
            document.querySelector("[data-scroll-container='page']"),
            document.scrollingElement,
            document.documentElement,
            document.body,
        ].filter(Boolean);

        scrollTargets.forEach((target) => {
            target.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
            if (!target.scrollTo) {
                target.scrollTop = 0;
                target.scrollLeft = 0;
            }
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;