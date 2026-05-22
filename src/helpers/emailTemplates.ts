import {UserRoles} from "./constants.ts";
import {getTenantName, isCoach, isExecutiveCoachingFlavored, isProCoachByTenantId, getUserFullName} from "../backend/common_logics.ts";
import {getLocalStorage} from "@mahaswami/vc-frontend";

export const getCoachEmailTemplate = async (user) => {
    const isProCoach = await isProCoachByTenantId(user.tenant_id);
    const tenantRole = isProCoach ? UserRoles.PRO_COACH : UserRoles.ORG_COACH;
    const link = getDomainBasedOnRole(tenantRole);
    const subject = `${getTenantName()} - Welcome to Coach Chess AI!`;
    const message = `<p>Dear Coach,</p>
        <p>Your account has been successfully created.<p>
        <p>Here is how you can get started</p>
        <p>Please visit our website and click on Forgot Password to set your password using User Email as : ${user.email}</p>
        <p>To get started, please log in to your account using the link below:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Thank you for joining us.</p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>
        `
    return { subject: subject, message: message}
}

export const getParentEmailTemplate = (user: any) => {
    const userEmail = user.email;
    const link = getDomainBasedOnRole(UserRoles.PARENT);
    const subject = `${getTenantName()} - Welcome to Coach Chess AI!`;
    const message = `<p>Dear Parent,</p>
        <p>On behalf of your child we have created an account for you. You can track progress of your child assignments.</p>
        <p>Here is how you can get started</p>
        <p>Please visit our website and click on Forgot Password to set your password using User Email as : ${userEmail}</p>
        <p>To get started, please log in to your account using the link below:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Thank you for joining us.</p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>
        `
    return {subject: subject, message:message}
}

export const getStudentEmailTemplateWithCredential = (user: any, className?: string) => {
    const link = getDomainBasedOnRole(UserRoles.STUDENT);
    const subject = `${getTenantName()} - Welcome to ${className}`;
    const message = `<p>Dear Student,</p>
        <p>Welcome to Coach Chess AI! We’re excited to have you on board and look forward to supporting your learning journey.<p>
        <p>You have enrollled for the class ${className}.</p>
        <p>Here is how you can get started</p>
        <p>Please visit our website and click on Forgot Password to set your password using User Email as : ${user.email}</p>
        <p>To get started, please log in to your account using the link below:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Thank you for joining us.</p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>`
    return {subject: subject, message:message}
}

export const getStudentEmailTemplateWithoutCredential = (user: any, className?: string) => {
    const link = getDomainBasedOnRole(UserRoles.STUDENT);
    const subject = `${getTenantName()} - Welcome to ${className}`;
    const message = `<p>Dear Student,</p>
        <p>Welcome to Coach Chess AI! We’re excited to have you on board and look forward to supporting your learning journey.<p>
        <p>You have enrollled for the class ${className}.</p>
        <p>To get started, please log in to your account using the link below:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Thank you for joining us.</p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>`
    return { subject: subject, message: message}
}


export const getParentNoteEmailTemplate = (parentName) => {
    const subject = 'Parent Note Added';
    const message = `Dear ${parentName},<br/>
             <p>A new note has been added for your child. Please check the Parent Notes section in the website for details.</p>
             <p>Best,</p>
             <p>${getTenantName()}</p>
             <p>Powered By Coach Chess AI Platform</p>`;
    return {subject: subject, message: message}
}

export const getStudentAssignmentEmailTemplate = (className, studentName, assignmentUrl) => {
    const subject  = `${className}: You have a new assignment`;
    const link = `${getDomainBasedOnRole(UserRoles.STUDENT)}${assignmentUrl}`;
    const message = `Dear ${studentName},
                     <p>You have a new assignment.</p>
                     <a href="${link}">${link}</a>
                     <p>Best,</p>
                     <p>${getTenantName()}</p>
                     <p>Powered By Coach Chess AI Platform</p>`
   return {subject: subject, message: message}
}
export const getDiscussionTopicEmailTemplate = (topic, classData) => {
    const creatorName = JSON.parse(getLocalStorage("user"))?.fullName || "Someone";
    const subject = `${classData.name} - New Discussion Topic Posted`;
    const clientName = isExecutiveCoachingFlavored() ? "Executive" : "Student";
    const message = `
            <p>${isCoach() ? "Coach" : clientName} ${creatorName} added a new Discussion Topic "${topic.topic}" in the "${classData.name}" class.</p>
            <p>Best,</p>
            <p>${getTenantName()}</p>
            <p>Powered By Coach Chess AI Platform</p>`
    return { subject: subject, message: message }
}

