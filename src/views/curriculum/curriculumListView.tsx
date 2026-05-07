import {
    FunctionField,
    useNotify,
    useRecordContext, useRefresh,
} from "react-admin";
import {
    Box,
    Tooltip,
    Typography,
    Grid,
    Rating,
} from "@mui/material";
import {
    CurriculumImageField,
    inActivateSubscribablesByCurriculum, RichTextWithInlineReadMore,
    RoyaltyAmountDialog
} from "./curriculum.tsx";
import {isAllowPublishing} from "../../businessLogic.ts";
import { openDialog} from "@mahaswami/vc-frontend";
import React, {useEffect, useState} from "react";
import UnpublishedIcon from "@mui/icons-material/UnpublishedSharp";
import PublishedIcon from "@mui/icons-material/PublishedWithChangesSharp";
import {formatCurrency, formatDateWithShortYear} from "../../utils.ts";
import {PublisherProfileDialog} from "../profiles/publisherProfileDialog.tsx";
import {TenantConfigNames} from "../../helpers/constants.ts";
import {StarRating} from "../../components/NumberedStar.tsx";

const boxHeaderSx = () => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderRadius: "1rem",
    background: (theme) =>
        `linear-gradient(45deg, 
                ${theme?.palette?.secondary?.dark || '#6a1b9a'} 0%, 
                ${theme?.palette?.secondary?.light || '#ba68c8'} 50%, 
                ${theme?.palette?.primary?.dark || '#1565c0'} 100%)`,
    color: (theme) => theme?.palette?.primary?.contrastText || '#fff',
    px: '1rem',
    py: '0.5rem',
    minHeight: 40,
    width: "100%",
    gap: '0.5rem',
});

const boxContainerStyles = {
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    p: "0.15rem",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    width: "100%",
    gap: 1,
};

const boxGridStyles = {
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    flex: 1,
    gap: "0.5rem",
    minHeight: "5rem",
};

type CurriculumListViewProps = {
    currentView: string,
    settings?: [],
    subscribables?: [],
    subscriptions?: [],
    setRefreshState?: number
};
export const CurriculumListView = ({currentView, settings, subscribables, subscriptions, setRefreshState}: CurriculumListViewProps) => {
    const record = useRecordContext();
    if (!record) return null;
    const refresh = useRefresh();
    const notify = useNotify();
    const name = currentView === "subscribables" ? record.curriculum?.name : record.name;
    let description = currentView === "subscribables" ? record.curriculum?.description : record.description;
    const isPublish =  isAllowPublishing() && currentView === "curriculum";
    const imageSrc = currentView === "subscribables" ? "curriculum.image_file_id" : "image_file_id";
    const maxDescriptionLength = currentView === "curriculum" ? 470 : 300;

    return (
        <Box sx={boxContainerStyles}>
            <Box>
                <CurriculumImageField source={imageSrc} width='31.25rem' height='9.063rem'/>
            </Box>

            <Box sx={boxGridStyles}>
                <Box sx={boxHeaderSx}>
                    <Grid container>
                        <Grid item md={11.5}>
                            {name}
                        </Grid>
                        <Grid item md={0.5}>
                            { isPublish &&
                                <FunctionField onClick={(e) => e.stopPropagation()}
                                               render={(record) => (
                                                   <PublishToggleAction
                                                         record={record}
                                                         refresh={refresh}
                                                         notify={notify}
                                                         subscribableList={subscribables}
                                                         setRefreshState={setRefreshState}
                                                   />
                                               )}/>
                            }
                        </Grid>
                    </Grid>
                </Box>

                <Grid item xs={12} sx={{pl: '0.5rem', pr: '0.5rem'}}>
                    <RichTextWithInlineReadMore description={description} currentView={currentView} maxLength={maxDescriptionLength}/>
                </Grid>

                {currentView === "subscriptions" && <SubscriptionsInfoField settings={settings} subscribables={subscribables} subscriptions={subscriptions}/>}
                {currentView === "subscribables" && <SubscribablesInfoField settings={settings}/>}
            </Box>
        </Box>
    );
};

