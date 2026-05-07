import { Datagrid, Loading, useCreate, useGetOne, FunctionField, useRefresh, List } from 'react-admin';
import {useEffect,  useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {Button, useGetRecordId, useRecordContext} from "react-admin";
import {Box, Typography, Menu, MenuItem, Fade, Backdrop, CircularProgress} from "@mui/material";
import {Create,SimpleForm,TextInput,useRedirect,useNotify} from "react-admin"
import {closeDialog, getLocalStorage, openDialog, remoteLog, showDefaults} from "@mahaswami/vc-frontend";
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import {currentTenantId, getUserId, isSuperAdmin} from "../../businessLogic";
import nlp from 'compromise';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {DuplicateDialog} from "../../components/DuplicateDialog.tsx";
import PaymentIcon from "@mui/icons-material/Payment";
import RepeatIcon from "@mui/icons-material/Repeat";
import {  Show, TopToolbar } from 'react-admin';
import {RatingInput} from "../../fields/RatingInput";
import {PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {ListTitle} from "../../components/Title.tsx";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import {CurriculumListView} from "../curriculum/curriculumListView.tsx";
import {CurriculumShowView} from "../curriculum/curriculumShowView.tsx";
import {formatCurrency } from "../../utils.ts";
import FuzzySearchBox from "../common/FuzzySearchBox.tsx";

export const SubscribableList = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [settingsData, setSettingsData] = useState([]);
    const [subscribables, setSubscribables] = useState<any[]>([]);
    const [subscribedCurriculumIds, setSubscribedCurriculumIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date();
                const {data: settings} = await dataProvider.getList("settings", {
                    meta: { scopingEscapeHatch: true },
                    pagination: { page: 1, perPage: 10000 }
                });
                const {data: subscriptions} = await dataProvider.getList("subscriptions", {
                    filter: {subscriber_tenant_id: currentTenantId()},
                    pagination: {page: 1, perPage: 10000},
                });

                const subscribedCurriculumIds = subscriptions.filter(subscription => (new Date(subscription.start_date) <= today) &&
                    (new Date(subscription.end_date) >= today)).map(subscription => subscription.subscribable_id);
                const {data: subscribables} = await dataProvider.getList("subscribables", {
                    filter: {
                        id_neq_any: subscribedCurriculumIds,
                        is_active: true,
                        is_unlisted: false,
                        publisher_tenant_id_neq: currentTenantId()
                    },
                    pagination: {page: 1, perPage: 10000},
                    sort: {field: "id", order: "ASC"},
                    meta: {prefetch: ["curriculum", "tenants"], scopingEscapeHatch: true},
                });

                setSubscribables(subscribables);
                setSettingsData(settings);
                setSubscribedCurriculumIds(subscribedCurriculumIds);
            } catch (error) {
                remoteLog("Error on SubscribableList fetchData method: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if(loading) return <Loading/>
    const filter = !isSuperAdmin() ?  {id_neq_any: subscribedCurriculumIds, is_active: true, is_unlisted: false, publisher_tenant_id_neq: currentTenantId()} : {};

  function getPreprocessedItem() {
          return (item) => {
              let textToProcess = `${item.title} ${item.description} ${item.publisher} ${item.language}`;
              if (item.rating) {
                  const ratingStr = `${item.rating} star ${item.rating} stars`;
                  textToProcess += ` ${ratingStr}`;
              }
              const doc = nlp(textToProcess);
              const keywords = [
                  ...new Set([
                      ...doc.nouns().toSingular().out("array"),
                      ...doc.verbs().toInfinitive().out("array")
                  ])
              ].map(s => s.toLowerCase());
              return {
                  ...item,
                  searchableTerms: keywords.join(" ")
              };
          };
  }

    async function fetchSubscribables() {
        return subscribables.map((item) => ({
            id: item.id,
            title: item.curriculum?.name,
            description: item.curriculum?.description,
            path: `/subscribables/${item.id}/show`,
            language: item.curriculum?.language,
            publisher: item.publisher_tenant?.name,
            rating: item.rating
        }));
    }

    return(
        <>
            <TopToolbar sx={{ mb: "0.5rem" }}>
                <Box sx={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width:"40vw" }}>
                        <FuzzySearchBox
                            placeholder="Search (⌘K)"
                            fetchData={async () => {
                                return await fetchSubscribables();
                            }}
                            preprocessItem={getPreprocessedItem()}
                            fuzzysortOptions={{
                                keys: ['searchableTerms', 'title', 'description', 'publisher', 'language'],
                                threshold: -5000,
                                allowTypo: true,
                                limit: 10,
                            }}
                            primaryResultKey="title"
                            secondaryResultKey="publisher"
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            startIcon={<KeyboardReturnIcon />}
                            label="Return To Subscribed Curriculums"
                            onClick={() => navigate(`/subscriptions`)}
                        />
                    </Box>
                </Box>
            </TopToolbar>
            <List filter={filter} actions={false}
                  queryOptions={{ meta: { scopingEscapeHatch: true, prefetch: ["curriculum", 'tenants'] } }}
                  pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} exporter={false}
                  title={<ListTitle resourceName="Marketplace List" />} disableSyncWithLocation
            >
                <Datagrid bulkActionButtons={false} sx={{
                    "& .RaDatagrid-headerCell": { display: "none" }
                }}>
                    <CurriculumListView currentView="subscribables" settings={settingsData}/>
                </Datagrid>
            </List>
        </>
    )
};

const CreateReviewDialogBox = ({recordId}) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const onSuccess = (data) => {
        if (record) {
            closeDialog();
            refresh();
            notify('Review posted successfully');
        }
    };
    const { data: subscribable_record } = useGetOne('subscribables', {id: recordId, meta: {prefetch: ['curriculum']}});
    const record = {
        subscribable_id: recordId,
        review_date: new Date(),
        user_id: getUserId(),
        subscriber_tenant_id: currentTenantId(),
        publisher_tenant_id: subscribable_record?.publisher_tenant_id,
        type: 'review',
        division_id: subscribable_record?.curriculum?.division_id,
    };

    const ratingValidation = (value: any) => {
        if (!value) {
            alert("Rating is required");
            return "Rating is required";
        }
        return undefined;
    };

    return (
        <Create resource={"reviews"} mutationOptions={{onSuccess}}>
            <Typography variant="h6" gutterBottom sx={{ml: '15px'}}>
                Add Review
            </Typography>
            <SimpleForm defaultValues={record}>
                <RatingInput label={"Rating"} source={"rating"} validate={ratingValidation}/>
                <TextInput source="title" required/>
                <TextInput source="review" label={"Description"} multiline />
            </SimpleForm>
        </Create>
    );
};

