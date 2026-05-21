import {
   AutocompleteInput,
   BooleanField, Button,
   DateField,
   List,
   ListProps,
   ReferenceField, ReferenceInput, SearchInput, SelectInput,
   useListContext,
   useRefresh,
   useUnselectAll
} from "react-admin";
import {DataTable, listDefaults, remoteLog, tableDefaults} from "@mahaswami/vc-frontend";
import {UsersReferenceField, UsersReferenceInput} from "../users.tsx";
import {RESOURCE} from "../ai_block_logs.tsx";
import {useState} from "react";

export const AiBlockLogsList = (props: ListProps) => {

   const [tenantId, setTenantId] = useState();
   const [archive, setArchive] = useState();
   const choise = [{id: true, name: 'Yes'}, {id: false, name: 'No'}];
   const feedbackStatus = [{id: true, name: 'Posivitive'}, {id: false, name: 'Negative'}];

   const filter = [
      <SearchInput source="q" alwaysOn/>,
      <ReferenceInput source="tenant_id" perPage={10000} reference="tenants" alwaysOn>
         <AutocompleteInput optionText="name" onChange={(selectedId) => setTenantId(selectedId)}/>
      </ReferenceInput>,
      <UsersReferenceInput source="user_id" reference="users" filter={tenantId ? {tenant_id: tenantId}: {}}
                           perPage={10000} alwaysOn />,
      <SelectInput label="Status" source={"feedback_status"} choices={feedbackStatus} alwaysOn/>,
      <SelectInput label="Error" source={"is_ai_error"} choices={choise} alwaysOn/>,
      <SelectInput label="Archived" source={"is_archived"} choices={choise} onChange={(e) => setArchive(e.target.value)} alwaysOn/>
   ];


   return (
       <List {...listDefaults(props)} filters={filter}>
          <DataTable {...tableDefaults(RESOURCE)} bulkActionButtons={<ArchiveButton archived={archive}/>}
                     hiddenColumns={['notes', 'is_ai_error', 'stack_trace', 'is_archived', 'user_id', 'division_id', 'name', 'lesson_block_id', 'ai_usage']} >
             <DataTable.Col source="log_timestamp" field={(props: any) => <DateField {...props} showTime />}/>
             <DataTable.Col source="tenant_id" field={() => <ReferenceField reference="tenants" source="tenant_id" />} />
             <DataTable.Col source="user_id" field={UsersReferenceField}/>
             <DataTable.Col source="name" />
             <DataTable.Col source="ai_response" />
             <DataTable.Col source="feedback_text" />
             <DataTable.Col source="feedback_status" field={BooleanField} />
          </DataTable>
       </List>
   )
}

export const ArchiveButton = ({archived}) => {

   const {selectedIds} = useListContext();
   const unselectAll = useUnselectAll("ai_block_logs");
   const refresh = useRefresh();
   const dataProvider = window.swanAppFunctions.dataProvider;
   const isArchived = archived;

   const handleArchive = async() =>  {
      try {
         await Promise.all(
             selectedIds.map((selectedId) =>
                 dataProvider.update("ai_block_logs", { id: selectedId,  data: {is_archived: !isArchived} })
             )
         );
         unselectAll();
         refresh();
      } catch (error) {
         remoteLog("Error sending on AI block logs ArchiveButton: ", error);
      }
   }
   return(<Button label={isArchived ? "Unarchive" : "Archive"} onClick={handleArchive} />);
}