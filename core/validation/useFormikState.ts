import { FormikErrors, FormikState, FormikValues } from "formik";

import { useCallback } from "react";

export type UseFormikStateReturn<T extends FormikValues> = {
    getErrorMessage: (fieldId: keyof T) => FormikErrors<T>[keyof T];
    getValue: (fieldId: keyof T) => any;
    isValid: (fieldId: keyof T) => boolean;
}

export function useFormikState<T extends FormikValues>({ errors, touched, values }: FormikState<T>): UseFormikStateReturn<T> {
    const isValid = useCallback((fieldId: keyof T) => {
        return (errors[fieldId] && touched[fieldId]) as boolean;
    }, [errors, touched]);

    const getValue = useCallback((fieldId: keyof T) => {
        return values[fieldId];
    }, [values]);

    const getErrorMessage = useCallback((fieldId: keyof T) => {
        return errors[fieldId];
    }, [errors]);

    return {
        getErrorMessage,
        getValue,
        isValid
    };
}

export function isValid<T extends FormikValues>(fieldId: keyof T, { errors, touched }: FormikState<T>) {
    return (errors[fieldId] && touched[fieldId]) as boolean;
}

export function getValue<T extends FormikValues>(fieldId: keyof T, { values }: FormikState<T>) {
    return values[fieldId];
}

export function getErrorMessage<T extends FormikValues>(fieldId: keyof T, { errors }: FormikState<T>) {
    return errors[fieldId];
}
