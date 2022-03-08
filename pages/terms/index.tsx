import { Heading, Text } from "@chakra-ui/react";

import { AuthenticatedLayout } from "@layouts";
import { ReactNode } from "react";

export default function TermsPage() {
    return (
        <>
            <Heading as="h1" marginBottom={12}>Terms</Heading>
            <Text as="p">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras faucibus id purus a aliquam. Donec pulvinar tristique orci in fermentum. Phasellus augue enim, pellentesque sit amet tortor et, scelerisque dapibus purus. Nulla hendrerit dui quis libero malesuada blandit. Mauris mattis, nibh quis porttitor ultrices, magna diam faucibus nunc, vitae aliquet ligula massa et ex. Sed pellentesque molestie justo, vitae sagittis purus imperdiet mollis. Aenean non laoreet sapien. Donec lobortis est velit, et mollis est mollis ornare. Nulla nibh magna, viverra at metus a, facilisis rutrum velit. Nulla non nunc egestas, ultricies quam vel, iaculis nulla. Fusce sed congue diam. Donec sed lacus ut lacus ultricies efficitur non sit amet risus. Nullam mattis nunc nibh, semper feugiat nibh placerat at.
            </Text>
            <Text as="p">
                Mauris tempor egestas orci vitae pulvinar. Proin libero tortor, venenatis sit amet nunc id, rutrum porta ipsum. Duis dignissim viverra nunc, non pharetra diam aliquam ac. Curabitur sagittis egestas turpis, non consectetur nisi interdum sed. Proin nec nisl nec augue rhoncus fringilla. Morbi nec dolor eu neque congue viverra in quis magna. Etiam finibus nisl eget lorem maximus gravida. Cras ut augue dui. Mauris ut dictum augue, finibus auctor nibh. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum accumsan suscipit ipsum, sit amet semper leo tincidunt non. Morbi feugiat sollicitudin magna.
            </Text>
            <Text as="p">
                Nam in ligula orci. Pellentesque nec nisi neque. Morbi nibh ipsum, interdum ut dapibus sed, mollis at sapien. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vel felis porta est faucibus vestibulum. Nam molestie dapibus enim, id mattis ante lacinia non. Pellentesque ultricies dolor et ante suscipit, id congue velit lacinia. Donec id orci sed elit sodales fermentum. Curabitur imperdiet sollicitudin porttitor. Donec ultrices sagittis leo, in hendrerit erat eleifend nec. Maecenas ex velit, luctus non aliquet a, egestas vitae lectus.
            </Text>
        </>
    );
}

TermsPage.getLayout = (page: ReactNode) => {
    return (
        <AuthenticatedLayout pageTitle="Terms">
            {page}
        </AuthenticatedLayout>
    );
};
