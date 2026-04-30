import {
    getDivisionId,
    isAcademy,
    isExecutiveCoachingFlavored,
    isIndianTenant,
    isLargeAcademy,
    isRegularSchoolFlavored
} from "./../src/businessLogic";

export const AssignmentStatus = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CHECK_PENDING: 'check_pending',
    IN_CORRECT: 'in_correct',
};

export const AssignmentBlockStatus = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CHECK_PENDING: 'check_pending',
    IN_CORRECT: 'in_correct',
};

export const StatusLabel =  {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    SCHEDULED: 'Scheduled',
    ACTIVE: 'Active',
    CHECK_PENDING: 'Check Pending',
    IN_CORRECT: 'Incorrect',
}

export const StatusValue = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    SCHEDULED: 'scheduled',
    ACTIVE: 'active',
    CHECK_PENDING: 'check_pending',
    IN_CORRECT: 'in_correct',
}

export const EnrolmentStatus = {
    NOT_STARTED: 'not started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
};

export const CertificateStatus = {
    ISSUED: 'issued',
    ORDERED: 'ordered',
    RECEIVED: 'received',
}

export const TrophiesStatus = {
    ISSUED: 'issued',
    ORDERED: 'ordered',
    RECEIVED: 'received',
}

export const ClassProgressStatus = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
}

export const ClassesStatus = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    SCHEDULED: 'scheduled',
    DRAFT: 'draft',
}

export const InvoicesStatus = {
    PAID: 'paid',
    UNPAID: 'unpaid',
}

export const CurriculumStatus = {
    PUBLISHED: 'published',
}

export const UserRoles = {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    PRO_COACH: 'pro_coach',
    ORG_COACH: 'org_coach',
    ORG_ADMIN: 'org_admin',
    PARENT: 'parent',
    STUDENT: 'student',
    PRO_COACH_PLUS: 'pro_coach_plus',
    PRO_COACH_MINUS_COACHING: 'pro_coach_minus_coaching',
    DIVISION_ADMIN: 'division_admin',
    DIVISION_COACH: 'division_coach',
}

export const userRoleChoices = [
    { id: UserRoles.ADMIN, name: 'Admin'},
    { id: UserRoles.SUPER_ADMIN, name: 'Super Admin'},
    { id: UserRoles.PRO_COACH, name: 'Pro Coach'},
    { id: UserRoles.ORG_COACH, name: 'Org Coach'},
    { id: UserRoles.ORG_ADMIN, name: 'Org Admin'},
    { id: UserRoles.PARENT, name: 'Parent'},
    { id: UserRoles.STUDENT, name: 'Student'},
    { id: UserRoles.PRO_COACH_PLUS, name: 'Pro Coach Plus'},
    { id: UserRoles.PRO_COACH_MINUS_COACHING, name: 'Content Publisher'},
    { id: UserRoles.DIVISION_ADMIN, name: 'Division Admin'},
    { id: UserRoles.DIVISION_COACH, name: 'Division Coach'}
]

export const TenantTypes = {
    PRO_COACH: 'Pro Coach',
    COACHING_ORG: 'Coaching Org',
    CHESS_CLUB: 'Chess Club',
}

export const TenantTypeLookup = {
    1: TenantTypes.PRO_COACH,
    2: TenantTypes.COACHING_ORG,
    3: TenantTypes.CHESS_CLUB
} as any

export const TeachingMode = {
    IN_PERSON: 'In Person',
    HYBRID: 'Hybrid',
    REMOTE: 'Remote'
}

export const ClientTypes = {
    INDIVIDUAL: 'Individual',
    BUSINESS: 'Business'
}

export const genderChoices = [
    { id: 'Male', name: 'Male' },
    { id: 'Female', name: 'Female' }
];

export const supportStatusChoices = [
    {id: 'draft', name: 'Draft'},
    {id: 'published', name: 'Published'}
]

export const supportCategoryChoices = [
    {id: 'help', name: 'Help'},
    {id: 'faq', name: 'FAQ'}
]

export const getRoleChoices = () => {
    const roleChoices = [];
    if (isLargeAcademy() && getDivisionId()) {
        roleChoices.push({id: UserRoles.DIVISION_ADMIN, name: 'Division Admin'});
        roleChoices.push({id: UserRoles.DIVISION_COACH, name: 'Division Coach'});
    } else if (isLargeAcademy() && !getDivisionId()) {
        roleChoices.push({id: UserRoles.ORG_ADMIN, name: 'Org Admin'});
    } else if (isRegularSchoolFlavored()) {
        roleChoices.push({id: UserRoles.ORG_ADMIN, name: 'Org Admin'});
        roleChoices.push({id: UserRoles.ORG_COACH, name: 'Teacher'});
    } else if (isAcademy()) {
        roleChoices.push({id: UserRoles.ORG_ADMIN, name: 'Org Admin'});
        roleChoices.push({id: UserRoles.ORG_COACH, name: 'Org Coach'});
    } else {
        throw new Error("Invalid state: Cannot determine role choices for the current tenant type.");
    }
    return roleChoices;
}

