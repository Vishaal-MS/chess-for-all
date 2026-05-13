import {
    AutocompleteInput,
    Button,
    EditButton, FunctionField,
    ReferenceManyField,
    required,
    SearchInput,
    ShowButton,
    TextInput,
    TopToolbar,
    useGetRecordId, useNotify,
    useRecordContext,
    useRefresh, SelectInput, useSidebarState, Link,
    BooleanInput, FormDataConsumer, useGetList, List, Edit, Show, Create
} from 'react-admin';
import {
    Box,
    Typography,
    TextField as MUITextField,
    Divider,
    Grid,
    Switch,
    FormControlLabel,
} from '@mui/material';
import chessbackground from '../../images/chessbackground.jpeg';
import React, {useEffect, useState} from "react";
import {
    currentTenantId,
    getStandardId, isAllowPublishing,
    isRegularSchoolFlavored,
    isSchoolStandardLinked
} from "../../businessLogic";
import {
    closeDialog, createDefaults, DataTable,
    editDefaults, formDefaults, listDefaults,
    openDialog,
    PER_PAGE,
    remoteLog,
    SensibleDefaultPagination, showDefaults,
    SimpleFileInput, SimpleForm,
    SimpleImageField
} from "@mahaswami/vc-frontend";
import {AddLessons} from "../class/addLessons";
import {useUnique} from "../../helpers/useUnique.ts";
import {ListTitle, RecordTitle} from "../../components/Title.tsx";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import {useNavigate} from "react-router-dom";
import {CurriculumListView} from "./curriculumListView.tsx";
import {CurriculumShowView} from "./curriculumShowView.tsx";
import {getLanguagesMap} from "../../utils.ts";
import {ChessAIInput} from "../../fields/ai_lesson/ChessAIInput.tsx";
import {ChessAIField} from "../../fields/ai_lesson/ChessAIField.tsx";
import {DuplicateDialog} from "../../components/DuplicateDialog.tsx";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {Empty} from "../common/empty.tsx";
import {ClassLessonsSorter} from "../common/draggableLessons.tsx";
import {CurriculumsReferenceField} from "../curriculums.tsx";
import {StandardsReferenceInput} from "../standards.tsx";
import {BackgroundMusicsReferenceInput} from "../background_musics.tsx";

export const CurriculumList = (props: any) => {
    const [defaultFilter, setDefaultFilter] = useState({});
    const [subscribableList, setSubscribableList] = useState("loading");
    const [refreshState, setRefreshState] = useState(0);
    useEffect(() => {
        setDefaultFilter({tenant_id: currentTenantId()});
    },[]);

    const filters = [
        <SearchInput source="q" alwaysOn sx={{
            '& .MuiFilledInput-input': {
                height: '2em',
            }}}/>,
        <SelectInput source="language" alwaysOn choices={getLanguagesMap()} sx={{
            '& .MuiFilledInput-input': {
                minWidth: '160px',
            }}} />,
    ];

    useEffect(() => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const isPublish =  isAllowPublishing()
        async function fetchData() {
            const { data } = await dataProvider.getList("subscribables", {
                filter: {publisher_tenant_id: currentTenantId()},
                meta: {scopingEscapeHatch: true},
                pagination: {page: 1, perPage: 10000},
            });
            setSubscribableList(data);
        }
        if (isPublish) {
            fetchData();
        }
    }, [refreshState]);

    return(
        <List {...listDefaults(props)} title={<ListTitle resourceName="Curriculum List"/>} resource={"curriculum"} filter={defaultFilter} disableSyncWithLocation
              pagination={<SensibleDefaultPagination />}  sort={{field: "name", order: "ASC"}}
              perPage={PER_PAGE} exporter={false} empty={<Empty emptyText="No Curriculum found." showCreateIfApplicable={true}/>}>
            <DataTable bulkActionButtons={false}>
                <CurriculumListView currentView={"curriculum"} subscribables={subscribableList} setRefreshState={setRefreshState} />
            </DataTable>
        </List>
    );
};

