import isDeepEqual from "fast-deep-equal/react";
import { useRef } from "react";

export function useComplexDependency<T>(dependency: T) {
    const ref = useRef<T>(dependency);

    if (!isDeepEqual(ref.current, dependency)) {
        ref.current = dependency;
    }

    return ref.current;
}
