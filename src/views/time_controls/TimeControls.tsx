
import { PER_PAGE, SensibleDefaultPagination } from "@mahaswami/swan-service";
import {
    Datagrid,
    NumberField,
    NumberInput,
    required,
    SelectInput,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput
} from "react-admin";
import { ListTitle, RecordTitle } from "../../components/Title";
import { gameCategory } from "../../helpers/constants";
import { SwanCreate, SwanEdit, SwanList, SwanShow } from "../swan_crud/SwanCrud";



export const TimeControlList = () => {

    const filters = [
      <SelectInput source="name" choices={gameCategory} alwaysOn/>,
    ];

    return (
        <SwanList exporter={false} filters={filters}
            pagination={<SensibleDefaultPagination />}
            perPage={PER_PAGE} resource="time_controls"
            title={<ListTitle resourceName="Game Time Controls" />}
        >
            <Datagrid rowClick="show">
                <TextField source="name" />
                <NumberField source="base_time_number" label="Base Time (sec)" />
                <NumberField source="increment_time_number" label="Increment Time (sec)" />
            </Datagrid>
        </SwanList>
    );
}

export const TimeControlCreate = () => (
    <SwanCreate title={<ListTitle resourceName="New Game Time Control" />} redirect="list">
        <TimeControlForm />
    </SwanCreate>
);

export const TimeControlEdit = () => (
    <SwanEdit title={<RecordTitle resourceName="Game Time Control" source="name" />} redirect="show" mutationMode="pessimistic">
        <TimeControlForm />
    </SwanEdit>
);

const TimeControlForm = () => (
    <SimpleForm>
        <SelectInput validate={required()} source="name" choices={gameCategory} />
        <NumberInput validate={required()} source="base_time_number" label="Base Time (seconds)" />
        <NumberInput validate={required()} source="increment_time_number" label="Increment (seconds)" />
        <TextInput validate={required()} source="description" multiline />
    </SimpleForm>
);

export const TimeControlShow = () => (
    <SwanShow title={<RecordTitle resourceName="Game Time Control" source="name" />} >
        <SimpleShowLayout>
            <TextField source="name" />
            <NumberField source="base_time_number" label="Base Time (seconds)" />
            <NumberField source="increment_time_number" label="Increment (seconds)" />
            <TextField source="description" />
        </SimpleShowLayout>
    </SwanShow>
);

