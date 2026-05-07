import {getClassById} from "./classes.ts";
import {ScheduleTypes, UserRoles} from "../helpers/constants.ts";
import {constructDateTime, convertToIso8601BasicUtc} from "../utils.ts";
import appConfigOptions from "../../app_config.json";
import {currentTenantId, getGoogleCalendarId, getTenantName, getUserEmail, isOrgAdmin, isProCoach} from "../businessLogic.ts";
import {getLocalStorage, remoteLog, swanAPI} from "@mahaswami/vc-frontend";

export const beforeCreateClassSchedule = async (params: any, dataProvider: any, resource: string) => {
    const classId = params.data.class_id;
    let eventResponse;
    if (classId && params.data.is_google_calendar_enabled) {
        const classDetail: any = await getClassById(dataProvider, classId);
        eventResponse = await triggerCalendarEventCreation(params.data, classDetail, "create");
        if(eventResponse.status === "success" ) {
            const eventId = eventResponse.event.id;
            params.data = {...params.data, google_calendar_id_value: eventId};
        }
    }
    return params
}

export const afterUpdateClassSchedule = async (response: any, dataProvider: any, resource: string) => {
    const classId = response.data.class_id;
    const scheduleData = response.data;
    if (classId && scheduleData.is_google_calendar_enabled) {
        const classDetail: any = await getClassById(dataProvider, classId);
        if (classDetail.status !== 'draft') {
            await triggerCalendarEventCreation(scheduleData, classDetail, "update");
        }
    }
    return response;
}

export const afterDeleteSchedule = async (result, dataProvider, resource) => {
    const googleCalendarEventId = result?.data?.data.google_calendar_id_value;
    let googleCalendarId = await getGoogleCalendarId(dataProvider);
    const eventDetails ={
        calendar_id: googleCalendarId,
        id: googleCalendarEventId
    }
    if(googleCalendarId && googleCalendarEventId)
        await deleteEventInGoogleCalendar(eventDetails);
    return result;
}

