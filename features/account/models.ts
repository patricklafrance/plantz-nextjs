export const LicensingStatusValuesAndLabels = {
    "paid": "Paid",
    "trial-expired": "Trial expired",
    "trialing": "Trialing"
} as const;

export type LicensingStatus = keyof typeof LicensingStatusValuesAndLabels;

export interface UserModel {
    email: string;
    id: string;
    image: string;
    licensingStatus: LicensingStatus;
    name: string;
}

export interface UpdateLicensingStatusModel {
    licensingStatus: LicensingStatus;
    userId: string;
}
