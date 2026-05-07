import {Box, Button, Card, Grid, Rating, Typography} from "@mui/material";
import {
    Datagrid,
    DateField,
    FunctionField, Loading,
    ReferenceField,
    ReferenceManyField, ReferenceOneField,
    TabbedShowLayout,
    TextField, WrapperField,
} from "react-admin";
import {dataProvider, openDialog, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {CustomLinkFieldWithState} from "../../components/CustomLinkFieldWithState.tsx";
import {
    CurriculumImageField,
    RichTextWithInlineReadMore
} from "./curriculum.tsx";
import {useRecordContext} from "ra-core";
import {formatCurrency, formatDateWithShortYear} from "../../utils.ts";
// import {ReviewDetail} from "../reviews/Reviews.tsx";
// import {PublisherProfileDialog} from "../profiles/publisherProfileDialog.tsx";
import React, {useEffect, useState} from "react";
import {TenantConfigNames} from "../../helpers/constants.ts";
import {StarRating} from "../../components/NumberedStar.tsx";
import { useLocation } from "react-router-dom";
import {currentTenantId, getUserId} from "../../businessLogic.ts";
import {Empty} from "../common/empty.tsx";
import {ReviewDetail} from "../reviews/Reviews.tsx";

const cardStyles = (theme) => ({
    background: `linear-gradient(45deg, 
        ${theme.palette.secondary.dark} 0%, 
        ${theme.palette.secondary.light} 50%, 
        ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    padding: '0.625rem',
    marginTop: '1rem',
    marginBottom: '1em',
    display: 'flex',
    flexDirection: 'column',
});

type CurriculumShowViewProps = {
    currentView?: string;
};
export const CurriculumShowView = ({currentView}: CurriculumShowViewProps) => {

    const record = useRecordContext();
    const [loading, setLoading] = useState(true);
    const [settingsData, setSettingsData] = useState([]);

    useEffect(() => {
        const getPublisherRatings = async () => {
            const {data: tenantSettings} = await dataProvider.getList('settings', {
                filter: {tenant_id: record?.publisher_tenant_id},
                pagination: false
            });
            setSettingsData(tenantSettings);
            setLoading(false)
        }
        getPublisherRatings();
    }, [record]);

    const name = currentView === 'subscribables' ? record?.curriculum?.name : record?.name;
    let description = currentView === 'subscribables' ? record?.curriculum?.description ?? '' : record?.description ?? '';
    const curriculumView = currentView === 'curriculum'
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const isFromSubscribedCurriculum = params.get("from") === "subscribedCurriculums";
    const imageSrc = currentView === "subscribables" ? "curriculum.image_file_id" : "image_file_id";
    const ratingData = settingsData?.find(s => s?.config_name === TenantConfigNames.PUBLISHER_RATING);
    const rating = ratingData ?  parseFloat(ratingData?.config_value || 0) : 0;
    const profile = settingsData?.find(s => s?.config_name === TenantConfigNames.PUBLISHER_PROFILE);
    const lessonIds: any[] = [];
    const recordData = {
        ...record,
        isFromSubscribedCurriculum: isFromSubscribedCurriculum,
        rating: rating,
        profile: profile,
        loading: loading,
        ids: lessonIds,
        curriculumView: curriculumView,
    };

    return (
        <Grid container spacing={1} sx={{px: '0.75rem', py: '0.063rem'}}>
            <Grid item xs={12}>
                <Card sx={cardStyles}>
                    <Box display="flex" flex={1}>
                        <Box flex="1" display="flex" flexDirection="column">
                            <Box display="flex" sx={{fontSize: '1.1rem', fontWeight: 'medium'}} justifyContent="center">
                                {name}
                            </Box>
                            <Box sx={{ fontSize: '0.95rem'}}>
                                <RichTextWithInlineReadMore description={description} currentView={currentView} maxLength={500} isReadMoreLight/>
                            </Box>
                        </Box>

                        <Box>
                            <CurriculumImageField source={imageSrc} width='31.25rem' height='9.063rem'/>
                        </Box>
                    </Box>
                    {!curriculumView && <SubscribablesInfoField recordData={recordData}/>}
                </Card>
            </Grid>
             <SubscribablesTabs recordData={recordData}/>
        </Grid>
    )
}

const SubscribablesTabs = ({recordData}) => {
    const {curriculumView, isFromSubscribedCurriculum, ids, loading, ...record} = recordData;
    return (
        curriculumView ? (
            <Grid item xs={12}>
                <ReferenceManyField pagination={<SensibleDefaultPagination/>} perPage={100}
                                    reference={"curriculum_lessons"} target={"curriculum_id"} link={false}
                                    sort={{field: 'position_number', order: 'ASC'}}
                                    queryOptions={{meta: {prefetch: ['lessons']}}}>
                    <Datagrid bulkActionButtons={false} rowClick={false}>
                        <WrapperField label={'Lessons'}>
                            <CustomLinkFieldWithState state={{curriculumId: record?.id, ids: ids}}/>
                        </WrapperField>
                    </Datagrid>
                </ReferenceManyField>
            </Grid>
        ) : (
            <Grid item xs={12}>
                <TabbedShowLayout>
                    <TabbedShowLayout.Tab label={"Lessons"}>
                        <ReferenceField source="curriculum_id" reference="curriculum" link={false} label={""}>
                            <ReferenceManyField reference="curriculum_lessons" target="curriculum_id"
                                                label="Lessons" pagination={<SensibleDefaultPagination/>}
                                                perPage={100} sort={{field: 'position_number', order: 'ASC'}}
                                                queryOptions={{meta: {prefetch: ['lessons']}}}>
                                <Datagrid bulkActionButtons={false} rowClick={false}>
                                    <WrapperField label={'Lessons'}>
                                        <CustomLinkFieldWithState state={{subscribableId: record?.id, isFromSubscribedCurriculum, ids: ids}}/>
                                    </WrapperField>
                                </Datagrid>
                            </ReferenceManyField>
                        </ReferenceField>
                    </TabbedShowLayout.Tab>
                    <TabbedShowLayout.Tab label={"Reviews"}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={2}>
                                <Loading/>
                            </Box>
                        ) : (
                            <ReferenceManyField reference={"reviews"} target="subscribable_id" filter={{type: 'review'}}
                                                pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE}>
                                <Datagrid bulkActionButtons={false} expand={<ReviewDetail/>}
                                          empty={<Empty emptyText={"No Reviews Yet"} showIcon={false}/>}>
                                    <TextField source="title" label={"Review"}/>
                                    <FunctionField label="Rating"
                                                   render={record => <Rating value={record.rating} readOnly/>}/>
                                    <ReferenceField reference={"users"} source={"user_id"}>
                                        <TextField source="fullName"/>
                                    </ReferenceField>
                                    <DateField source="review_date" label={"Date"}/>
                                </Datagrid>
                            </ReferenceManyField>
                        )}
                    </TabbedShowLayout.Tab>
                    <TabbedShowLayout.Tab label={"Messages"}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={2}>
                                <Loading/>
                            </Box>
                        ) : (
                            <ReferenceManyField reference={"reviews"} target="subscribable_id"
                                                filter={{type: 'message', user_id: getUserId()}}>
                                <Datagrid bulkActionButtons={false} expand={<ReviewDetail/>}
                                          empty={<Empty emptyText={"No Messages Yet"} showIcon={false}/>}
                                          sx={{fontSize: '0.5rem'}}>
                                    <TextField source="title" label="Message"/>
                                    <DateField source="review_date" label={"Date"}/>
                                </Datagrid>
                            </ReferenceManyField>
                        )}
                    </TabbedShowLayout.Tab>
                </TabbedShowLayout>
            </Grid>
        )
    )
}

const SubscribablesInfoField = ({recordData}) => {
    const { isFromSubscribedCurriculum, rating, ...record } = recordData;
    return (
        <Box
            display="flex"
            fontSize='0.75rem'
            flexWrap="wrap"
            columnGap='2rem'
            rowGap='0.5rem'
            justifyContent='space-between'
        >
            <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="bold" marginRight='0.25rem'>
                    Published Date:
                </Typography>
                <FunctionField
                    label="Published Date"
                    render={record => formatDateWithShortYear(record.published_date)}
                />
            </Box>

            <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="bold" marginRight='0.25rem'>
                    Royalty Amount:
                </Typography>
                {isFromSubscribedCurriculum ? (
                        <ReferenceOneField
                            reference="subscribers"
                            target="subscribable_id"
                            filter={{subscriber_tenant_id: currentTenantId()}}
                        >
                            <FunctionField
                                render={(subscriberRecord) => {
                                    if (!subscriberRecord || !record) return null;

                                    const selectedType = subscriberRecord.subscription_type;
                                    let amount;
                                    if (selectedType === 'monthly') {
                                        amount = formatCurrency(record.monthly_amount) + " Monthly";
                                    } else {
                                        amount = formatCurrency(record.one_time_amount) + " One-Time";
                                    }
                                    return (
                                        <span>{amount}</span>
                                    );
                                }}
                            />
                        </ReferenceOneField>
                    ) :
                    (
                        <FunctionField
                            render={(record) => formatCurrency(record.one_time_amount) + " One-Time" + " / "
                                + formatCurrency(record.monthly_amount) + " Monthly"}/>
                    )}
            </Box>

            <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="bold" marginRight='0.25rem'>
                    Publisher:
                </Typography>
                <Box display="flex">
                    <Button size='small'
                            sx={{
                                fontSize: '0.8rem', color: (theme) => theme.palette.primary.contrastText,
                                textDecoration: 'underline', textTransform: 'none'
                            }}
                            onClick={() => openDialog(<PublisherProfileDialog record={recordData} width={"82vw"}/>)}>
                        {record?.publisher_tenant?.name}
                    </Button>
                    <StarRating rating={Number(rating)}></StarRating>
                </Box>
            </Box>

            <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="bold" marginRight='0.25rem'>
                    Rating:
                </Typography>
                <FunctionField render={record => <Rating value={Number(record?.rating) > 0 ? record.rating : null}
                                                         precision={0.5} readOnly size="small"/>}/>
            </Box>
        </Box>
    )
}