const BackgroundMusicPreview = ({backgroundMusics, isLoading}) => {
    return (
        <FormDataConsumer>
            {({ formData }) => {
                const selectedMusicId = formData?.background_music_id;
                if (!selectedMusicId || isLoading) return null;
                const backgroundMusic = backgroundMusics.find((music: any) => music.id === selectedMusicId);
                const audioSrc = backgroundMusic?.music_attachment_file_id?.[0]?.src ?? "";
                return (
                    <Grid item md={3} xs={6}>
                        {audioSrc && (
                            <audio controls
                                   style={{height: "2rem", marginBottom: "1rem"}}
                                   src={audioSrc}
                            />
                        )}
                    </Grid>
                );
            }}
        </FormDataConsumer>
    );
}

export const CurriculumEdit = (props: any) => {
    const recordId= Number(useGetRecordId());
    const refresh= useRefresh();
    const navigate = useNavigate();

    const addLessonsAction = () => {
        openDialog(<AddLessons curriculumId={recordId} refreshFn={refresh} width="80vw"/>);
    }
    const unique = useUnique();
    const EditActions = () => (
        <TopToolbar>
            <Button
                startIcon={<KeyboardReturnIcon />}
                label={"Return to Curriculum Workspace"}
                onClick={() => navigate("/curriculum")}
            />
            <ShowButton />
        </TopToolbar>
    )

    const { data: backgroundMusics, isLoading } = useGetList(
        "background_music",
        {   pagination: {page: 1, perPage: 2000},
            meta: {scopingEscapeHatch: true}
        }
    );

    return (
        <Edit { ...editDefaults(props) } actions={<EditActions />} mutationMode="optimistic">
            <SimpleForm { ...formDefaults(props) }>
                <TextInput source="name" validate={[required(), unique()]}/>
                <SelectInput
                    source="language"
                    label="Language"
                    choices={getLanguagesMap()}
                    fullWidth
                />
                {isSchoolStandardLinked() &&
                    <StandardsReferenceInput source={'standard_id'} queryOptions={{meta: {scopingEscapeHatch: true}}} />
                }
                <ChessAIInput source="description" fullWidth/>
                <Grid container display="flex" gap="1rem" alignItems="center">
                    <FormDataConsumer>
                        {({formData, ...rest}) => (
                            <Grid item md={5} xs={6}>
                                <BackgroundMusicsReferenceInput source={"background_music_id"} perPage={1000}
                                                queryOptions={{meta: {scopingEscapeHatch: true}}}>
                                    <AutocompleteInput readOnly={!formData?.is_background_music_enabled} optionText={"name"}
                                           validate={formData?.is_background_music_enabled && required("Background Music is required")}/>
                                </BackgroundMusicsReferenceInput>
                            </Grid>
                        )}
                    </FormDataConsumer>
                    <Grid item md={3} xs={5}>
                        <BooleanInput source="is_background_music_enabled" label="Background Music?"/>
                    </Grid>
                    <BackgroundMusicPreview backgroundMusics={backgroundMusics} isLoading={isLoading}/>
                </Grid>
                <SimpleFileInput label="Curriculum Image (Size: 500×145 px)" inputProps={{capture: 'curriculum'}} accept="image/*"
                                 source="image_file_id" validate={validateImageDimensions}/>
                {recordId && (
                    <CurriculumImageField source={"image_file_id"}/>
                )}
                <Typography variant="h6" mt="1rem">Lessons</Typography>
                <ReferenceManyField pagination={<SensibleDefaultPagination />} perPage={100} sort={{ field: 'position_number', order: 'ASC' }}
                    reference={"curriculum_lessons"} target="curriculum_id" queryOptions={{ meta: { prefetch: ['lessons'] } }}>
                    <ClassLessonsSorter recordId={recordId} disableRedirect isSchoolClass />
                </ReferenceManyField>
                <Button onClick={addLessonsAction}  variant="contained" sx={{justifyContent: 'end', marginTop: 1 }}>Add</Button>
            </SimpleForm>
        </Edit>
    );
}

