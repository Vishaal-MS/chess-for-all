import { useState } from "react";
import { isSuperAdmin } from "../../businessLogic";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import categoriesCsv from '../sample_files/standard_sample_files/categories.csv?raw';
import gradesCsv from '../sample_files/standard_sample_files/grades.csv?raw';
import sectionsCsv from '../sample_files/standard_sample_files/sections.csv?raw';
import {closeDialog, DataTable, listDefaults, openDialog} from "@mahaswami/vc-frontend";
import {Button, Empty, List, Loading, TextField, TopToolbar, useNotify} from "react-admin";
import {Typography, TextField as MUITextField, Box} from "@mui/material";
import {DragAndDropCsvFile} from "../common/dragAndDropCsvFile.tsx";
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import { RecordTitle } from "../../components/Title.tsx";

export const StandardList = (props) => {
    const superAdmin = isSuperAdmin();
    const [state, setState] = useState({
        currentLoading: 0,
        isLoading: false,
        total: 100,
    });

    const downloadSampleCsv = () => {
        const zip = new JSZip();
        zip.file("categories.csv", categoriesCsv);
        zip.file("grades.csv", gradesCsv);
        zip.file("sections.csv", sectionsCsv);
        zip.generateAsync({type:"blob"}).then(function(content) {
            saveAs(content, "standard_sample_csv_file.zip");
        });
    };

    const importFileDialog = () => (
        openDialog(<ImportStandardFile setState={setState}/>)
    )


    const ImportButtonToolBar = ({isEmpty}) => (
        <TopToolbar  sx={isEmpty ? {justifyContent: 'center'} : {}}>
            <Button startIcon={<DownloadIcon/>} label={"Sample Csv"} onClick={downloadSampleCsv}/>
            <Button startIcon={<FileUploadRoundedIcon />} label={"Import"} onClick={importFileDialog}/>
        </TopToolbar>
    )

    if (state.isLoading)
        return <Loading loadingPrimary={`${Math.round((state.currentLoading * 100) / state.total) } %`}/>


    return (
        <List {...listDefaults(props)} resource="standards" empty={<Empty actions={superAdmin ? <ImportButtonToolBar isEmpty/> : false} emptyText={""} />}
                  title={<RecordTitle resourceName={"Standard"}/>} exporter={false} actions={superAdmin ? <ImportButtonToolBar /> : false} sx={{mt: superAdmin ? 0 : 4}}>
            <DataTable bulkActionButtons={false}>
                <DataTable.Col source="name"/>
            </DataTable>
        </List>
    );
}

