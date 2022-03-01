import { TodayView, TodayViewProps } from "@features/plants/TodayView";

import { GetServerSideProps } from "next";
import { getDuePlants } from "@features/plants/server";
import { toDuePlantModel } from "@features/plants";

export default function TodayPage(props: TodayViewProps) {
    return (
        <TodayView {...props} />
    );
}

TodayPage.pageTitle = "Today";

export const getServerSideProps: GetServerSideProps = async () => {
    const results = await getDuePlants();

    return {
        props: {
            plants: results.map(x => toDuePlantModel(x))
        }
    };
};
