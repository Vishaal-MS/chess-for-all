import { RESOURCE } from "../views/reviews"
import {filterByDivisionId} from "../backend/common_logics.ts";
import {createOrUpdatePublisherRating, sendReviewAddedEmail, updateAvgRating} from "../backend/reviews.ts";

export const ReviewsLogic: any = {
    resource: RESOURCE,
    afterCreate: [sendReviewAddedEmail, updateAvgRating, createOrUpdatePublisherRating],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [filterByDivisionId],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}