export const ScheduleTypes = {
    DAILY: 'Daily',
    ONCE_A_WEEK: 'Once a Week',
    MULTIPLE_DAYS_IN_WEEK: 'Multiple Days in Week',
    ONCE: 'Once'
}

export const TenantConfigNames = {
    TENANT_TYPE: 'tenant_type',
    ALLOW_PUBLISHING: 'allow_publishing',
    ALLOW_COACHING: 'allow_coaching',
    LARGE_ACADEMY: 'large_academy',
    COUNTRY: 'country',
    GOOGLE_CALENDER_ID: 'google_calendar_id',
    PRO_COACH_BUILD_IN_SUBSCRIPTIONS: "pro_coach_built_in_subscriptions",
    ACADEMY_BUILD_IN_SUBSCRIPTIONS: "academy_built_in_subscriptions",
    LARGE_ACADEMY_BUILD_IN_SUBSCRIPTIONS: "large_academy_built_in_subscriptions",
    PUBLISHER_RATING: "pub_rating",
    PUBLISHER_PROFILE: "pub_profile",
    SCHOOL_STANDARD_LINKED: "school_standard_linked",
    REGULAR_SCHOOL_FLAVORED: "regular_school_flavored",
    EXECUTIVE_COACHING_FLAVORED: "executive_coaching_flavored",
    SCHOOL_STANDARD_ID: "school_standard_id",
    ALLOW_VOICE_OVER: "allow_voice_over"
}

export const getStepsLabel = () => {
    let studentName = isExecutiveCoachingFlavored() ? 'Executive' : 'Student';
    return {
        PROVIDE_CLASS_DETAILS: 'Provide Class Details',
        SELECT_STUDENTS: `Select ${studentName}`,
        SELECT_LESSONS: 'Select Lessons',
        SETUP_A_CALENDAR: 'Setup A Calendar',
        SUMMARY: 'Summary',
    };
}

export const getSetupLabel = () => {
    let label = "Set up an Individual"
    let labelForEdit = ClientTypes.INDIVIDUAL + " Client Edit";
    if (isRegularSchoolFlavored()) {
        label = "Set up a Student";
        labelForEdit = "Student Edit";
    } else if (isExecutiveCoachingFlavored()) {
        label = "Set up an Executive";
        labelForEdit = "Executive Edit";
    }
    return { SET_UP_A_LABEL: label, EDIT_PAGE_LABEL: labelForEdit  }
}
export const getClientLabel = () => {
    let label = "Clients"
    let labelWithSingular = "Client"
    if (isRegularSchoolFlavored()) {
        label = "Students";
        labelWithSingular = "Student";
    } else if (isExecutiveCoachingFlavored()) {
        label = "Executives";
        labelWithSingular = "Executive";
    }
    return { CLIENTS_LABEL: label, CLIENT_LABEL: labelWithSingular  }
}

export const studentStatusChoices = [
    {id: "Active",name: 'Active'},
    {id: "Pending",name: 'Pending'},
    {id: "Inactive",name: 'Inactive'}
]

export const UserStatus = {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    INACTIVE: 'Inactive'
}

export const EPOCHE_ZERO_DATE = new Date(0).toISOString();

export const HistoryLogType = {
    LIST: 'List',
    CREATE: 'Create',
    UPDATE: 'Update',
    SHOW: 'Show',
    VIEW: 'View'
}

export const VoiceStatus = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    REQUIRED_UPDATE: "Required Update",
};

function getYearRange(offset = 0) {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear + offset;
    const endYear = startYear + 1;
    const shortStartYear = startYear.toString().slice(-2);
    const shortEndYear = endYear.toString().slice(-2);
    return `(${shortStartYear}-${shortEndYear})`;
}


export function getPreviousDateRange(): string {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed (0 for January, 11 for December)
    const currentYear = now.getFullYear();
    const isIndia = isIndianTenant();
    if (isIndia) {
        if (currentMonth >= 3 && currentMonth <= 8) { // April to September (Term 1)
            return "last_year_term_2";
        } else if (currentMonth >= 9 && currentMonth <= 2) { // October to March (Term 2)
            return "last_year_term_1";
        } else {
            return "last_school_year";
        }
    } else {
        if (currentMonth >= 7) { // August to December (Fall semester)
            return "last_spring_semester";
        } else if (currentMonth >= 0 && currentMonth <= 5) { // January to June (Spring semester)
            return "last_fall_semester";
        } else {
            return "last_school_year";
        }
    }

}

