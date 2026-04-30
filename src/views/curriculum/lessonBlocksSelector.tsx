import { Button, Datagrid, List, SearchInput, SelectField, TextField, useRecordContext } from "react-admin";
import { getBlockTypeChoices } from "./lesson_blocks";
import {Box,Typography} from "@mui/material";
import { useEffect } from "react";
import {useState} from "react";
import { LessonBlockField } from "../../fields/ai_lesson/lesson_block_field.tsx";
import { clearChessBoards, loadChessBoards } from "../../fields/ai_lesson/ai_lesson_utils.ts";
import {closeDialog, openDialog} from "@mahaswami/vc-frontend";
import {Empty} from "../../common/empty.tsx";

const blockFilters = [
  <SearchInput source="q" alwaysOn />,
];

const SelectButton = ({onInsert}) => {
    const record = useRecordContext();
    const [isInserting, setIsInserting] = useState(false);

    const handleInsert = () => {
        if (record && onInsert) {
            setIsInserting(true);
            onInsert(record); // callback to insert logic
            setIsInserting(false);
            closeDialog();
        }
    };
    const handlePreview = (event) => {
        event.stopPropagation();
        clearChessBoards();
        //loadChessBoards after a timeout of 100ms
        setTimeout(() => {
            loadChessBoards();
        }, 100);
        openDialog(<PreviewLessonBlock width="50vw" record={record} handleInsert={handleInsert} isInserting={isInserting} />)
    }
    return (
        <Box style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
            <Button variant="contained" label="Preview" onClick={handlePreview} />
            <Button disabled={isInserting} sx={{ml: '0.5em'}} variant="contained" label={"Insert"} onClick={handleInsert}/>
        </Box>
    )
}

const PreviewLessonBlock = ({record, handleInsert, isInserting}) => {
    useEffect(() => {
        return () => {
            clearChessBoards();
        }
    }, []);
    return(
        <Box
            sx={{
                flex: 2,
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: 1,
                backgroundColor: (theme) => theme.palette.background.paper,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {record ? (
                <>
                    <Typography variant="h6" textAlign="center" gutterBottom>
                        Preview
                    </Typography>
                    <Box sx={{ height: '65vh', overflowY: 'auto', scrollbarWidth: 'thin', alignContent:"center" }}>
                        <LessonBlockField record={record} maxSize={'70%/max=335'}/>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleInsert}
                            disabled={isInserting} label={"Insert Block"}
                        >
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography variant="body1" color="text.secondary">
                    Select a block to preview
                </Typography>
            )}
        </Box>
    );
}

export const  LessonBlockSelectors = ({ onInsert }) => {
/*  useEffect(() => {
    return() => {
      clearChessBoards();
    }
  }, []);*/

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, padding: 1 }}>
      {/* List Section */}
      <Box
        sx={{
          flex: 2,
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: 1,
          height: '68vh',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <List
          storeKey="lesson-blocks-selector"
          actions={false}
          resource="lesson_blocks"
          filters={blockFilters}
          exporter={false}
          empty={<Empty emptyText="No Lesson Blocks Found" />}
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={false}
            sx={{
              maxHeight: '45vh',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              minWidth: '100%',
            }}
          >
            <TextField source="name" />
            <SelectField source="block_type" label={"Type"} choices={getBlockTypeChoices()} />
            <SelectButton onInsert={onInsert} />
          </Datagrid>
        </List>
      </Box>
    </Box>
  );
}