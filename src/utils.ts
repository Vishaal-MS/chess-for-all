import {getLocalStorage, remoteLog} from "@mahaswami/vc-frontend";
import {StatusLabel, StatusValue} from "./helpers/constants.ts";
// import { getEmailsBasedOnEnv } from "./configuration.tsx";
import { format } from "date-fns";
// import { extractDetailsFromPGNStr } from "./views/games/gameUtils.ts";

export const formatStatus = (status) => {
    switch (status) {
        case StatusValue.COMPLETED:
            return StatusLabel.COMPLETED;
        case StatusValue.IN_PROGRESS:
            return StatusLabel.IN_PROGRESS;
        case StatusValue.NOT_STARTED:
            return StatusLabel.NOT_STARTED;
        case StatusValue.SCHEDULED:
            return StatusLabel.SCHEDULED;
        case StatusValue.ACTIVE:
            return StatusLabel.ACTIVE;
        case StatusValue.IN_CORRECT:
            return StatusLabel.IN_CORRECT;
        case StatusValue.CHECK_PENDING:
            return StatusLabel.CHECK_PENDING;
        default:
            return status;
    }

}

export const validateVideoUrl = (value: string) => {
    const urlPattern = /^https:\/\/(www\.)?youtu\.be\/[A-Za-z0-9_-]+(\?si=[A-Za-z0-9_-]+)?$/;
    return urlPattern.test(value) ? undefined : 'Invalid YouTube URL format. Expected format: https://youtu.be/EngW7tLk6R8?si=xxx';
};


export const formatAmount = (amount) => {
    return '$' + new Intl.NumberFormat('en-US').format(amount);
};

