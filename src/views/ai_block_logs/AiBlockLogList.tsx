import { PER_PAGE, remoteLog, SensibleDefaultPagination } from "@mahaswami/vc-frontend";
import { useState } from "react";
import { 
   AutocompleteInput,
   BooleanField, Button, Datagrid, DateField, List, ReferenceField, 
   ReferenceInput, SearchInput, SelectInput, TextField, useListContext, useRefresh, useUnselectAll 
} from "react-admin";

export const AiBlockLogList = () => {

   const [tenantId, setTenantId] = useState();
   const [archive, setArchive] = useState();
   const choise = [{id: true, name: 'Yes'}, {id: false, name: 'No'}];
   const feedbackStatus = [{id: true, name: 'Posivitive'}, {id: false, name: 'Negative'}];

   const filter = [
      <SearchInput source="q" alwaysOn/>,
      <ReferenceInput source="tenant_id" perPage={10000} reference="tenants" alwaysOn>
         <AutocompleteInput optionText="name" onChange={(selectedId) => setTenantId(selectedId)}/>
      </ReferenceInput>,
      <ReferenceInput source="user_id" reference="users" filter={tenantId ? {tenant_id: tenantId}: {}} perPage={10000} alwaysOn>
         <AutocompleteInput optionText="fullName"/>
      </ReferenceInput>,
      <SelectInput label="Status" source={"feedback_status"} choices={feedbackStatus} alwaysOn/>,
      <SelectInput label="Error" source={"is_ai_error"} choices={choise} alwaysOn/>,
      <SelectInput label="Archived" source={"is_archived"} choices={choise} onChange={(e) => setArchive(e.target.value)} alwaysOn/>
   ]; 

   return(
      <List filters={filter} filterDefaultValues={{is_archived: false}} 
         resource="ai_block_logs" actions={false} sort={{field:'log_timestamp', order:'DESC'}}
         pagination={<SensibleDefaultPagination />} perPage={PER_PAGE}>
         <Datagrid bulkActionButtons={<ArchiveButton archived={archive}/>}>
            <DateField label="Log Timestamp" source="log_timestamp" showTime/>
            <ReferenceField reference="tenants" source="tenant_id">
               <TextField source="name"/>
            </ReferenceField>
            <ReferenceField reference="users" source="user_id">
               <TextField source="fullName"/>
            </ReferenceField>
            <TextField label="Name" source="name" />
            <BooleanField label="Feedback Status" source="feedback_status"/>
         </Datagrid>
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