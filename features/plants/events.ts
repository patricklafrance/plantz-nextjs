export const SearchQueryChangedEvent = "SearchQueryChanged";
export const PlantAddedEvent = "PlantAdded";
export const PlantUpdatedEvent = "PlantUpdated";
export const PlantDeletedEvent = "PlantDeleted";
export const NoResultsClearedEvent = "NoResultsCleared";

export interface SearchQueryChangedData {
    query?: string;
}

export interface PlantAddedEvent {
    id: string;
}

export interface PlantUpdatedEvent {
    id: string;
}

export interface PlantDeletedEvent {
    id: string;
}
