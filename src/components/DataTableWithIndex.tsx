import React, { FC, useMemo } from 'react';
import {DataTableProps, useListContext} from 'react-admin';
import {DataTable} from "@mahaswami/vc-frontend";

export const DataTableWithIndex: FC<DataTableProps> = React.forwardRef((props, ref) => {
    const { children, ...rest } = props;
    const { data: rawData } = useListContext();
    const data = useMemo(() => rawData?.map((dt, index) => ({ ...dt, __index__: index + 1 /* make it 1-based */ })) || [], [rawData]);
    return (
        <DataTable {...rest} ref={ref} data={data}>
            {children}
        </DataTable>
    );
});