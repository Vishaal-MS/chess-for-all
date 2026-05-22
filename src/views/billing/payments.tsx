import {DateField, List, ResourceContextProvider, TextField} from 'react-admin';
import {formatAmount} from "../../utils";
import {DataTable, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import React, {useEffect} from "react";
import {getCurrentUserCoachId} from "../../backend/coaches.ts";
import {CoachesReferenceField} from "../coaches.tsx";

export const CoachPaymentsList = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [coachFilter,setCoachFilter] = React.useState({});
    useEffect(() => {
        const fetchCurrentUserCoachId = async () => {
            const coachId = await getCurrentUserCoachId(dataProvider);
            setCoachFilter({coach_id:coachId});
        }
        fetchCurrentUserCoachId();
    },[]);
    return (
    <ResourceContextProvider value={"payments"}>
        <List sort={{field:'date',order:'ASC'}} filter={coachFilter} pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} exporter={false}>
            <DataTable>
                <CoachesReferenceField source="coach_id" link={false}>
                    <TextField source='user.fullName' label={"Name"}/>
                </CoachesReferenceField>
                <DataTable.Col source="date" field={DateField} />
                <DataTable.Col render={record => formatAmount(record.amount)} label={"Amount"}/>
            </DataTable>
        </List>
    </ResourceContextProvider>
)};