export const getLessonIdsByCurriculumId = (recordId: string | number) =>{
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [state, setState] = React.useState({
        loading: true,
        value: undefined,
    })

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const {data: curriculumLessons} = await dataProvider.getList("curriculum_lessons", {
                    pagination: {page: 1, perPage: 10000},
                    filter: {curriculum_id: recordId},
                    sort: {field: 'position_number', order: 'ASC'},
                    meta: {scopingEscapeHatch: true}
                });
                setState({ loading: false, value: curriculumLessons });
            } catch (error) {
                remoteLog("Error sending on getLessonIdsByCurriculumId fetchAll mrethod: ", error);
            }
        };
        fetchAll();
    }, [recordId]);
    return state.loading ? [] : state.value?.map(cl => cl.lesson_id);
}

const CurriculumUnlinkToggle = ({curriculumId}: { curriculumId: number | string }) => {
    const [state, setState] = useState({loading: true, isUnlisted: false, subscribables: undefined});
    const dataProvider = window.swanAppFunctions.dataProvider;
    const notify = useNotify();

    useEffect(() => {
        if (!curriculumId) return;

        const fetchData = async () => {
            try {
                const {data: subscribables} = await dataProvider.getList("subscribables", {
                    filter: {curriculum_id: curriculumId},
                    meta: {scopingEscapeHatch: true},
                });

                if (subscribables && subscribables?.[0]) {
                    setState({
                        loading: false,
                        isUnlisted: subscribables[0].is_unlisted ?? false,
                        subscribables: subscribables[0],
                    });
                } else {
                    setState((prev) => ({...prev, loading: false}));
                }
            } catch (error) {
                remoteLog("Error fetching subscribables: ", error);
                setState((prev) => ({...prev, loading: false}));
            }
        };

        fetchData();
    }, []);

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setState((prev) => ({...prev, isUnlisted: newValue}));

        if (!state.subscribables) return;

        try {
            await dataProvider.update("subscribables", {
                id: state.subscribables?.id,
                data: {is_unlisted: newValue},
            });
            notify(`Curriculum ${newValue ? "UnListed" : "Listed"} Successfully`, {type: "success"});
        } catch (error) {
            remoteLog("Error updating subscribable: ", error);
            setState((prev) => ({...prev, isUnlisted: !prev.isUnlisted}));
        }
    };

    const {loading, subscribables, isUnlisted} = state;

    if (loading || !subscribables || (subscribables && subscribables?.is_active === false)) return null;

    return (
        <FormControlLabel
            sx={{
                mb: "0.1rem", mx: "0.2rem",
                "& .MuiFormControlLabel-label": {
                    color: "gray",
                    fontSize: "0.75rem",
                }
            }}
            label="Unlisted?"
            control={<Switch size="small" checked={isUnlisted} onChange={handleToggle} color="primary"/>}
        />
    );
}

export const CurriculumShow = (props: any) => {
    const navigate = useNavigate();
    const isPublisher = isAllowPublishing();

    const ShowActions = () => (
        <TopToolbar>
            {isPublisher &&
                <FunctionField render={(curriculumRecord) => {
                    return (
                        <CurriculumUnlinkToggle curriculumId={curriculumRecord?.id}/>
                    )
                }}/>
            }
            <Button
                startIcon={<KeyboardReturnIcon />}
                label={"Return to Curriculum Workspace"}
                onClick={() => navigate("/curriculum")}
            />
            <FunctionField render={(curriculumRecord) => {
                return (
                    <Button label={"Duplicate"} startIcon={<ContentCopyIcon/>}
                            onClick={() =>{ openDialog(<DuplicateDialog width={'32rem'} record={curriculumRecord} resource={"curriculum"}/>)}}
                    />
                )
            }}/>
            <EditButton />
        </TopToolbar>
    )

    return (
        <Show {...showDefaults(props)} actions={<ShowActions />} title={<RecordTitle resourceName="Curriculum Show"/>}>
            <CurriculumShowView currentView={"curriculum"}/>
        </Show>
    )};

