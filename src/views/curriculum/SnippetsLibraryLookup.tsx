import { Fab, Tooltip, Typography, Switch, Box, FormControlLabel } from "@mui/material";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import {
  Button, Datagrid, List, Pagination, TextField, useRecordContext,
    SearchInput, AutocompleteArrayInput, ReferenceArrayInput, SelectInput,
} from "react-admin";
import {useState} from "react";
import {closeDialog, openDialog} from "@mahaswami/vc-frontend";
import { EmptyDatagridHeader } from "../../fields/EmptyDatagridHeader.tsx";
import { clearChessBoards } from "../../fields/ai_lesson/ai_lesson_utils.ts";
import {getTypeChoices} from "../snippets_library/SnippetsLibrary.tsx";
import {Empty} from "../../common/empty.tsx";

const SelectButton = ({onSelect}) => {
  const record = useRecordContext();

  const handleSelection = (event) => {
    event.stopPropagation();
    onSelect(record);
    closeDialog();
  }
  return <Button variant="contained" label="Insert" onClick={handleSelection}></Button>
}

export const SnippetsChooser = ({setSample}) => {
  const[isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const PostPagination = () => <Pagination rowsPerPageOptions={[50, 100, 250]}/>;
  const perPage=  {perPage: !isAdvanced ? 1000 : 50};

  const filters = [
    <SearchInput source="q" alwaysOn/>,
    <SelectInput source="type" choices={getTypeChoices()} alwaysOn/>,
    <ReferenceArrayInput source="tag_ids" reference="tags" alwaysOn queryOptions={{meta: {scopingEscapeHatch: true}}}
                         perPage={1000} sort={{field: 'name', order: 'ASC'}}>
        <AutocompleteArrayInput label="Tags"/>
    </ReferenceArrayInput>
  ];

  const sort = !isAdvanced ? {field: "position_number", order: "ASC"} : {field: "title", order: "ASC"}

  return(
    <>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Typography variant="h6">
        Snippets Library
      </Typography>
        <Box sx={{ position: 'absolute', right: '1em' }}>
          <FormControlLabel control={ <Switch defaultChecked={false} onChange={(e) => setIsAdvanced(e.target.checked)} /> } label={"Advanced"}/>
        </Box>
      </Box>
  <List
    key={isAdvanced.toString()}
    actions={false}
    resource="snippets_library"
    empty={<Empty emptyText={"No Advanced Snippets Yet"}/>}
    disableSyncWithLocation
    queryOptions={{meta: {scopingEscapeHatch:true}}}
    sort={sort}
    exporter={false}
    filter={{is_advanced: isAdvanced}}
    filters={filters}
    filterDefaultValues={{is_advanced: false}}
    pagination={isAdvanced && <PostPagination />}
    {...perPage}
  >
    <Datagrid header={<EmptyDatagridHeader/>}
      bulkActionButtons={false}
      rowClick={false}
      sx={{
        maxHeight: { xs: '40vh', md: '45vh' },
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        minWidth: '100%',
      }}
    >
      <TextField source="type" />
      <TextField source="title" />
      <SelectButton onSelect={setSample}></SelectButton>
    </Datagrid>
  </List></>);
}

export const SnippetsLibraryLookup = ({setSample}) => {
  const handleClick = (event) => {
    clearChessBoards();
    openDialog(<SnippetsChooser setSample={setSample} />);
  }
  return (
    <Fab variant="extended" size={"small"} color="primary" onClick={handleClick}
         sx={{mt: 1}}
    >
      <Tooltip title="Snippets Library" placement="auto">
      <LibraryBooksIcon/>
      </Tooltip>
    </Fab>
  )
}