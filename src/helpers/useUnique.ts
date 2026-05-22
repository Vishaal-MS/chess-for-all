import {useCallback} from 'react';
import merge from 'lodash/merge';
import {InputProps, isEmpty, useRecordContext, useResourceContext, useTranslate, useTranslateLabel,} from 'ra-core';
import {currentTenantId} from "../backend/common_logics.ts";
import {dataProvider} from "@mahaswami/vc-frontend";


/**
 * A hook that returns a validation function checking for a record field uniqueness
 * by calling the dataProvider getList function with a filter.
 *
 * @example // Passing options at declaration time
 * const UserCreateForm = () => {
 *     const unique = useUnique({ message: 'Username is already used'});
 *     return (
 *         <SimpleForm>
 *             <TextInput source="username" validate={unique()} />
 *         </SimpleForm>
 *     );
 * }
 *
 * @example // Passing options at call time
 * const UserCreateForm = () => {
 *     const unique = useUnique();
 *     return (
 *         <SimpleForm>
 *             <TextInput source="username" validate={unique({ message: 'Username is already used'})} />
 *         </SimpleForm>
 *     );
 * }
 *
 * @example // With additional filters
 * const UserCreateForm = () => {
 *     const unique = useUnique();
 *     return (
 *         <SimpleForm>
 *             <ReferenceInput source="organization_id" reference="organizations" />
 *             <FormDataConsumer>
 *                 {({ formData }) => (
 *                     <TextInput
 *                         source="username"
 *                         validate={unique({ filter: { organization_id: formData.organization_id })}
 *                     />
 *                 )}
 *             </FormDataConsumer>
 *         </SimpleForm>
 *     );
 * }
 */
const overrideObjects = (source) => {
    const mapping = { parent_email: "email", parent_name: "fullName" };
    return mapping[source] !== undefined ? mapping[source] : source;
};

export const useUnique = (options?: UseUniqueOptions) => {
    const translateLabel = useTranslateLabel();
    const resource = useResourceContext(options);
    if (!resource) {
        throw new Error('useUnique: missing resource prop or context');
    }
    const translate = useTranslate();
    const record = useRecordContext();
    return useCallback(
        (callTimeOptions?: UseUniqueOptions) => {
            const {
                message,
            } = merge<UseUniqueOptions, any, any>(
                {
                    debounce: DEFAULT_DEBOUNCE,
                    filter: {},
                    message: 'ra.validation.unique',
                },
                options,
                callTimeOptions
            );
            return async (value: any, allValues: any, props: InputProps,) => {
                if (isEmpty(value)) {
                    return undefined;
                }
                const formattedValue = value?.trim().toLowerCase().replace(/\s+/g, "")
                try {
                    // By default, the server fetches only 500 records.
                    // This code, filtered by the current tenant ID
                    const {data} = await dataProvider.getList(resource, {
                        filter: {tenant_id: currentTenantId()},
                    });
                    const isDuplicate = data.find(
                        item =>
                            item[props.source]?.trim().toLowerCase().replace(/\s+/g, "") === formattedValue &&
                            item.id !== allValues.id
                    );
                    if (isDuplicate) {
                        return {
                            message,
                            args: {
                                source: props.source,
                                formattedValue,
                                field: translateLabel({
                                    label: props.label,
                                    source: props.source,
                                    resource,
                                }),
                            },
                        };
                    }
                } catch (error) {
                    return translate('ra.notification.http_error');
                }

                return undefined;
            };
        },
        [dataProvider, options, record, resource, translate, translateLabel]
    );
};

const DEFAULT_DEBOUNCE = 1000;

export type UseUniqueOptions = {
    debounce?: number;
    resource?: string;
    message?: string;
    filter?: Record<string, any>;
};

export const useReferenceUnique = (options: { reference: string } | {source: string }) => {
    const translateLabel = useTranslateLabel();
    const resource = useResourceContext({resource: options.reference});
    if (!resource) {
        throw new Error('useUnique: missing resource prop or context');
    }
    const translate = useTranslate();
    const record = useRecordContext();

    return useCallback(
        () => {
            const {
                message,
            } = merge(
                {
                    debounce: DEFAULT_DEBOUNCE,
                    filter: {},
                    message: 'ra.validation.unique',
                },
                options,
            );


            return async (value: any, allValues: any, props: InputProps) => {
                if (isEmpty(value)) {
                    return undefined;
                }
                const source = overrideObjects(props.source);
                const formattedValue = value?.trim().toLowerCase().replace(/\s+/g, "")
                try {
                    // By default, the server fetches only 500 records.
                    // This code, filtered by the current tenant ID
                    const {data} = await dataProvider.getList(resource, {
                        filter: {tenant_id: currentTenantId()},
                    });

                    const getValueFromPath = (obj, path) => {
                        return path?.split('.').reduce((acc, key) => acc?.[key], obj);
                    }

                    const isDuplicate = data.find(
                        item =>
                            item[source]?.trim().toLowerCase().replace(/\s+/g, "") === formattedValue &&
                            item.id !== getValueFromPath(allValues, options.source)
                    );
                    if (isDuplicate) {
                        return {
                            message,
                            args: {
                                source: source,
                                formattedValue,
                                field: translateLabel({
                                    label: props.label,
                                    source: source,
                                    resource,
                                }),
                            },
                        };
                    }
                } catch (error) {
                    return translate('ra.notification.http_error');
                }

                return undefined;
            };
        },
        [dataProvider, options, record, resource, translate, translateLabel]
    );
};