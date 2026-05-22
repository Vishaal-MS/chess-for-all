import {useNavigate} from "react-router-dom";
import {
    isAcademy, isDivisionAdmin, isDivisionCoach, isExecutiveCoachingFlavored,
    isOrgAdmin, isOrgCoach, isProCoach, isRegularSchoolFlavored, isSchoolStandardLinked
} from "../../backend/common_logics.ts";
import {Fragment, useEffect, useRef} from "react";
import {DataTable, getLocalStorage, listDefaults, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {
    BooleanField, Button, CreateButton, DateField, List, SelectField, TextField, Toolbar, TopToolbar, useListContext
} from "react-admin";
import {ListTitle} from "../../components/Title.tsx";
import {ClassesStatus, classStatusChoises} from "../../helpers/constants.ts";
import {TeachingModesReferenceField} from "../teaching_modes.tsx";
import {CoachesReferenceField} from "../coaches.tsx";
import {StandardGradesReferenceField} from "../standard_grades.tsx";
import AddIcon from "@mui/icons-material/Add";
import {Box, Typography} from "@mui/material";
import {Empty} from "../common/empty.tsx";

export const MyClassesList = (props: any) => {
    const navigate = useNavigate();
    const showAction = isOrgAdmin() || isDivisionAdmin() || isProCoach();

    useEffect(() => {
        const totalClassesAtLogin = getLocalStorage("total_classes_at_login");
        if (totalClassesAtLogin === 0 && (isOrgAdmin() || isProCoach())) {
            if (isRegularSchoolFlavored()) {
                navigate("/classes/create?type=school")
            } else if (isSchoolStandardLinked()) {
                navigate("/classes")
            } else {
                navigate("/classes/create")
            }
        }
    }, []);

    return(
        <List {...listDefaults(props)} actions={ showAction ? <CreateToolBar /> : false}
              title={<ListTitle resourceName={`${isRegularSchoolFlavored() ? 'Teacher' : 'Coach'} Workspace`}/>}
              sort={{ field: 'start_date', order: 'DESC' }}
              pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} exporter={false}
              empty={isSchoolStandardLinked() ? <EmptyClassComponent /> : <EmptyComponent/>}
        >
            <ClassDataWithFilter />
        </List>
    );
}

const CreateToolBar = () => {
    const navigate = useNavigate();

    const handleOnClick = (type) => {
        navigate({
            pathname: '/classes/create',
            search: `?type=${type}`
        })
    }

    const SchoolClassAction = ({label}) => (
        <Button label={label} onClick={() => handleOnClick('school')}><AddIcon /></Button>
    )

    const RegularClassAction = () => (
        <Button label="Set up a new Class" onClick={() => handleOnClick('regular')} ><AddIcon /></Button>
    )

    if (isRegularSchoolFlavored()) {
        return (
            <TopToolbar style={{"minHeight": 40}}>
                <SchoolClassAction label={"Set up a new Class"}/>
            </TopToolbar>
        )
    }

    return (
        <TopToolbar style={{"minHeight": 40}}>
            {isSchoolStandardLinked() ?
                <Fragment>
                    <SchoolClassAction label={"Set up a new School Class"}/>
                    <RegularClassAction/>
                </Fragment> :
                <CreateButton label="Setup a new class" />
            }
        </TopToolbar>
    )
}

const ClassDataWithFilter = () => {
    const {data, filterValues, setFilters} = useListContext();
    const defaultSetRef = useRef(true);
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();

    useEffect(() => {
        if (defaultSetRef.current && data && data.length > 0 && !filterValues.status) {
            setFilters({
                ...filterValues, status: [ClassesStatus.ACTIVE, ClassesStatus.SCHEDULED]
            });
            defaultSetRef.current = false;
        }
    }, [data, filterValues, setFilters]);
    return (
        <DataTable bulkActionButtons={false}>
            <DataTable.Col source={"name"} />
            {!(isRegularSchoolFlavored() || isExecutiveCoachingFlavor) &&
                <DataTable.Col source="teaching_mode_id" field={(props) =>
                    <TeachingModesReferenceField { ...props } label="Coaching Mode" link={false}
                                                 queryOptions={{ meta: {scopingEscapeHatch:true }}} />} />
            }
            <DataTable.Col source="start_date" field={DateField} />
            <DataTable.Col source="end_date" field={DateField} />
            <DataTable.Col source="status" field={(props) => <SelectField {...props} choices={classStatusChoises} />} />
            {isAcademy() && !isOrgCoach() &&
                <DataTable.Col label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} source="coach_id" link={false}
                               field={(props: any) => <CoachesReferenceField {...props}>
                                   <TextField source={"user.fullName"}/>
                               </CoachesReferenceField>} />
            }
            {isSchoolStandardLinked() && <DataTable.Col source='is_school_class' field={BooleanField}/>}
            {isSchoolStandardLinked() && <StandardGradesReferenceField source="standard_grade_id" />}
        </DataTable>
    )
}

const EmptyClassComponent = () => {
    const navigate = useNavigate();
    const handleOnClick = (type) => {
        navigate({pathname: '/classes/create', search: `?type=${type}`})
    }
    return (
        <Box style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            height: "calc(100vh - 200px)"
        }}>
            <Typography sx={{color: 'grey'}} variant="h4" gutterBottom>
                {"No Class Yet"}
            </Typography>
            <Toolbar>
                <Button label={"Set up a new School Class"} onClick={() => handleOnClick('school')}><AddIcon/></Button>
                <Button label="Set up a new Class" onClick={() => handleOnClick('regular')}><AddIcon/></Button>
            </Toolbar>
        </Box>
    )
}

const EmptyComponent = () => {
    if (isOrgCoach() || isDivisionCoach()) {
        return <Empty emptyText={"You are not assigned to any class."} showCreateIfApplicable={false}/>
    }
    return <Empty emptyText={""}/>
}