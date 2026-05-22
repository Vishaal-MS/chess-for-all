import React, { useMemo, useEffect, useState } from "react";
import { getLocalStorage, remoteLog } from "@mahaswami/vc-frontend";
import {Button, Loading} from "react-admin";
import {Box} from "@mui/material";
import {applyHashToTenant} from "../../backend/users.ts";

export const ApplyHashTenant = () => {
    const [tenantId, setTenantId] = useState(getLocalStorage('tenant_id'));

    const fiveNumberHash = useMemo(() => {
        return Math.floor(10000 + Math.random() * 90000);
    }, []);

    const [state, setState] = React.useState({
        loading: true,
        tenants: undefined
    })

    useEffect(() => {
        fetchTenants();
    },[state.loading])

    const fetchTenants = async () => {
        try {
            const dataProvider = window.swanAppFunctions.dataProvider;
            const { data: tenants } = await dataProvider.getList("tenants");
            setState({ loading: false, tenants: tenants });
        } catch (error) {
            console.error("Failed to fetch Tenants: ", error)
            remoteLog("Error on ApplyHashTenant fetchTenants method: ", error);
        }
    }

    const { loading, tenants } = state;
    if (loading) {
        return (
            <Loading/>
        )
    }

    return (
        <Box sx={{mt:2}}>
            <select value={tenantId} onChange={(e) => setTenantId(parseInt(e.target.value))}>
                {tenants?.map((tenant: any) => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
            </select>
            <Button sx={{ml: 3}}
                    label={"Confirm"}
                    onClick={() => {
                        const selectedTenant = tenants?.find((tenant: any) => tenant.id === tenantId);
                        const tenantName = selectedTenant?.name.replace(/\d{1,2}:\d{2} [ap]m$/, '');
                        applyHashToTenant(fiveNumberHash.toString(), tenantId, tenantName);
                        setState({loading: true, tenants: undefined});
                        alert("The tenant was hashed.")
                    }}
            />
        </Box>
    );
};
