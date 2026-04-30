import React from "react";
import { TableHead, TableRow, TableCell } from "@mui/material";
import { DatagridHeaderProps, FieldProps } from "react-admin";

export const EmptyDatagridHeader = ({children, isIndexCol = true}: DatagridHeaderProps & { isIndexCol?: boolean}) => (
    <TableHead>
        <TableRow>
            {isIndexCol ? <TableCell></TableCell> : null}
            {/* empty cell to account for the select row checkbox in the body */}
            {React.Children.map(children, (child) =>
                React.isValidElement<FieldProps>(child) ? (
                    <TableCell></TableCell>
                ) : null
            )}
        </TableRow>
    </TableHead>
);