const AddButton = ({onSelect}) => {
    const record = useRecordContext();

    const callSelection = (event) => {
        event.stopPropagation();
        onSelect(record);
    }
    return <Button  variant="contained" label="Add" onClick={callSelection}></Button>
}

export const CurriculumCreate = (props) => {
    const unique = useUnique();

    return(
        <Create { ...createDefaults(props)} title={<ListTitle resourceName="New Curriculum"/>}>
            <SimpleForm defaultValues={isRegularSchoolFlavored() ? {standard_id: getStandardId()} : {}}>
                <TextInput source="name" validate={[required(), unique()]}/>
                <SelectInput source="language" choices={getLanguagesMap()} fullWidth/>
                {isSchoolStandardLinked() && <StandardsReferenceInput source='standard_id' /> }
                <ChessAIInput source="description" fullWidth/>
            </SimpleForm>
        </Create>
    );
}


export const inActivateSubscribablesByCurriculum = async (curriculumId, notify,refresh, subscribableList, setRefreshState) => {
    const dataProvider = window.swanAppFunctions.dataProvider ;
    const filteredSubscribables = subscribableList?.filter((subscribable) => subscribable.curriculum_id === curriculumId);
    if (!filteredSubscribables || filteredSubscribables.length === 0) {
        return;
    }
    await dataProvider.update("subscribables", {
        id: filteredSubscribables[0].id,
        data: {is_active: false}
    });
    setRefreshState(prev => prev + 1);
    notify("Curriculum UnPublished Successfully", {type: "success"});
    refresh();
}

export const RoyaltyAmountDialog = ({record, subscribableRecord, setRefreshState}) => {
    const [oneTimeAmount, setOneTimeAmount] = useState('');
    const [monthlyAmount, setMonthlyAmount] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const refresh = useRefresh();
    const notify = useNotify();
    const dataProvider = window.swanAppFunctions.dataProvider
    const createSubscribableByCurriculum = async (record, one_time_amount, monthly_amount, subscribableRecord) => {
        if (!oneTimeAmount || !monthlyAmount) {
            setError(true);
            return;
        }
        setIsLoading(true);
        if (subscribableRecord?.id) {
            await dataProvider.update("subscribables", {
                id: subscribableRecord.id,
                data: {is_active: true, one_time_amount: one_time_amount, monthly_amount: monthly_amount}
            });
        } else {
            await dataProvider.create("subscribables", {
                data: {
                    name: record.name,
                    published_date: new Date(),
                    curriculum_id: record.id,
                    publisher_tenant_id: currentTenantId(),
                    one_time_amount: one_time_amount,
                    monthly_amount: monthly_amount,
                    is_active: true,
                    is_unlisted: false
                }
            });
        }
        setRefreshState(prev => prev + 1);
        notify("Curriculum Published Successfully", {type: "success"});
        closeDialog();
        setIsLoading(false);
        refresh();
    }

    return (
        <Box>
            <Typography variant="h6">Royalty Amount</Typography>
            <MUITextField
                id="one-time-amount"
                label="One-Time"
                variant="filled"
                type="number"
                onChange={(e) => setOneTimeAmount(e.target.value)}
                error={error && !oneTimeAmount}
                helperText={error && !oneTimeAmount ? "One-Time amount is required" : " "}
                sx={{ mb: '1rem' }}
            />
            <MUITextField
                id="monthly-amount"
                label="Monthly"
                variant="filled"
                type="number"
                onChange={(e) => setMonthlyAmount(e.target.value)}
                error={error && !monthlyAmount}
                helperText={error && !monthlyAmount ? "Monthly amount is required" : " "}
            />

            <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, marginTop: 2}}>
                <Button variant="contained" loading={isLoading}
                        onClick={() => createSubscribableByCurriculum(record, oneTimeAmount, monthlyAmount, subscribableRecord)}
                        label={"Save"}></Button>
                <Button variant="outlined" onClick={() => closeDialog()} label={"Cancel"}></Button>
            </Box>
        </Box>
    );
}