export const getDiscussionReplyEmailTemplate = (className, reply, topic) => {
    const creatorName = JSON.parse(getLocalStorage("user"))?.fullName || "Someone";
    const subject = `${className} - New Reply Posted`;
    const clientName = isExecutiveCoachingFlavored() ? "Executive" : "Student";
    const message = `
            <p>${isCoach() ? "Coach" : clientName} ${creatorName} posted a reply "${reply.reply}" in the discussion topic "${topic.topic}".</p>
            <p>Best,</p>
            <p>${getTenantName()}</p>
            <p>Powered By Coach Chess AI Platform</p>`
    return { subject: subject, message: message }
}

export const getGameDiscussionTopicTemplate = (topic, className, gameName) => {
    const creatorName = JSON.parse(getLocalStorage("user"))?.fullName || "Someone";
    const subject = `${className} - ${gameName} - New Discussion Topic Posted`;
    const clientName = isExecutiveCoachingFlavored() ? "Executive" : "Student";
    const message = `
        <p>${isCoach() ? "Coach" : clientName} ${creatorName} added a new Discussion Topic "${topic.topic}" in the game "${gameName}" in the class of "${className}".</p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>
    `;
    return { subject, message };
};

export const getGameDiscussionReplyEmailTemplate = (gameName, reply, topic) => {
    const creatorName = JSON.parse(getLocalStorage("user"))?.fullName || "Someone";
    const subject = `${gameName} - New Reply Posted`;
    const clientName = isExecutiveCoachingFlavored() ? "Executive" : "Student";
    const message = `
        <p>${isCoach() ? "Coach" : clientName} ${creatorName} posted a reply "${reply.reply}" in the discussion topic "${topic.topic}" for the game "${gameName}".</p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>
    `;
    return { subject, message };
};


export const getAiBlockFeedbackEmailTemplate = (blockDetails, feedback) => {
    const subject = "AI Block Feedback";
    const message = `
        <p>Dear Admin,</p>
        <p>I would like to share feedback regarding a block AI-generated response.</p>
        <p><b>Input Command:</b></p>
        <p>${blockDetails.user_command}</p>
        <p><b>AI Response:</b></p>
        <p>${blockDetails.ai_response}</p>
        <p><b>Feedback:</b></p>
        <p>${feedback}</p>
        <p>Thank you</p>
    `;
    return { subject: subject, message: message }
}

export const getGameInvitationEmailTemplate = (fromStudent: any, toStudent: any, playUrl: string, className: string, timeControl: string) => {
    const subject = "Game Invitation";
    const invitationLink = getDomainBasedOnRole(UserRoles.STUDENT) + playUrl;
    const message = `
        <p>Dear ${toStudent.user.fullName},</p>
        <p>You have been invited to play a game by ${fromStudent.user.fullName} for <b>${timeControl}</b>. In ${className} Class.</p>
        <p>To join the game, please click the link below:</p>
        <p><a href="${invitationLink}">Join Game</a></p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>
    `;
    return { subject: subject, message: message }
}

export const getGamePlayInvitationEmailTemplate = (coachName: string, player1: any, player2: any, playUrl: string, className: string, timeControl: string) => {

  const invitationLink = getDomainBasedOnRole(UserRoles.STUDENT) + playUrl;
  const subject = "Game Invitation";
    const message = `
        <p>Dear ${player1.user.fullName},</p>
        <p>Your coach ${coachName} has invited you to play a game against ${player2.user.fullName} for <b>${timeControl}</b>. In ${className} Class.</p>
        <p>To join the game, please click the link below:</p>
        <p><a href="${invitationLink}">Join Game</a></p>
        <p>Best,</p>
        <p>${getTenantName()}</p>
        <p>Powered By Coach Chess AI Platform</p>
    `;
  return { subject: subject, message: message };
};

