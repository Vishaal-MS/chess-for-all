import {TenantConfigNames, UserRoles} from "../helpers/constants";
import {getMessageEmailTemplate, getReviewEmailTemplate} from "../helpers/emailTemplates.ts";
import {sendEmail} from "./common_logics.ts";
import {dataProvider, remoteLog} from "@mahaswami/vc-frontend";

export const sendReviewAddedEmail = async (response: any, dataProvider: any) => {
    try {
        const review = response?.data;
        const [superAdminResults, subscribableResults] = await Promise.all([
            dataProvider.getList("users", {
                filter: {role: UserRoles.SUPER_ADMIN},
                meta: {scopingEscapeHatch: true},
                pagination: {page: 1, perPage: 1000}
            }),
            dataProvider.getOne("subscribables", {id: review?.subscribable_id, meta: {prefetch: ['curriculum']}})
        ])
        const superAdmins = superAdminResults.data;
        const subscribable = subscribableResults.data;
        const {data: users} = await dataProvider.getList("users", {
            filter: {tenant_id: subscribable.publisher_tenant_id},
            meta: {scopingEscapeHatch: true},
        })

        const getEmails = async (users, dataProvider, subscribable) => {
            const emails: string[] = [];

            for (const user of users) {
                if (user.role === UserRoles.PRO_COACH || user.role === UserRoles.ORG_ADMIN) {
                    emails.push(user.email);

                } else if (user.role === UserRoles.DIVISION_ADMIN) {
                    const { data: coaches } = await dataProvider.getList("coaches", {
                        filter: { user_id: user?.id },
                        meta: { scopingEscapeHatch: true }
                    });

                    const coachEmails = coaches
                        .filter(coach => coach?.division_id === subscribable?.curriculum?.division_id)
                        .map(coach => users.find(u => u.id === coach.user_id)?.email)
                        .filter(Boolean);

                    emails.push(...coachEmails);
                }
            }

            return emails;
        };
        const emails = await getEmails(users, dataProvider, subscribable);

        const superAdminEmails = superAdmins.map((user) => user.email);
        let reviewOrMessageTemplate;

        if (review?.type === 'review')
            reviewOrMessageTemplate = getReviewEmailTemplate(review, subscribable?.curriculum?.name);
        else
            reviewOrMessageTemplate = getMessageEmailTemplate(review, subscribable?.curriculum?.name);

        if (emails.length > 0) {
            await sendEmail({
                to: emails,
                bcc: superAdminEmails,
                ...reviewOrMessageTemplate
            })
        }
    } catch (error) {
        console.error("Error sending email: ", error);
        remoteLog("Error review sending email:", error)
    } finally {
        return response;
    }
}

export const updateAvgRating = async (params) => {
    const subscribableId = params?.data?.subscribable_id;
    const isReview = params?.data?.type === 'review';

    if (isReview) {
        const {data: subscribableReviews} = await dataProvider.getList('reviews', {
            filter: {subscribable_id: subscribableId, type: 'review'},
            sort: {field: 'id', order: 'ASC'},
            pagination: {page: 1, perPage: 10000}
        });

        const ratings: number[] = subscribableReviews.filter(subscribableReview => subscribableReview.rating)
            .map(subscribableReview => subscribableReview.rating);
        const numberOfRatings: number = ratings.length;

        const avgSubscribableRating: number = numberOfRatings === 1 ? Number(ratings) : ratings
            .reduce((sum, rating) => sum + Number(rating), 0) / numberOfRatings;

        await dataProvider.update("subscribables", {
            id: subscribableId,
            data: {rating: avgSubscribableRating}
        });
    }

    return params;
}

export const createOrUpdatePublisherRating = async (params) => {
    const publisherTenantId = params?.data?.publisher_tenant_id;

    const {data: reviews} = await dataProvider.getList("reviews", {
        filter: {publisher_tenant_id: publisherTenantId, type: 'review'},
        pagination: {page: 1, perPage: 1000},
    });
    const curriculumRating = reviews.filter(review => review.rating).map(review => review.rating);
    const avgPublisherRating = curriculumRating.reduce((sum, rating) => sum + Number(rating), 0) / curriculumRating?.length;

    const {data: tenantSettings} = await dataProvider.getList('settings', {
        filter: { tenant_id: publisherTenantId, config_name: TenantConfigNames.PUBLISHER_RATING},
    });
    if (tenantSettings?.length === 1) {
        await dataProvider.update("settings", {
            id: tenantSettings[0]?.id,
            data : {
                config_value: avgPublisherRating
            }
        })
    } else {
        await dataProvider.create("settings", {
            data: {
                tenant_id: publisherTenantId,
                config_name: TenantConfigNames.PUBLISHER_RATING,
                config_value: avgPublisherRating
            }
        })
    }
    return params;
}