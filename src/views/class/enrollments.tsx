import React from "react";
import {PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {List, Datagrid, TextField, FunctionField, DateField} from "react-admin";
import {ListTitle} from "../../components/Title.tsx";
import {ClassesStatus} from "../../helpers/constants.ts";

export const EnrollmentsList = () => {
    return(
        <List title={<ListTitle resourceName="Classes List"/>} sort={{field: 'enrollment_date', order: 'DESC'}}
              pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} exporter={false}
              queryOptions={{meta: {prefetch: ['classes']}}}>
            <Datagrid bulkActionButtons={false}>
                <TextField source={"class.name"} label='Class'/>
                <DateField source="enrollment_date" label={"Enrollment Date"}/>
                <FunctionField render={record => {
                    if (record?.class.status === ClassesStatus.COMPLETED) {
                        return <DateField source={"class.end_date"} />
                    } else {
                        return "";
                    }
                }} label={"Completion Date"}/>
                <FunctionField render={record => {
                    return record.class.status === ClassesStatus.COMPLETED ? 'Completed' : record.class.status === ClassesStatus.ACTIVE ? 'In Progress' : 'Not Started';
                }} label={"Status"}/>
            </Datagrid>
        </List>
    );
}