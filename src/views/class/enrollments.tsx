import {DataTable, listDefaults, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {List, DateField} from "react-admin";
import {ClassesStatus} from "../../helpers/constants.ts";

export const EnrollmentsList = (props: any) => {
    return(
        <List { ...listDefaults(props)} sort={{ field: 'enrollment_date', order: 'DESC' }}
              pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} exporter={false}>
            <DataTable bulkActionButtons={false}>
                <DataTable.Col source={"class.name"} label='Class'/>
                <DataTable.Col source="enrollment_date" label={"Enrollment Date"} field={DateField}/>
                <DataTable.Col render={record => {
                    if (record?.class.status === ClassesStatus.COMPLETED) {
                        return <DateField source={"class.end_date"} />
                    } else {
                        return "";
                    }
                }} label={"Completion Date"}/>
                <DataTable.Col render={record => {
                    return record.class.status === ClassesStatus.COMPLETED ?
                        'Completed' : record.class.status === ClassesStatus.ACTIVE ? 'In Progress' : 'Not Started';
                }} label={"Status"}/>
            </DataTable>
        </List>
    );
}