export function getCurrentDateRange(): string {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed (0 for January, 11 for December)
    const isIndia = isIndianTenant();
    if (isIndia) {
        if (currentMonth >= 3 && currentMonth <= 8) { // April to September (Term 1)
            return "current_year_term_2";
        } else if (currentMonth >= 9 && currentMonth <= 2) { // October to March (Term 2)
            return "current_year_term_1";
        } else {
            return "current_school_year";
        }
    } else {
        if (currentMonth >= 7) { // August to December (Fall semester)
            return "current_fall_semester";
        } else if (currentMonth >= 0 && currentMonth <= 5) { // January to June (Spring semester)
            return "current_spring_semester";
        } else {
            return "current_school_year";
        }
    }
};

export function PerformanceDateRange() : Record<string, string>  {
    const isIndia = isIndianTenant();
    if(isIndia) {
        return {
            today: 'Today',
            last_school_year: 'Last School Year ' + getYearRange(-1),
            last_year_term_1: 'LY Term 1 (Apr - Sep)',
            last_year_term_2: 'LY Term 2 (Oct - Mar)',
            current_school_year: 'Current School Year ' + getYearRange(0),
            current_year_term_1: 'CY Term 1 (Apr - Sep)',
            current_year_term_2: 'CY Term 2 (Oct - Mar)',
            custom_range: 'Custom Range'
        }
    }
    return {
        today: 'Today',
        last_school_year: 'Last School Year ' + getYearRange(-1),
        last_fall_semester: 'LY Fall Semester (Aug - Dec)',
        last_spring_semester: 'LY Spring Semester (Jan - Jun)',
        current_school_year: 'Current School Year ' + getYearRange(0),
        current_fall_semester: 'CY Fall Semester (Aug - Dec)',
        current_spring_semester: 'CY Spring Semester (Jan - Jun)',
        custom_range: 'Custom Range'
    }
}

export const ReportViewModes = {
    MICRO_REPORT: 'Micro Report',
    MACRO_REPORT: 'Macro Report',
    MICRO_WITH_COMPARE_REPORT: 'Micro with Compare Report',
    MACRO_WITH_COMPARE_REPORT: 'Macro with Compare Report'
}

export const voiceChoices = [
    {id: "5l5f8iK3YPeGga21rQIX", name: "Adeline", type: "Narrative & Story"},
    {id: "kdmDKE6EkgrWrrykO9Qt", name: "Alexandra - Conversational and Real", type: "Conversational"},
    {id: "Z3R5wn05IrDiVCyEkUrK", name: "Arabella", type: "Narrative & Story"},
    {id: "yjJ45q8TVCrtMhEKurxY", name: "Dr. Von Fusion VF – Quirky Mad Scientist", type: "Characters & Animation"},
    {id: "BZgkqPqms7Kj9ulSkVzn", name: "Eve", type: "Conversational"},
    {id: "YOq2y2Up4RgXP2HyXjE5", name: "Gaming – Unreal Tonemanagement", type: "Characters & Animation"},
    {id: "NOpBlnGInO9m6vDvFkFC", name: "Grandpa Spuds Oxley", type: "Conversational"},
    {id: "tnSpp4vdxKPjI9w0GnoV", name: "Hope - upbeat and clear", type: "Social Media"},
    {id: "EkK5I93UQWFDigLMpZcX", name: "James - Husky & Engaging", type: "Narrative & Story"},
    {id: "aMSt68OGf4xUZAnLpTU8", name: "Juniper", type: "Conversational"},
    {id: "1SM7GgM6IMuvQlz2BwM3", name: "Mark - ConvoAI", type: "Conversational"},
    {id: "2zRM7PkgwBPiau2jvVXc", name: "Monika Sogam", type: "Social Media"},
    {id: "Hjzqw9NR0xFMYU9Us0DL", name: "Reginald - intense villain", type: "Characters & Animation"},
    {id: "scOwDtmlUjD3prqpp97I", name: "Sam - Support Agent & Audiobooks", type: "Conversational"},
    {id: "19STyYD15bswVz51nqLf", name: "Samara X", type: "Social Media"},
];

export const GameEntryMethods = {
    FILE_UPLOAD: "file_upload",
    INPUT_SCORE_CARD: "input_score_card",
    SCAN_SCORE_CARD: "scan_score_card",
    PLAY_GAME: "play_game",
    BOT_GAME: "bot_game"
};