export const formatCurrency = (value) => {
    if (value == null) return value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

// Function to format the date as "Month Year" (e.g., "Jan 2025")
export const formatMonth = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

// Function to convert "Month Year" string into a Date object for proper sorting
export const parseMonthYear = (monthYear) => {
    const [month, year] = monthYear.split(' ');
    const monthIndex = new Date(`${month} 1, 2020`).getMonth(); // Get the month index
    return new Date(year, monthIndex); // Create a Date object with the year and month index
};

export function formatDateWithShortYear(dateInput) {
    const date = new Date(dateInput);
    const locale = navigator.language;

    const defaultParts = new Intl.DateTimeFormat(locale).formatToParts(date);
    const shortYear = new Intl.DateTimeFormat(locale, { year: '2-digit' })
        .formatToParts(date)
        .find(p => p.type === 'year');

    const overriddenParts = defaultParts.map(part =>
        part.type === 'year' ? shortYear : part
    );
    return overriddenParts.map(p => p.value).join('');
}

export const renderAddressLine1 = (record) =>{
   let address_line1 = '';
   if(record.address_line){
             address_line1 = record.address_line;
   }
   if(record.area){
            if(address_line1 !== '') {
                address_line1 += ', ' + record.area;
            }
            else
            {
                address_line1 = record.area;
            }
   }
    return address_line1 ;
};

export const renderAddressLine2 = (record) =>{
    let address_line2 = '';
    if(record.city){
        address_line2 = record.city;
    }
    if(record.state){
        if(address_line2 !== '') {
            address_line2 += ', ' + record.state;
        }
        else
        {
            address_line2 = record.state;
        }
    }
    if(record.zipcode){
        if(address_line2 !== '') {
            address_line2 += ', ' + record.zipcode;
        }
        else
        {
            address_line2 = record.zipcode;
        }
    }
    return address_line2 ;
};

import React, { FunctionComponent, memo } from 'react';

/**
 * A version of React.memo that preserves the original component type allowing it to accept generics.
 * See {@link https://stackoverflow.com/a/70890101}
 */
export const genericMemo = <T>(component: T): T => {
    const result = memo(component as FunctionComponent);

    // We have to set the displayName on both the field implementation and the memoized version.
    // On the implementation so that the memoized version can pick them up and users may reference the defaultProps in their components.
    // On the memoized version so that components that inspect their children props may read them.
    // @ts-ignore
    result.displayName = component.displayName?.replace('Impl', '');
    return result as unknown as T;
};

export const parseDate = (date: String) => {
    if(date){
        const dateTime = new Date(date);
        const year = dateTime.getUTCFullYear();
        const month = String(dateTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getUTCDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
    else return null;
}

export const getSimpleDate = (date: Date | string) => {
    return format(date, "yyyy-MM-dd")
}


export const parseTime = (date: String) => {
    if(date){
        const dateTime = new Date(date);
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    else return null;
}

export const constructDateTime = (date, time,timeZone) => {
    // Combine the date and time into a single datetime string
    const parsedDate = parseDate(date);
    const parsedTime = parseTime(time);
    const dateTimeString = `${parsedDate}T${parsedTime}:00`;
    console.log('Date Time String:', dateTimeString);
    return dateTimeString;

}

export const uploadImage = async (file: File, resource: String) => {
    const fileId = await window.swanAppFunctions.dataProvider.fileUpload(resource, file.name, file)
    //Wait for 2 seconds and then return the imageUrl as immediate call to R2 bucket fails.
    await new Promise(resolve => setTimeout(resolve, 2000));
    return fileId;
}

export const uploadFile = async (file: File, resource: String) => {
    const spreadsheetId = window.spreadsheetId;
    const resourceId = undefined
    let user = undefined
    if (getLocalStorage('user_email')) {
        user = getLocalStorage('user_email');
    }
    const fileStorageConfig = {
        ...window.appConfigOptions.file_storage,
        ...window.appConfigOptions.environments[window.app_env].file_storage
    }
    let fileContent: string =  await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    fileContent = fileContent.split(';base64,')[1];

    const contentType = file.type;
    const size = file.size;
    const body = {} as any;
    body.spreadsheetId = spreadsheetId;
    body.resource = resource;
    body.resourceId = resourceId;
    body.user = user;
    body.content_type = contentType;
    body.file_content = fileContent;
    body.size = size;
    body.name = file.name;
    body.file_storage_config = fileStorageConfig;
    const response = await swanAPI("file_upload", body);
    console.log('File Upload Response', response);
    const fileId = response.file_id;
    //Wait for 2 seconds and then return the imageUrl as immediate call to R2 bucket fails.
    await new Promise(resolve => setTimeout(resolve, 2000));
    return fileId;
}


export const validateZipCode = (value , country) => {
  if (!country) { return '';}
  if (!value) { return 'Zip code is required'; }
  if (country === 'US') {
    return /^\d{5}$/.test(value) ? '' : 'Zip code must be exactly 5 digits';
  }
  if (country === 'IN') {
    return /^\d{6}$/.test(value) ? '' : 'Zip code must be exactly 6 digits';
  }
  return '';
};

export const validatePhoneNumber = (phone)=> {
    if (phone) {
        phone = phone.replace(/[^0-9]/g, "");
        let part1 = "(";
        let part2 = "";
        let part3 = "";
        let status = false;
        if (phone.length > 3) {
            part1 = "(" + phone.slice(0, 3) + ") ";
        } else if (phone.length > 0) {
            part1 = "(" + phone;
            status = true;
        } else
            return "";
        if (phone.length > 6) {
            part2 = phone.slice(3, 6) + "-";
        } else {
            if (!status) {
                part2 = phone.slice(3, phone.length);
                status = true;
            }
        }
        if (phone.length >= 10) {
            part3 = phone.slice(6, 10)
        } else {
            if (!status) {
                part3 = phone.slice(6, phone.length);
                status = true;
            }
        }
        return part1 + part2 + part3;
    }
}

export const validatePhoneNumberLength = (fieldLabel = "Phone number") => (value) => {
    const digits = value?.replace(/\D/g, '');
    if (digits && digits.length > 1 && digits.length !== 10) {
        return `${fieldLabel} must be a 10-digit number`;
    }
    return "";
}

export const getPageTitle = ({tenantName, resource, recordName}) => {
    let title = `${tenantName} - ${resource}`;
    if (recordName) {
        title += ` - ${recordName}`;
    }
    return title;
}

export const camelCaseToLabel = (str: string): string => {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, char => char.toUpperCase());
};

export const getFormattedTime = (isoString) => {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${String(hours).padStart(2, '0')}:${formattedMinutes} ${ampm}`;
};

export const getLanguageDescription = (languageCode: any) => {
    const language = getLanguagesMap().filter(lan => lan.id === languageCode);
    return language.map(language => language.name);
}

export const getLanguagesMap = () => {
    const choices = [
        { id: 'EN' , name: 'English' },
        { id: 'HI' , name: 'Hindi' },
        { id: 'KN' , name: 'Kannada' },
        { id: 'ES' , name: 'Spanish' },
        { id: 'TA' , name: 'Tamil' },
        { id: 'TE' , name: 'Telugu' },
    ]
    return choices;
};

export const addAliasToEmail = (email: string, alias: string): string => {
    const [localPart, domain] = email.split("@");
    const cleanLocalPart = localPart.split("+")[0]; // remove previous alias
    return `${cleanLocalPart}+${alias}@${domain}`;
};

export const convertToIso8601BasicUtc = (date: Date): string => {
   return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function addLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.innerText = 'Loading...';
    loadingIndicator.style.position = 'fixed'; // Use 'fixed' for viewport centering
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)'; // Correctly centers the element
    loadingIndicator.style.backgroundColor = 'rgba(74, 93, 179, 0.7)'; // Darker background
    loadingIndicator.style.color = 'white'; // White text
    loadingIndicator.style.padding = '20px'; // Larger padding
    loadingIndicator.style.borderRadius = '8px'; // Slightly larger border radius
    loadingIndicator.style.zIndex = '1000'; // Ensure it's on top of other elements
    loadingIndicator.style.fontSize = '20px'; // Larger font size
    loadingIndicator.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'; // Add a subtle shadow
    document.body.appendChild(loadingIndicator);
    return loadingIndicator;
}

export type MessagesType = Set<string>;
export type DatasetType = Record<"additionalVisuals" | "animatedTutorial" | "goals" | "help" | "title", string >

export const replaceVariables = (message: string) => {
    let absoluteMessage = message.replace(/\n/g, "")
    // Removed NMoves before create voice over
    // Removed $ sign eg: "Correct. Now a "blocked pawn chain" has formed.$b5;"
    // TODO: Later we need to download all Nmoves files and use it
    absoluteMessage = absoluteMessage.replace("{NMoves}", "");
    // remove additional params like bubble square and timeout
    if (absoluteMessage.includes("$")) {
        let removedCommandPairs = absoluteMessage.split("$");
        absoluteMessage = removedCommandPairs[0];
    }
    return absoluteMessage
}

export const parseAnimAndVisualMessages = (visuals: string) => {
    let visualMessages = new Set();
    visuals?.split(";").forEach(c => {
        const visualParts = c.split(":");
        const [command, ...messageParts] = visualParts;
        if (command.toLowerCase().includes("bubble")) {
            let message = messageParts.join("").split("/")[0];
            visualMessages.add(message);
        }
    });
    return visualMessages
}

export const parseGoalMessages = (goals: string) => {
    let goalMessages = new Set();
    goals?.split(";").forEach((goalStr) => {
        const parts = goalStr.split(":");
        if (parts.length > 1) {
            const subParts = parts[1].split("/");
            if (subParts.length > 2) {
                const isSuccess = subParts[1].startsWith("success");
                const message = subParts[2];
                if (message && message.trim()) {
                    const absoluteMessage = replaceVariables(message)
                    goalMessages.add({ message: absoluteMessage, isSuccess });
                }
            }
        }
    });
    return goalMessages;
}

export const parseHelp = (help: string) => {
    if (!help) return;
    help = window.DiagramAnimationController.parseDiagramHelp(help);
    if (help && help.text) {
        return replaceVariables(help.text);
    }
    return "";
}

export function extractMessageAndConstructKeyMap(dataset: DatasetType): Record<string, string> {
    let messageAndKeys: Record<string, string> = {};

    if (!dataset) return messageAndKeys;
    const { additionalVisuals, animatedTutorial, goals, help, title } = dataset
    const goalUniqueMessages = parseGoalMessages(goals);
    const visualUniqueMessages = parseAnimAndVisualMessages(additionalVisuals);
    const animatedTutorialUniqueMessages = parseAnimAndVisualMessages(animatedTutorial);
    const helpText = parseHelp(help);
    if (goalUniqueMessages) {
        Array.from(goalUniqueMessages).forEach((goalMsg: any, index: any) => {
            let clip = `goal${index + 1}`;
            if (goalMsg.isSuccess) {
                clip = `success${index + 1}`;
            }
            messageAndKeys[goalMsg.message] = clip;
        });
    }
    if (animatedTutorialUniqueMessages) {
        Array.from(animatedTutorialUniqueMessages).forEach((message: any, index: any) => {
            const clip = `tutorial${index + 1}`;
            messageAndKeys[message] = clip;
        });
    }
    if (visualUniqueMessages) {
        Array.from(visualUniqueMessages).forEach((message: any, index: any) => {
            const clip = `visual${index + 1}`;
            messageAndKeys[message] = clip;
        });
    }
    if (helpText) {
        messageAndKeys[helpText] = "help";
    }
    if (title) {
        messageAndKeys[title] = "title";
    }

    return messageAndKeys;
}

export const getFileDownloadURL = (fileId: number) => {
    const getDownloadURL = () =>
        window.data_service_map[window.data_service_name] +
        "/file_download/" +
        window.spreadsheetId + "/";
    let downloadURL =
        getDownloadURL() + "inline/" + fileId +
        "?app=" + window.app_name + "&env=" + window.app_env;

    return downloadURL
}

function getGradeOrder(grade: string) {
    const lower = grade.toLowerCase();

    if (lower.includes('kindergarten')) return 0;
    if (lower === 'All Grades') return 0;

    const match = lower.match(/grade (\d+)(?:-(\d+))?/);
    if (match) {
        const start = parseInt(match[1], 10);
        return start;
    }

    return 999; // unknown types
}

export function sortGrades(grades: any) {
    const sortedGrades = grades.sort((a, b) => {
        return getGradeOrder(a.name) - getGradeOrder(b.name);
    });
    return sortedGrades;
}

export const stringToVibrantColor = (text: string, unique: boolean) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Ensure 32-bit integer
    }

    let hue = hash % 360;
    const saturation = 95;

    // Prevent pure black (0% lightness) or pure white (100% lightness)
    // Adjust lightness bu changing the lightness
    let lightness = 45; // Default lightness for general use
    if (unique) {
        hue = (hash * 29) % 360;
        // For unique colors, ensure more variation in lightness
        lightness = 25 + (hash % 50); // Range from 25% to 74%
    }

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export function formatWithComma(count: number | string) {
    if (typeof count === 'number') {
        return count.toLocaleString();
    }
    return Number(count).toLocaleString();
}

export function getDateRange(config: any) {
  const now = new Date();
  let from = new Date(), to = new Date();

  switch (config.type) {
    case "today":
        from = to = now;
        break;
    case "school_year": {
        // Make sure any month should filter proper school_year
        // Because calender year not align with the school year we need to do this
        // eg: if current month is may 2025 => last_school_year should be Aug 2023 -> jun 2024
        //     if we skipped this step it will be always Aug 2024 - jun 2025
        const year = now.getMonth() < config.startMonth
            ? now.getFullYear() - 1
            : now.getFullYear();

        if (config.current) {
            from = new Date(year, config.startMonth, 1);
            to = new Date(year + 1, config.endMonth, 30);
        } else {
            from = new Date(year - 1, config.startMonth, 1);
            to = new Date(year, config.endMonth, 30);
        }
    }
    break;
    case "semester": {
        const month = now.getMonth();
        let year = now.getFullYear();

        if (config.current) {
            if(config.startMonth >= config.endMonth && config.endMonth < month) {
                from = new Date(year, config.startMonth, 1);
                to = new Date(year + 1, config.endMonth, 30);
            } else if (config.startMonth < config.endMonth && config.endMonth < month) {
                from = new Date(year + 1, config.startMonth, 1);
                to = new Date(year + 1, config.endMonth, 30);
            } else {
                from = new Date(year, config.startMonth, 1);
                to = new Date(year, config.endMonth, 30);
            }

        } else {
            if(config.startMonth >= config.endMonth && config.endMonth < month) {
                from = new Date(year - 1, config.startMonth, 1);
                to = new Date(year, config.endMonth, 30);
            } else if (config.startMonth < config.endMonth && config.endMonth < month) {
                from = new Date(year, config.startMonth, 1);
                to = new Date(year, config.endMonth, 30);
            } else {
                from = new Date(year - 1, config.startMonth, 1);
                to = new Date(year - 1, config.endMonth, 30);
            }
        }
    }
    break;

  }

  return { from, to };
}


// Service Workere registration function ----------------------------

export const registerServiceWorker = async () => {
    return await new Promise<void>(async (resolve, reject) => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js')
                console.log('[SW] ServiceWorker registration successful with scope: ', registration.scope);
                await navigator.serviceWorker.ready
                console.log('[SW] ServiceWorker is active');
                const chessboardScript = document.createElement("script");
                chessboardScript.src = "/chessboard.js";
                document.head.appendChild(chessboardScript);
                initServiceWorkerMessageListener();
                resolve()
            } catch (error) {
                console.error(`ServiceWorker registration failed: ${error}`);
                reject(error)
            }
        } else {
            console.warn('Service workers are not supported in this browser');
            resolve();
        }
    })
};

export const initServiceWorkerMessageListener = () => {
    navigator.serviceWorker.addEventListener('message', event => {
        const {type, message, pgnURL, ourURL} = event.data;
        if (type === 'FETCH_ERROR') {
            const urls = `pgnURL: ${pgnURL}, ourURL: ${ourURL}`
            remoteLog(
                "ChessBoard File Not Found",
                new Error(urls)
            )
            // const { supportTeamEmail } = getEmailsBasedOnEnv()
            // sendEmail({
            //     to: supportTeamEmail,
            //     subject: "CCAI: ChessBoard File Not Found",
            //     message: `Here is the missing file urls ${urls}`
            // })
        }
    });
};

export const generateFileName = (pgn: string, gameId: any) => {
    const pgnDetails = null //extractDetailsFromPGNStr(pgn);
    if (!pgnDetails) return "undefined-game";
    const { player1, player2, eventDate } = pgnDetails;
    const date = eventDate.replaceAll(".", "-");
    return `${gameId.toString()}-${player1}_vs_${player2}-${date}.pgn`;
};

export const isDateExpired = (startDateStr: string, daysValid: number): boolean => {
    const startDate = new Date(startDateStr);
    const expiryDate = new Date(startDate);
    expiryDate.setDate(startDate.getDate() + daysValid);
    const now = new Date();
    return now > expiryDate;
};

export const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

export const formatMillisecondsToTime = (milliseconds: number): string => {
    if (milliseconds <= 0) return "00:00:00";

    const seconds = milliseconds / 1000;
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, "0"); // two decimal digits

    return `${minutes}:${secs}:${ms}`;
};

export const displayTimeWithMillisecond = (milliseconds: number): string => {
    if (milliseconds <= 0) return "0:00";

    const seconds = milliseconds / 1000;
    const lastSeconds = milliseconds < 20000;// last 20 seconds
    const minutes = Math.floor((seconds % 3600) / 60);
    const min = minutes.toString().padStart(minutes < 10 ? 1: 2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    const millisecond = Math.floor((seconds % 1) * 10).toString().padStart(1, "0");

    if (lastSeconds) {
        return `${min}:${secs}.${millisecond}`;
    }
    return `${min}:${secs}`;
};