const ImportStandardFile = ({ setState }) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [categoryFileData, setCategoryFileData] = useState([]);
    const [sectionFileData, setSectionFileData] = useState([]);
    const [gradeFileData, setGradeFileData] = useState([]);
    const [standardName, setStandardName] = useState('')
    setState((prev) => ({...prev, total: categoryFileData.length + sectionFileData.length + gradeFileData.length}));
    const notify = useNotify();
    const onCloseDialog = () => {
        closeDialog();
    }

    const importData = async () => {
        if (categoryFileData.length === 0 || sectionFileData.length === 0 || gradeFileData.length === 0 || standardName.trim() === '') return;

        const { data: standards } = await dataProvider.getList('standards', {
            filter: { name: standardName.trim() },
            meta: { scopingEscapeHatch: true }
        });

        if (standards?.length > 0) {
            const standard = standards[0];
            openDialog(<MergeDialog standardId={standard.id} width='40vw'/>);
        } else {
            const { data: standard } = await dataProvider.create('standards', { data: { name: standardName.trim() } });
            await processImport(standard.id, false);
        }
    };

    const MergeDialog = ({standardId}) => {
        const onConfirm = () => {
            closeDialog();
            processImport(standardId, true);
        }
        return (
            <>
                <Typography sx={{mb: 2}}>
                    Standard already exists. Do you want to merge with the existing standard?
                </Typography>
                <Button onClick={() => closeDialog()} label="Cancel"/>
                <Button onClick={onConfirm} label="Merge"/>
            </>
        )
    };

    const processImport = async (standardId, merge) => {
        const categoryCodeMap = {};
        const gradeCodeMap = {};
        const uniqueCategoryCodes = new Map();
        const uniqueGradeCodes = new Map();
        const uniqueSectionCodes = new Map();
        setState((prev: any) => ({...prev, isLoading: true}));
        onCloseDialog();

        function chunkArray(array, size) {
            const chunks = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        }

        async function processInBatches(items, batchSize, processor) {
            const chunks = chunkArray(items, batchSize);
            for (const batch of chunks) {
                await Promise.all(batch.map(item => processor(item)));
            }
        }

        const {data: existingGrades} = await dataProvider.getList('standard_grades', {
            filter: {standard_id: standardId},
            pagination: {page: 1, perPage: 1000},
            meta: {scopingEscapeHatch: true}
        });

        gradeFileData.forEach(grade => {
            const key = grade.grade_id;
            if (!uniqueGradeCodes.has(key)) {
                uniqueGradeCodes.set(key, {
                    code: grade.grade_id,
                    name: grade.grade_name,
                    standard_id: standardId
                });
            }
        });

        // Create or update grades
        const grades = Array.from(uniqueGradeCodes.values());
        await processInBatches(grades, 10, async (grade) => {
            try {
                if (!grade.code) return;

                if (merge) {
                    const existingGrade = existingGrades.find(g => g.code === grade.code);
                    if (existingGrade) {
                        await dataProvider.update('standard_grades', {id: existingGrade.id, data: grade});
                        gradeCodeMap[grade.code] = existingGrade.id;
                    } else {
                        const response = await dataProvider.create('standard_grades', {data: grade});
                        gradeCodeMap[grade.code] = response.data.id;
                    }
                } else {
                    const response = await dataProvider.create('standard_grades', {data: grade});
                    gradeCodeMap[grade.code] = response.data.id;
                }
                setState(prev => ({...prev, currentLoading: prev.currentLoading + 1}));
            } catch (err) {
                setState(prev => ({...prev, isLoading: false}));
                console.error(`Failed to create grade ${grade.code}`, err);
                notify(`Failed to create grade: ${grade.code}`, {type: "error"});
            }
        });

        const {data: existingCategories} = await dataProvider.getList('standard_categories', {
            filter: {standard_id: standardId},
            pagination: {page: 1, perPage: 1000}
        });

        categoryFileData.forEach(category => {
            const key = category.category_id;
            if (!uniqueCategoryCodes.has(key)) {
                uniqueCategoryCodes.set(key, {
                    code: category.category_id,
                    name: category.category_name,
                    standard_id: standardId
                });
            }
        });

        const categories = Array.from(uniqueCategoryCodes.values());
        await processInBatches(categories, 10, async (category) => {
            try {
                if (!category.code) return;

                if (merge) {
                    const existingCategory = existingCategories.find(c => c.code === category.code);
                    if (existingCategory) {
                        await dataProvider.update('standard_categories', {id: existingCategory.id, data: category});
                        categoryCodeMap[category.code] = existingCategory.id;
                    } else {
                        const response = await dataProvider.create('standard_categories', {data: category});
                        categoryCodeMap[category.code] = response.data.id;
                    }
                } else {
                    const response = await dataProvider.create('standard_categories', {data: category});
                    categoryCodeMap[category.code] = response.data.id;
                }
                setState(prev => ({...prev, currentLoading: prev.currentLoading + 1}));
            } catch (err) {
                setState(prev => ({...prev, isLoading: false}));
                console.error(`Failed to create category ${category.code}`, err);
                notify(`Failed to create category: ${category.code}`, {type: "error"});
            }
        });

        const {data: existingSections} = await dataProvider.getList('standard_sections', {
            filter: {standard_id: standardId},
            pagination: {page: 1, perPage: 1000}
        });

        sectionFileData.forEach(section => {
            const key = section.id;
            if (!uniqueSectionCodes.has(key)) {
                uniqueSectionCodes.set(key, section);
            }
        });

        const uniqueSections = Array.from(uniqueSectionCodes.values());
        await processInBatches(uniqueSections, 10, async (data) => {
            try {
                const categoryId = categoryCodeMap[data.category_id];
                const gradeId = gradeCodeMap[data.grade_id];
                const sectionData = {
                    code: data.id,
                    content_type: data.content_type,
                    description: data.description || '',
                    item: data.item || '',
                    standard_id: standardId,
                    standard_grade_id: gradeId || null,
                    standard_category_id: categoryId || null,
                };
                if (merge) {
                    const existingSection = existingSections.find(item => item.code === data.id);
                    if (existingSection) {
                        await dataProvider.update('standard_sections', {id: existingSection.id, data: sectionData});
                    } else {
                        await dataProvider.create('standard_sections', {data: sectionData});
                    }
                } else {
                    if (data.id) {
                        await dataProvider.create('standard_sections', {data: sectionData});
                    }
                }

                setState(prev => ({...prev, currentLoading: prev.currentLoading + 1}));
            } catch (err) {
                setState(prev => ({...prev, isLoading: false}));
                console.error(`Failed to create section ${data.id}`, err);
                notify(`Failed to create section: ${data.id}`, {type: "error"});
            }
        });
        setState((prev: any) => ({...prev, currentLoading: 0, isLoading: false }));
        notify('CSV data imported successfully!', { type: 'success' });
    };

    const requiredColumns = {
        grades: ["grade_id", "grade_name"],
        categories: ["category_id", "category_name"],
        sections: ["id", "content_type", "description", "item", "category_id", "grade_id"]
    };

    const isImportDisabled = !standardName.trim() || gradeFileData.length === 0 || categoryFileData.length === 0 || sectionFileData.length === 0;

    return (
        <>
            <Typography variant="h6" sx={{ mb: 1 }}>Import File</Typography>
            <MUITextField label="Standard Name" variant="filled" required value={standardName}
                          onChange={(e) => setStandardName(e.target.value)} />
            <Typography sx={{ my: 1 }}>Grades *</Typography>
            <DragAndDropCsvFile setFileData={setGradeFileData} requiredColumns={requiredColumns.grades} />
            <Typography sx={{ my: 1 }}>Categories *</Typography>
            <DragAndDropCsvFile setFileData={setCategoryFileData} requiredColumns={requiredColumns.categories} />
            <Typography sx={{ my: 1 }}>Sections *</Typography>
            <DragAndDropCsvFile setFileData={setSectionFileData} requiredColumns={requiredColumns.sections} />
            <Box sx={{ mb: 5 }}>
                <Button onClick={importData} variant='contained' sx={{ mt: 2, float: 'right' }}
                        disabled={isImportDisabled} label={"Import Data"} />
            </Box>
        </>
    );
};