export const colorChoices = [
    {id: "white", name: "White"},
    {id: "black", name: "Black"}
];

export const booleanChoices = [
    {id: true, name: 'Yes'},
    {id: false, name: 'No'}
];

export const GameResult = [
    {id: "0", value: "black_wins", name: "Black Wins"},
    {id: "1", value: "draw", name: "Draw"},
    {id: "2", value: "white_wins", name: "White Wins"}
];

export const PlayerColor = {
    WHITE: "white",
    BLACK: "black"
}

export const GameEndResult = {
    WON: "won",
    WHITE_WON: "white_won",
    BLACK_WON: "black_won",
    LOSE: "lose",
    Withdrawn: "withdrawn",
    DRAW: "draw",
    UNFINISHED: "unfinished"
};

export const GameModes = {
    SHOW : "show",
    EDIT : "edit",
    NEW : "new",
    PLAY : "play",
    BOT: "bot"
};

export const GAME_ACTIONS = {
    INIT_GAME: "init_game",
    MOVE: "move",
    GAME_OVER: "game_over",
    OPPONENT_DISCONNECTED: "opponent_disconnected",

    // Invitations
    SEND_INVITATION: "invitation",
    INVITATION_ACCEPTED: "invitation_accepted",
    INVITATION_REJECTED: "invitation_rejected",

    // Player actions
    OFFER_DRAW: "offer_draw",
    DRAW_ACCEPTED: "draw_accepted",
    DRAW_REJECTED: "draw_rejected",
    WITHDRAWN: "withdrawn",
    GAME_JOINED: "game_joined"
};

export const GAME_RESULTS = {
    DRAW: "1",
    WHITE_WINS: "2",
    BLACK_WINS: "0",
    UNFINISHED: "3"
};

export const GAME_STATUS = {
    INVITED: "invited",
    STARTED: "started",
    ENDED: "ended",
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    IN_COMPLETE: "in_complete",
    WITHDRAWN: "withdrawn",
    COMPLETED: "completed",
    SCHEDULED: "scheduled",
    WAITING: "waiting",
    PAUSED: "paused",
    DRAW_OFFERED: "draw_offered",
    PLAYER_1_ACCEPTED: "player_1_accepted",
    PLAYER_2_ACCEPTED: "player_2_accepted",
};

export const GameStatusLabels = {
    [GAME_STATUS.STARTED]: "Started",
    [GAME_STATUS.ENDED]: "Ended",
    [GAME_STATUS.NOT_STARTED]: "Not Started",
    [GAME_STATUS.INVITED]: "Invited",
    [GAME_STATUS.IN_PROGRESS]: "In Progress",
    [GAME_STATUS.IN_COMPLETE]: "In Complete",
    [GAME_STATUS.WITHDRAWN]: "withdrawn",
    [GAME_STATUS.COMPLETED]: "Completed",
    [GAME_STATUS.SCHEDULED]: "Scheduled",
    [GAME_STATUS.WAITING]: "Waiting",
    [GAME_STATUS.PAUSED]: "Paused",
    [GAME_STATUS.DRAW_OFFERED]: "Draw Offered",
};

export const BotDifficulty: Record<string, string> = {
    easy: "300",
    medium: "700",
    hard: "1500",
};

export const botChoices = [
    { id: "easy", name: "Easy" },
    { id: "medium", name: "Medium" },
    { id: "hard", name: "Hard" },
];

export const FeedbackStatus = {
    PENDING: "pending",
    GIVEN: "given"
};

export const FeedbackStatusLabels = {
    [FeedbackStatus.PENDING]: "Pending",
    [FeedbackStatus.GIVEN]: "Given",
};

export const NotaSymbols: Record<number, string> = {
    1: "!",       // good move
    2: "?",       // poor move
    3: "!!",      // brilliant move
    4: "??",      // blunder
    5: "!?",      // interesting move
    6: "?!"       // dubious move
}

export const getSymbolColor = (symbol: string) => {
    if (!symbol) return null;
    let k = 100;
    let l = 35;
    switch (symbol) {
        case "!":
            k = 100;
            break;
        case "!!":
            k = 110;
            break;
        case "!?":
            k = 80;
            break;
        case "?!":
            k = 50;
            l = 38;
            break;
        case "?":
            k = 15;
            l = 40;
            break;
        case "??":
            (k = 5), (l = 42);
    }
    return `hsla( ${k}, ${60}%, ${l}%,2)`;
}

export const gameCategory = [
    { id: "Bullet", name: "Bullet" },
    { id: "Blitz", name: "Blitz" },
    { id: "Rapid", name: "Rapid" },
    { id: "Classical", name: "Classical" },
];