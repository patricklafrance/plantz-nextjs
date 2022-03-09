import { RefObject, useEffect } from "react";

import { isNil } from "@core/utils";

export function useIsInViewport(ref: RefObject<HTMLElement>, onVisible: () => void) {
    useEffect(() => {
        const options = {
            rootMargin: "0px"
        };

        const element = ref.current;

        const unobserve = () => {
            if (!isNil(element)) {
                observer.unobserve(element);
            }
        };

        const handler: IntersectionObserverCallback = ([entry]) => {
            if (entry.isIntersecting) {
                onVisible();
                unobserve();
            }
        };

        const observer = new IntersectionObserver(handler, options);

        if (!isNil(element)) {
            observer.observe(element);
        }

        return () => {
            unobserve();
        };
    }, [ref, onVisible]);
};