const PublishToggleAction = ({ record, refresh, notify, subscribableList, setRefreshState}) => {
    if (subscribableList === 'loading') {
        return <></>;
    }
    const subscribableRecord = subscribableList?.find((subscribable) => subscribable.curriculum_id === record?.id);
    const isPublished = subscribableRecord?.is_active;

    return isPublished ? (
        <Tooltip title="UnPublish">
            <UnpublishedIcon sx={{display: 'flex !important'}} fontSize="small"
                             onClick={() => inActivateSubscribablesByCurriculum(record?.id, notify, refresh, subscribableList, setRefreshState)}>
            </UnpublishedIcon>
        </Tooltip>) : (
        <Tooltip title="Publish">
            <PublishedIcon sx={{display: 'flex !important'}} fontSize="small"
                           onClick={() =>
                               openDialog(<RoyaltyAmountDialog width={"30vw"}
                                                               record={record}
                                                               setRefreshState={setRefreshState}
                                                               subscribableRecord={subscribableRecord}/>)
                           }>
            </PublishedIcon>
        </Tooltip>);
}

const SubscriptionsInfoField = ({settings, subscribables, subscriptions}) => {
    const fontSize = '0.70rem';
    const getSubscriptionDate = (curriculumId) => {
        const subscription = subscriptions.find(sub => sub.subscribable.curriculum_id === curriculumId);
        return subscription ? formatDateWithShortYear(subscription.start_date) : '';
    };

    const getSubscibable = (curriculumId) => {
        const subscribable = subscribables.find(sub => sub.curriculum_id === curriculumId);
        return (
            <PublisherWithRatingField record={subscribable} fontSize={fontSize} settings={settings} subscription/>
        )
    }

    return (
        <Grid container spacing={1} px="1rem" alignItems="center">
            <Grid item xs={12}>
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: fontSize,
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <FunctionField sx={{fontSize: fontSize}} render={record => getSubscriptionDate(record.id)}/>
                    <span>|</span>
                    <FunctionField sx={{fontSize: fontSize}} render={record => getSubscibable(record.id)}/>
                </Typography>
            </Grid>
        </Grid>
    );

}

const SubscribablesInfoField = ({settings}) => {
    const fontSize = '0.70rem';
    return (
        <Grid container spacing={1} px="1.5rem" alignItems="center">
            <Grid item xs={12}>
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: fontSize,
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <FunctionField sx={{fontSize: fontSize}}
                                   render={record => formatDateWithShortYear(record.published_date)}
                    />
                    <span>|</span>

                    <FunctionField
                        sx={{fontSize}}
                        render={record => (
                            <span>
                                         {formatCurrency(record.one_time_amount)} <small>One-Time</small>
                                {" / "}
                                {formatCurrency(record.monthly_amount)} <small>Monthly</small>
                                        </span>
                        )}
                    />
                    <span>|</span>

                    <FunctionField
                        render={(record) => (
                            <PublisherWithRatingField record={record} fontSize={fontSize} settings={settings}/>
                        )}
                    />
                    <span>|</span>

                    <Box display="inline-flex" alignItems="center">
                        <FunctionField
                            render={record => <Rating value={Number(record?.rating) > 0 ? record.rating : null}
                                                      precision={0.5} readOnly size="small"/>}/>
                    </Box>
                </Typography>
            </Grid>
        </Grid>
    )
};

export const PublisherWithRatingField = ({ record, fontSize, settings, subscription }) => {

    if (!record) return null;
    const setting = settings.find(s => s.tenant_id === record.publisher_tenant_id && s.config_name === TenantConfigNames.PUBLISHER_RATING);
    const rating = parseFloat(setting?.config_value || "0")
    const publisherName = record?.publisher_tenant?.name;
    const profile = settings.find(s => s.tenant_id === record.publisher_tenant_id && s.config_name === TenantConfigNames.PUBLISHER_PROFILE);
    record = {...record, profile: profile || {}, rating: rating, isSubscribed: subscription};

    return (
        <Box
            display="inline-flex"
            alignItems="center"
            sx={{ cursor: "pointer", color: "primary.main", fontSize }}
            onClick={(e) => {
                e.stopPropagation();
                openDialog(<PublisherProfileDialog record={record} width={"82vw"}/>);
            }}
        >
            <Typography sx={{ fontSize, mr: 0.5 }}>{publisherName}</Typography>
                {rating !== null && (
                    <StarRating rating={rating} />
            )}
        </Box>
    );
};