export const validateImageDimensions = async (value: any) => {
    if (!value || !value.rawFile) return undefined;
    const file = value.rawFile;

    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            if (img.width === 500 && img.height === 145) {
                resolve(undefined);
            } else {
                resolve('Image must be exactly 500 × 145 pixels.');
            }
        };
    });
};

export const CurriculumImageField = ({source, width, height,}: {
    source: string;
    width?: string | number;
    height?: string | number;
}) => {
    const record = useRecordContext();
    if (!record) return null;
    if (record[source]) {
        return (
            <SimpleImageField
                source="image_file_id"
                src="src"
                sx={{
                    '& .RaImageField-image': {
                        width,
                        height,
                        objectFit: 'cover',
                    },
                }}
                label={""}
            />
        );
    } else if (record?.curriculum?.image_file_id && source === "curriculum.image_file_id") {
        return (
            <CurriculumsReferenceField source="curriculum_id" link={false}>
                <SimpleImageField
                    source="image_file_id"
                    src="src"
                    sx={{
                        '& .RaImageField-image': {
                            width,
                            height,
                            objectFit: 'cover',
                        },
                    }}
                    label={""}
                />
            </CurriculumsReferenceField>
        );

    } else {
        return (
            <img
                src={chessbackground}
                style={{
                    width,
                    height,
                    margin: '0.25rem',
                }}
            />
        );
    }
};

export const ExpandedDescriptionDialog = (record, currentView) => {
    const curriculumRecord = currentView === 'subscriptions' || currentView === 'curriculum' ? record : record.curriculum;
    return (
        <Box>
            <Box display="flex" alignItems="center" gap={1}>
                {curriculumRecord?.name}
            </Box>
            <Box>
                <Divider sx={{my: 1}}/>
                <ChessAIField source="description" record={curriculumRecord}/>
            </Box>
        </Box>
    );
};

export const RichTextWithInlineReadMore = ({
                                               description,
                                               currentView,
                                               maxLength = 250,
                                               isReadMoreLight = false,
                                           }: {
    description: string;
    currentView: string;
    maxLength?: number;
    isReadMoreLight?: boolean;
}) => {

    const record = useRecordContext();
    const hasSectionBreak = description?.includes('<section-break>')
    const [open] = useSidebarState();
    const useReadMoreColor = (theme) => isReadMoreLight ? theme.palette.common.white : theme.palette.primary.main
    description = description?.split("<section-break>").map(section => section.trim())[0];

    const convertMethod = (htmlString) => {
        if (!htmlString) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const plainText = convertMethod(description);
    const isLong = plainText.length > maxLength || hasSectionBreak;
    const shortText = plainText.slice(0, maxLength).trim() + (isLong ? '...' : '');

    const handleClick = (e) => {
        e.stopPropagation();
        openDialog(ExpandedDescriptionDialog(record, currentView));
    };

    return (
        <Typography
            sx={{
                fontSize: open
                    ? 'clamp(0.6rem, 0.7vw + 0.3rem, 0.8rem)'
                    : 'clamp(0.6rem, 0.7vw + 0.3rem, 0.9rem)',
                lineHeight: '1.2em',
                ml: '0.5em',
                mt: '0.40rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                transition: 'all 0.3s ease',
            }}
        >
            {shortText}
            {isLong && (
                <Link
                    component="button"
                    onClick={handleClick}
                    sx={{
                        textDecorationColor: useReadMoreColor,
                        color: useReadMoreColor,
                        fontSize: '0.7rem',
                        ml: '0.30rem',
                        '&:focus': {
                            outline: 'none',
                        }
                    }}
                >
                    Read more
                </Link>
            )}
        </Typography>
    );
};
