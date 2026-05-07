import React, { FC, useMemo } from 'react';
import { DatagridProps, useListContext, Datagrid } from 'react-admin';
export const DataGridWithIndex: FC<DatagridProps> = React.forwardRef((props, ref) => {
    const { children, ...rest } = props;
    const { data: rawData } = useListContext();
    const data = useMemo(() => rawData?.map((dt, index) => ({ ...dt, __index__: index + 1 /* make it 1-based */ })) || [], [rawData]);
    return (
        <Datagrid {...rest} ref={ref} data={data}>
            {children}
        </Datagrid>
    );
});