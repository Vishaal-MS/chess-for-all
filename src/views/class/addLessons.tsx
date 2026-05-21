import {BulkAddLessonsButton} from "../curriculum/bulkAddLessons";
import React, {useEffect, useState} from "react";
import { List, ReferenceArrayField, SingleFieldList, Loading, ReferenceField, useListContext} from "react-admin";
import { getLanguageDescription } from "../../utils";
import {remoteLog, SensibleDefaultPagination, PER_PAGE, DataTable} from "@mahaswami/vc-frontend";
import { getExistLessonIds, getOwnAndSubscribedLessonIds, getSubscribedCurriculumIds } from "../../backend/classes";
import { LessonFilterForm } from "./AddLessonFilterForm";
import { getOwnAndSubscribedCurriculumIds } from "../../backend/curriculum";
import { Box } from '@mui/material';

export const AddLessons = ({classRecord, curriculumId, refreshFn, showLessonList, postAssign }) => {

    const dataProvider = window.swanAppFunctions.dataProvider;
    const [isLoading, setIsLoading] = React.useState(true);
    const [mergedCurriculumIds, setMergedCurriculumIds] = React.useState([]);
    const [addedLessonIds, setAddedLessonIds] = React.useState([]);
    const [mergedLessonIds, setMergedLessonIds] = React.useState([]);
    const isSchoolClass = classRecord?.is_school_class;
    const classId = classRecord?.id || null;
    const [filter, setFilter] = React.useState({});
    const [curriculumCount, setCurriculumCount] = useState(0);
    const [classProgressCount, setClassProgressCount] = useState(0);
    const [state, setState] = useState({standard_id: null});
    const [selectedCurriculumId, setSelectedCurriculumId] = useState(null);
    const isCurriculumAddLessons = !!curriculumId;

    useEffect(() => {
        const fetchStandardId = async () => {
            try {
                if (isSchoolClass && classRecord?.client_id) {
                    const {data: client} = await dataProvider.getOne('clients', {id: classRecord?.client_id});
                    setState(prevState => ({...prevState, standard_id: client?.standard_id}));
                } else if (curriculumId) {
                    const {data: curriculum} = await dataProvider.getOne('curriculum', {id: curriculumId});
                    setState({standard_id: curriculum?.standard_id,});
                }
            } catch (error) {
                remoteLog('Failed to fetch client or curriculum info', error);
                console.error('Failed to fetch client or curriculum info', error);
            }
        }
        fetchStandardId();
    }, [classRecord?.client_id, curriculumId, selectedCurriculumId]);

    useEffect(() => {
        const fetchCurriculums = async () => {
            try {
                const subscribedCurriculumIds = await getSubscribedCurriculumIds(dataProvider); //Subscribed Curriculum Ids
                const curriculumIds = await getOwnAndSubscribedCurriculumIds(dataProvider, subscribedCurriculumIds, classId);// Own And Subscribed Ids
                const existLessons = await getExistLessonIds(dataProvider, classId, curriculumId); // Exist Lesson Ids
                if (classId) {
                    setClassProgressCount(existLessons.count);
                }
                const existLessonIds = existLessons?.ids;
                let nonExistLessonIds: any = [];
                if (isCurriculumAddLessons) {
                    setCurriculumCount(existLessons.count);
                    const lessonIds = await getOwnAndSubscribedLessonIds(dataProvider, subscribedCurriculumIds, isSchoolClass); // Own And Subscribed Lesson Ids
                    nonExistLessonIds = lessonIds?.filter(lessonId => !existLessonIds.includes(lessonId));
                }
                setAddedLessonIds(existLessonIds);
                setMergedLessonIds(nonExistLessonIds);
                setMergedCurriculumIds(curriculumIds);
                setFilter((prev) => ({...prev, id: nonExistLessonIds}));
            } catch (error) {
                console.error("Error on fetchCurriculums: ", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCurriculums();
    }, []);

    const CustomSortedDatagrid = () => {
        const idOrder = filter?.id;
        const { data, isLoading} = useListContext();
        if (!idOrder || !data || isLoading) {
            return null;
        }
        const sortedData = [...data].filter(item => idOrder.includes(item.id)).sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));
        return (
            <DataTable
                data={sortedData}
                pagination={!showLessonList}
                bulkActionButtons={
                    <BulkAddLessonsButton
                        isSchoolClass={isSchoolClass}
                        selectedCurriculumId={selectedCurriculumId}
                        dataProvider={dataProvider}
                        classId={classId}
                        curriculumId={curriculumId}
                        refreshFn={refreshFn}
                        postAssign={postAssign}
                        curriculumCount={curriculumCount}
                        classProgressCount={classProgressCount}
                    />
                }
                rowClick={false}
            >
                <DataTable.Col source="name" label="Lessons" />
                <DataTable.Col label="Tags" source='tag_ids' field={() =>
                    <ReferenceArrayField source="tag_ids" reference="tags" perPage={1000}>
                        <SingleFieldList linkType={false} />
                    </ReferenceArrayField>
                } />
                <DataTable.Col label="Publisher" field={() => <ReferenceField source="tenant_id" link={false} reference='tenants'/>} />
                <DataTable.Col label="Language" render={(lesson) => getLanguageDescription(lesson.language)} />
            </DataTable>
        );
    };

    return (
        <Box sx={{height: showLessonList ? 'calc(100vh - 15rem)' : '80vh'}}>
            {isLoading ? <Loading/> :
                <List filterDefaultValues={{language: 'EN'}} filter={filter} resource="lessons" disableSyncWithLocation
                      storeKey={false} empty={false} sx={{'& .MuiButton-textPrimary': {display: 'none'}}}
                      queryOptions={{meta: {scopingEscapeHatch: true, scopingEscapeDivision: true}, gcTime: 0}}
                      pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE}
                      actions={
                          <LessonFilterForm state={state}
                                            isCurriculumAddLessons={isCurriculumAddLessons}
                                            setSelectedCurriculumId={setSelectedCurriculumId}
                                            isSchoolClass={isSchoolClass}
                                            setListFilter={setFilter}
                                            isDialog={!showLessonList}
                                            existLessonIds={addedLessonIds}
                                            mergedLessons={mergedLessonIds}
                                            curriculumIds={mergedCurriculumIds}
                          />
                      }>
                    <CustomSortedDatagrid/>
                </List>}
        </Box>
    )
}