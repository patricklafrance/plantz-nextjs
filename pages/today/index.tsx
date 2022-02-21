import { Box } from "@chakra-ui/react";

// const byLocation = useMemo(() => {
//     const result = items?.reduce((acc, x: PlantModel) => {
//         if (acc[x.location]) {
//             acc[x.location].push(x);
//         } else {
//             acc[x.location] = [x];
//         }

//         return acc;
//     }, {} as Record<string, PlantModel[]>) ?? {};

//     return Object.keys(result).sort().reduce((acc, x: string) => {
//         acc[x] = result[x];

//         return acc;
//     }, {} as Record<string, PlantModel[]>);
// }, [items]);

// return (
//     <>
//         {Object.keys(byLocation).map(x => (
//             <Stack spacing={6} key={x}>
//                 <Box>
//                     <Heading
//                         as="h3"
//                         size="lg"
//                         textTransform="capitalize"
//                         marginBottom={7}
//                     >
//                         {x}
//                     </Heading>
//                     <Stack>
//                         {byLocation[x].map((y: PlantModel, index) => (
//                             <Box
//                                 _last={{
//                                     marginBottom: 7
//                                 }}
//                                 key={index}
//                             >
//                                 <ListItem plant={y} />
//                                 {index + 1 !== byLocation[x].length && (
//                                     <Divider marginTop={2} />
//                                 )}
//                             </Box>
//                         ))}
//                     </Stack>
//                 </Box>
//             </Stack>
//         ))}
//     </>
// );

export default function TodayPage() {
    return (
        <Box>Today!</Box>
    );
}

TodayPage.pageTitle = "Today";
