import {
    Resource, type ResourceActionDefs, type FieldSchema, createReferenceField,
    createReferenceInput, ReferenceLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { Category } from '@mui/icons-material';
import {Menu} from "react-admin";
import {isSuperAdmin} from "../businessLogic.ts";
import {ReviewsList} from "./reviews/Reviews.tsx";

export const RESOURCE = "reviews"
export const ICON = Category
export const PREFETCH: string[] = ["subscribables", "users", "publisher_tenants"]

export const ReviewsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ReviewsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const reviewsActionDefs: ResourceActionDefs = {};

const filters = () => {
    return isSuperAdmin() ? [
        <TextLiveFilter source="search" show/>,
        <ReferenceLiveFilter label="Publisher" source="publisher_tenant_id" reference="tenants" show/>,
        <ReferenceLiveFilter label="User" source="user_id" reference="users" show/>,
    ] : [<TextLiveFilter source="search" show/>];
}

const reviewsFieldSchema: FieldSchema = {
    subscribable_id: { resource: 'subscribables' },
    review_date: {},
    user_id: { resource: 'users' },
    title: {},
    review: {},
    rating: {},
    is_read: {},
    subscriber_tenant_id: {},
    publisher_tenant_id: {}
};
const reviewsSearchableFields: string[] = [
    'title',
    'review',
    'rating'
];

export const ReviewsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ reviewsFieldSchema}
        actionDefs={ reviewsActionDefs}
        searchableFields={ reviewsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ReviewsList/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'title', order: 'ASC' }}
    />
)
export const ReviewsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText={isSuperAdmin() ? 'Reviews & Messages' : 'Reviews'} leftIcon={<ICON />} />
)