export const triggerCalendarEventCreation = async (data, classData, actionType) => {
    try {
        //Create CalendarEvents
        const classId = data.class_id;
        const dataProvider = window.swanAppFunctions.dataProvider;
        const teachingMode = classData.teaching_mode.name;
        let isRemote_mode = teachingMode === 'Remote';
        let attendeeEmails = [];
        const scheduleTypeId = data?.schedule_type_id;

        const {data: schedule_type} = scheduleTypeId ? await dataProvider.getOne('schedule_types', {id: scheduleTypeId}) : {};
        const scheduleTypeName = schedule_type?.name;
        let googleCalendarId = await getGoogleCalendarId(dataProvider);
        googleCalendarId = await setupTenantGoogleCalendar(dataProvider, googleCalendarId, data.timezone);

        const {data:enrollments} = await dataProvider.getList('enrollments', {filter:{class_id: classId}, meta:{prefetch: ['students']}});
        let userIds = enrollments.map((enrollment: any) => enrollment.student.user_id);
        const parentUserIds = enrollments.map((enrollment: any) => enrollment.student.parent_user_id);
        userIds = [...userIds, ...parentUserIds];
        const {data: users} = await dataProvider.getList('users',{ filter:{id: userIds}, pagination: {page: 1, perPage: 10000}});
        if (isRemote_mode) {
            enrollments.forEach((enrollment: any) => {
                const studentData = enrollment.student;
                const studentUser = users.find((user: any) => user.id === studentData.user_id);
                const isIntegratedParentalEngagement = studentData?.is_integrated_parental_engagement
                if (isIntegratedParentalEngagement && studentData.parent_user_id) {
                    const parentUser = users.find((user: any) => user.id === studentData.parent_user_id);
                    attendeeEmails.push({email: parentUser.email});
                }
                attendeeEmails.push({email: studentUser.email});
            })
        }
        const timezone = data.timezone;
        const start_date = new Date(data.start_date);
        const start_time = new Date(data.start_datetime);
        const end_time = new Date(data.end_datetime);
        start_time.setFullYear(start_date.getFullYear(), start_date.getMonth(), start_date.getDate())
        end_time.setFullYear(start_date.getFullYear(), start_date.getMonth(), start_date.getDate())
        const endDate = new Date(new Date(data.end_date).setHours(23,59,59));
        const endDateTimeForUntil = convertToIso8601BasicUtc(endDate)
        const dayMap = {sunday: 'SU', monday: 'MO', tuesday: 'TU', wednesday: 'WE', thursday: 'TH', friday: 'FR', saturday: 'SA'};
        let recurrenceRule = null;

        switch (scheduleTypeName) {
            case ScheduleTypes.DAILY: // Daily
                recurrenceRule = `RRULE:FREQ=DAILY;UNTIL=${endDateTimeForUntil}`;
                break;
            case ScheduleTypes.ONCE_A_WEEK: // WeeklyOnce
                const dayInShort = typeof data.days === 'string' ? data.days.split(',').map(day => dayMap[day.toLowerCase()]) :data.days.map(day => dayMap[day.toLowerCase()]);
                recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${dayInShort.join(',')};UNTIL=${endDateTimeForUntil}`;
                break;
            case ScheduleTypes.MULTIPLE_DAYS_IN_WEEK: //  WeeklyMultiple
                const daysInShort = typeof data.days === 'string' ? data.days.split(',').map(day => dayMap[day.toLowerCase()]) :data.days.map(day => dayMap[day.toLowerCase()]);
                recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${daysInShort.join(',')};UNTIL=${endDateTimeForUntil}`;
                break;
        }
        let eventDetails = {
            calendar_id: googleCalendarId,
            summary:classData.name,
            description:data.details,
            start: {
                dateTime: start_time.toISOString(),
                timeZone: timezone
            },
            end: {
                dateTime: end_time.toISOString(),
                timeZone: timezone
            },
            attendees: attendeeEmails,
            recurrence:[recurrenceRule]
        }
        let response;
        if(actionType === "create") {
            response = await createEventInGoogleCalendar(eventDetails);
        } else if(actionType === "update") {
            const calenderId = data?.google_calendar_id_value;
            eventDetails = {...eventDetails, id: calenderId};
            response = await updateEventInGoogleCalendar(eventDetails);
        }
        return response;
    } catch (error) {
        console.error("Error sending on triggerCalendarEventCreation: ", error);
        remoteLog("Error sending on triggerCalendarEventCreation: ", error);
    }
}

const createEventInGoogleCalendar = async(eventDetails) => {
    const response = await swanAPI("create_calendar_event", eventDetails);
    return response;
}
const updateEventInGoogleCalendar = async(eventDetails) => {
    const response = await swanAPI("update_calendar_event", eventDetails);
    return response;
}

const deleteEventInGoogleCalendar = async(eventDetails) => {
    const response = await swanAPI("delete_calendar_event", eventDetails);
    return response;
}

const createGoogleCalendar  = async (calendarDetails) => {
    const response = await swanAPI("create_calendar", calendarDetails);
    return response;
}

const setupTenantGoogleCalendar = async (dataProvider, googleCalendarId, timezone) => {
    try {
        if (!googleCalendarId || googleCalendarId === '') {
            if (isProCoach() || isOrgAdmin()) {
                const userEmail = getUserEmail()
                const calendarDetails = {
                    summary: `${getTenantName()}: Coaching`,
                    time_zone: timezone,
                    owner: userEmail,
                    description: 'Chess Coach Calendar',
                }
                const response = await createGoogleCalendar(calendarDetails)
                if (response.status === "success") {
                    await dataProvider.create('settings', {
                        data: {
                            tenant_id: currentTenantId(),
                            config_name: 'google_calendar_id',
                            config_value: response.calendar_id,
                        }
                    })
                    googleCalendarId = response.calendar_id;
                } else {
                    console.error(response)
                    return null
                }
            }
        }
        return googleCalendarId;
    } catch (error) {
        remoteLog("Error sending on setupTenantGoogleCalendar: ", error);
    }
}