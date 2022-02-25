import { TodayListView, TodayListViewProps } from "@features/plants/TodayListView";

import { GetServerSideProps } from "next";
import { getDuePlants } from "@features/plants/server";
import { toPlantSummaryModel } from "@features/plants";

export default function TodayPage(props: TodayListViewProps) {
    return (
        <TodayListView {...props} />
    );
}

TodayPage.pageTitle = "Today";

export const getServerSideProps: GetServerSideProps = async () => {
    const results = await getDuePlants();

    return {
        props: {
            plants: results.map(x => toPlantSummaryModel(x))
        }
    };
};