export const getFeedbackRequestTemplate = (coachName: string, className: string, gameName: string, move: number) => {
    const creatorName = getUserFullName();
    const tenantName = getTenantName();
    const subject = `Move Feedback Requested by ${creatorName}`;

    const message = `
        <p>Dear ${coachName},</p>
        
        <p>${creatorName} has requested your feedback on <strong>move ${move}</strong> in the game <strong>${gameName}</strong> from the <strong>${className}</strong> class.</p>

        <p>Please review the move and give your feedback.</p>

        <p>Best regards,</p>
        <p>${tenantName}</p>
        <p><small>Powered by Coach Chess AI Platform</small></p>
    `;

    return {subject, message};
};


export const getFeedbackCompletedTemplate = (studentName: string, className: string, gameName: string, moveNumber: number) => {
    const coachName = getUserFullName();
    const tenantName = getTenantName();

    const subject = `Your Feedback for "${gameName}" (Move ${moveNumber}) in ${className} is Ready`;

    const message = `
        <p>Dear ${studentName},</p>

        <p>Your coach <strong>${coachName}</strong> has reviewed your game <strong>${gameName}</strong> 
        from the class <strong>${className}</strong> and given feedback on <strong>move ${moveNumber}</strong>.</p>
        
        <p>Please check the platform to view the detailed feedback.</p>

        <p>Best regards,</p>
        <p>${tenantName}</p>
        <p><small>Powered by Coach Chess AI Platform</small></p>
    `;

    return { subject, message };
};

export const getDomainBasedOnRole = (role: string) => {
    const environment = window.app_env;
    const environmentValues = {...window.appConfigOptions.environments[environment]}
    const domains = environmentValues['domains'];

    if (environment === 'dev') return domains[0];

    let roleDomain = null;
     if (role === UserRoles.ORG_ADMIN || role === UserRoles.ORG_COACH) {
        roleDomain = 'academy.';
    } else if (role === UserRoles.PRO_COACH) {
        roleDomain = 'coach.';
    } else if (role === UserRoles.STUDENT) {
        roleDomain = 'student.';
    } else if (role === UserRoles.PARENT) {
        roleDomain = 'parent.';
    } else {
        return roleDomain;
    }
    const domain = domains.filter((domain) => domain.includes(roleDomain));
    return domain[0];
}

export const getReviewEmailTemplate = (review: any, curriculumName: any) => {
    const starsHtml = Array(5)
        .fill(0)
        .map((_, i) => (i < review.rating ? '★' : '☆'))
        .join('');
    return {
        subject: `${curriculumName}: New Review Added`,
        message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <p>A new review has been Added.</p>

                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 0 0 10px 0;">
                        <strong>Title:</strong> ${review.title}
                    </p>

                    <p style="margin: 0 0 10px 0;">
                        <strong>Rating:</strong>
                        <span style="color: #FFD700; font-size: 18px;">${starsHtml}</span>
                        (${review?.rating ? review?.rating : 0} out of 5)
                    </p>

                    <p style="margin: 0;"><strong>Review:</strong></p>
                    <p style="margin: 10px 0 0 0; padding: 10px; background-color: white; border-radius: 3px;">
                        ${review.review ? review.review : "No review"}
                    </p>
                </div>

                <p>Best,</p>
                <p>${getTenantName()}</p>
                <p>Powered by Coach Chess AI Platform</p>
            </div> `
    };
}

export const getMessageEmailTemplate = (message: any, curriculumName: any) => {
    return {
        subject: `${curriculumName}: New Message Added`,
        message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <p>A new message has been Added.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0 0 10px 0;">
                    <strong>Title:</strong> ${message.title}
                </p>

                <p style="margin: 0;"><strong>Message:</strong></p>
                <p style="margin: 10px 0 0 0; padding: 10px; background-color: white; border-radius: 3px;">
                    ${message?.review ? message?.review : "No message"}
                </p>
            </div>

            <p>Best,</p>
            <p>${getTenantName()}</p>
            <p>Powered by Coach Chess AI Platform</p>
        </div> `
    }
}
