import { EventArgs, EventEmitter, EventListener } from "eventemitter3";
import { useCallback, useEffect } from "react";

const IsLogEvents = process.env.LOG_EVENTS === "true";

const instance = new EventEmitter();

function logEmittedEvent(eventName: string, eventData: EventArgs<string, string>) {
    console.groupCollapsed(`*** ${eventName}`);
    console.dir(...eventData);
    console.groupEnd();
}

export function useEventEmitter() {
    const emit = useCallback((eventName: string, ...args: EventArgs<string, string>) => {
        if (IsLogEvents) {
            logEmittedEvent(eventName, args);
        }

        instance.emit(eventName, ...args);
    }, []);

    return emit;
}

export function useEventSubcriber(eventName: string, callback: EventListener<string, string>, context?: any) {
    const unsubscribe = useCallback(() => {
        instance.removeListener(eventName, callback, context);
    }, [eventName, callback, context]);

    useEffect(() => {
        instance.addListener(eventName, callback, context);

        return () => {
            unsubscribe();
        };
    }, [eventName, callback, context, unsubscribe]);

    return unsubscribe;
}