const Unsubscribe = () => {
    const [loading, setLoading] = useState(false);
    const record = useRecordContext();
    const navigate = useNavigate();

    const handleUnsubscribe = async () => {
        try {
            setLoading(true);
            const dataProvider = window.swanAppFunctions.dataProvider;
            const user = JSON.parse(getLocalStorage("user"));
            const {data: subscriptions} = await dataProvider.getList("subscriptions", {
                filter: {subscribable_id: record?.id, subscriber_tenant_id: user.tenant_id}
            });
            const {data: subscribers} = await dataProvider.getList("subscribers", {
                filter: {
                    subscribable_id: record?.id,
                    subscriber_tenant_id: user.tenant_id,
                    start_date: subscriptions[0].start_date
                },
                meta: {scopingEscapeHatch: true}
            });
            await dataProvider.delete("subscriptions", {id: subscriptions[0].id});
            await dataProvider.delete("subscribers", {id: subscribers[0].id});
            navigate("/subscriptions");
        } catch (error) {
            console.error("ERROR: While Unsubscribe :", error);
            remoteLog("Error sending on handleUnsubscribe: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            startIcon={<UnsubscribeIcon/>}
            onClick={handleUnsubscribe} disabled={loading}
            label={loading ? "Unsubscribing..." : "UnSubscribe"}
        />
    );
};

export const ShowActions = () => {
    const [isSubscriber,setIsSubscriber] = useState(false);
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
    const dataProvider = window.swanAppFunctions.dataProvider;
    const recordId = Number(useGetRecordId());
    const {refresh} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const currentDate = new Date().toISOString().split('T')[0];
    const Subscribe = () => {
        const subscribleRecord = useRecordContext();
        const [create] = useCreate();
        const notify = useNotify();
        const redirect = useRedirect();
        const dataProvider = window.swanAppFunctions.dataProvider;
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);
        const [isLoading, setIsLoading] = useState(false);

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

        const handleSubscribeClick = async (type: any) => {
            try {
                setIsLoading(true);
                const user = JSON.parse(getLocalStorage("user"));
                await dataProvider.create("subscribers", {
                    data: {
                        start_date: currentDate,
                        end_date:'12/31/2029',
                        subscribable_id: subscribleRecord?.id,
                        subscriber_tenant_id: user.tenant_id,
                        tenant_id: subscribleRecord?.publisher_tenant_id,
                        subscription_type: type,
                        // division_id: subscribleRecord?.curriculum?.division_id
                    },
                    meta: { scopingEscapeHatch: true }
                });
                await create("subscriptions", {
                    data: {
                        start_date: currentDate,
                        end_date:'12/31/2029',
                        subscribable_id: subscribleRecord?.id,
                        subscriber_tenant_id: user.tenant_id
                    }
                }, {
                    onSuccess: () => {
                        closeDialog();
                        notify("subscription added", {type: 'success', autoHideDuration: 2000})
                        redirect("/subscriptions");
                    }
                });
            } catch (error) {
                remoteLog("Error on SubscribableList handleSubscribeClick method: ", error);
            } finally {
                setIsLoading(false);
                handleClose();
            }
        }
        return(
            <div>
                <Button
                    id="fade-button"
                    aria-controls={open ? 'fade-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    startIcon={<SubscriptionsIcon/>}
                    label={"Subscribe"}
                />
                <Menu
                    id="fade-menu"
                    MenuListProps={{
                        'aria-labelledby': 'fade-button',
                    }}
                    TransitionComponent={Fade}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                   {isLoading && (
                        <Backdrop open sx={{
                                position: "absolute",
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                zIndex: (theme) => theme.zIndex.drawer + 1}}>
                            <CircularProgress color="info" size={24} />
                        </Backdrop>
                    )}
                    <MenuItem onClick={() => handleSubscribeClick("one-time")} sx={{color: "primary.main"}}>
                        <PaymentIcon fontSize="small" color="primary"/>
                        <Box component="span" ml={"0.50rem"}>
                            One-Time Pay {formatCurrency(subscribleRecord?.one_time_amount)}
                        </Box>
                    </MenuItem>

                    <MenuItem onClick={() => handleSubscribeClick("monthly")} sx={{color: "primary.main"}}>
                        <RepeatIcon fontSize="small" color="primary"/>
                        <Box component="span" ml={"0.50rem"}>
                            Monthly Pay {formatCurrency(subscribleRecord?.monthly_amount)}
                        </Box>
                    </MenuItem>
                </Menu>
            </div>
        );
    }

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const {data:subscriptions} = await dataProvider.getList('subscriptions', {
                    filter: {
                        subscriber_tenant_id: currentTenantId(),
                        subscribable_id: recordId
                    }
                });
                if (subscriptions.length > 0) {
                    setIsSubscriber(true); //TODO disable review button when the subscriber already posted a review for this subscribable
                    setIsSubscriptionActive(subscriptions[0]?.end_date > currentDate)
                }
                if(refresh) {
                    console.log('Refreshing...');
                    setIsSubscriber(false);
                }
            } catch (error) {
                remoteLog("Error on SubscribableShow fetchRecord: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRecord();
    }, [recordId,refresh]);

    if(loading) return <Loading/>

    const handleAddReviewClick = () => {
        openDialog(<CreateReviewDialogBox recordId={recordId}/>)
    }

    const params = new URLSearchParams(location.search);
    const isFromSubscribedCurriculum = params.get("from") === "subscribedCurriculums";
    const returnPath = isFromSubscribedCurriculum ? "/subscriptions" : "/subscribables";
    const returnButtonLabel = `Return to ${isFromSubscribedCurriculum ? "Subscribed Curriculums" : "Marketplace"}`;
    return (
        <TopToolbar>
            {isSubscriber && isSubscriptionActive && <FunctionField render={(record)=>
                <Button label={"Duplicate"} startIcon={<ContentCopyIcon/>}
                        onClick={() =>{ openDialog(<DuplicateDialog width={'32rem'} record={record} resource={"curriculum"}/>)}}
                ></Button>
            }/>}
            {isSubscriber && <Button startIcon={<RateReviewRoundedIcon/>} label="Add Review" onClick={handleAddReviewClick}/>}
            {isFromSubscribedCurriculum ? <Unsubscribe/> : <Subscribe />}
            <Button
                startIcon={<KeyboardReturnIcon />}
                label={returnButtonLabel}
                onClick={() => navigate(returnPath)}
            />
        </TopToolbar>
    );
}

export const SubscribableShow = (props: any) => (
    <Show {...showDefaults(props)} actions={<ShowActions />} queryOptions={{meta: {prefetch: ['curriculum', 'tenants']}}}>
        <CurriculumShowView currentView={"subscribables"} />
    </Show>
);