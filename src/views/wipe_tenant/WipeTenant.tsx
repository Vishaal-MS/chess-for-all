import { useEffect, useState } from "react";
import Select from '@mui/material/Select';
import { Box, Card, CardContent, CardHeader, Checkbox, FormControl, FormControlLabel,
   FormGroup, FormHelperText, Grid, InputLabel, MenuItem, Typography } from "@mui/material";
import { Button, Loading, useNotify } from "react-admin";
import { closeDialog, dataProvider, openDialog, remoteLog } from "@mahaswami/vc-frontend";
import { UserRoles } from "../../helpers/constants";

export const WipeTenent = () => {

   const resources = [
      'ai_block_logs',
      'assignment_blocks',
      'assignments',
      'history',
      'timesheets',
      'discussion_read_status',
      'parent_notes',
      'replies',
      'discussion_topics',
      'curriculum_lessons', 
      'curriculum',
      'class_progress',
      'class_schedules',
      'enrollments',
      'lesson_block_mapping',
      'lessons',
      'lesson_blocks',
      'classes',
      'students',
      'coaches',
      'clients',
      'subscriptions', 
      'divisions',
      'certificate_templates',
      'certificates',
      'invoices',
      'levels',
      'payments',
      'reviews',
      'subscribers',
      'support_topic_logs',
      'trophies',
      'settings',
      'session_records',
      'password_auths',
      'users',
      'files'
   ];

   const associations = [
      {id: 'assignments', resourse: ['assignment_blocks', 'assignments']},
      {id: 'classes', resourse: ['class_progress', 'class_schedules', 'enrollments', 'divisions', 'classes']},
      {id: 'clients', resourse: ['students', 'coaches', 'clients']},
      {id: 'curriculum', resourse: ['curriculum_lessons', 'curriculum']},
      {id: 'lesson_blocks', resourse: ['lesson_block_mapping', 'lessons', 'lesson_blocks']},
      {id: 'users', resourse: ['settings', 'session_records', 'password_auths', 'users']}
   ];
   
   const [tenant, setTenant] = useState(null);
   const [tenants, setTenants] = useState([]);
   const [loading, setLoading] = useState(false);
   const [refresh, setRefresh] = useState(false);
   const [showError, setShowError] = useState(false);
   const [selectedResourse, setSelectedResourse] = useState(resources);
   const isAllResourseChecked = selectedResourse.length === resources.length;
   const notify = useNotify();

   useEffect(() => {
      const fetchTenants = async() => {
         const { data: tenants } = await dataProvider.getList('tenants', {
            pagination: { page: 1, perPage: 1000 },
            meta: { scopingEscapeHatch: true },
            sort: { field: 'name', order: 'ASC'}
         });
         const { data: settings } = await dataProvider.getList('settings', {
            filter: { config_name: 'allow_publishing'},
            pagination: { page: 1, perPage: 10000 },
            meta: { scopingEscapeHatch: true }
         })
         const { data: users } = await dataProvider.getList('users', {
            filter: { role: UserRoles.SUPER_ADMIN},
            pagination: { page: 1, perPage: 10000 },
            meta: { scopingEscapeHatch: true }
         });

         //Removing SuperAdmin and Publisher Tenants
         const publisherSettings = settings.filter((setting) => setting.config_value === 'TRUE');
         const publisherTenantIds = publisherSettings.map((setting) => setting.tenant_id); // Publisher Tenant Ids
         const superAdminTenantIds = users.map((user) => user.tenant_id); // SuperAdmin Tenant Ids
         const publisherAndAdminTenantIds = [...publisherTenantIds, ...superAdminTenantIds];
         const dropdownTenants = tenants.filter((tenant) => !publisherAndAdminTenantIds.includes(tenant.id));
         setTenants(dropdownTenants);
      }
      fetchTenants();
   }, [refresh]);

   

   const handleChange = (checkedResourse) => (event) => {
      if (event.target.checked) {
         setSelectedResourse((resources) => {
            let checkedResourses;
            const association = associations.find(association => association.id === checkedResourse);
            if (association) {
               checkedResourses = [...resources, ...association.resourse];
            } else {
               checkedResourses = [...resources, checkedResourse]
            }
            return [...new Set(checkedResourses)];
         });
      } else {
         setSelectedResourse((resource) => resource.filter((resourse) => resourse !== checkedResourse));
      }
   };

   const showConfirmDialog = () => {
      if (tenant) {
         if (selectedResourse.length === 0) {
            notify('Select the resourses', {type: 'error'})
            return;
         }
         openDialog(<ConfirmMessage />)
      } else {
         setShowError(true);
      }
   }

   const ConfirmMessage = () => {

      return (
         <Box>
            <Typography variant="h5">
               Are You Sure To Delete Tenant - <b>{tenant?.name}</b>
            </Typography>
            <Box sx={{ mt: '2rem'}}>
               <Button 
                  label='wipe' 
                  variant="contained" 
                  onClick={handleWipeTenant}
                  sx={{float: 'right'}} />
               <Button 
                  label='Cancel' 
                  variant="contained" 
                  color="error" 
                  onClick={() => closeDialog()}
                  sx={{float: 'right', mr: '0.5rem'}}/>
            </Box>
         </Box>   
      )
   }

   const deleteSectionRecordsAndPasswords = async (userIds) => {
      try {
            const { data: sessionRecords } = await dataProvider.getList('session_records', {
               filter: { user_id: userIds }
            });
            const { data: passwordAuths } = await dataProvider.getList('password_auths', {
               filter: { user_id: userIds }
            });
            const sessionReordIds = sessionRecords.map((sessionRecord) => sessionRecord.id);
            const passwordAuthIds = passwordAuths.map((passwordAuth) => passwordAuth.id);
            await dataProvider.deleteMany('session_records', {ids: sessionReordIds});
            await dataProvider.deleteMany('password_auths', {ids: passwordAuthIds});
      } catch (error) {
         remoteLog("Error sending in WipeTenant deleteSectionRecordsAndPasswords method: ", error);
         console.error("Error sending in WipeTenant deleteSectionRecordsAndPasswords method: ", error)
      }
   }

   function chunkArray(array, size) {
      const result = [];
      for (let index = 0; index < array.length; index += size) {
         result.push(array.slice(index, index + size));
      }
      return result;
   }

   const handleWipeTenant = async() => {
      try {
         setLoading(true);
         closeDialog();
         for (const resource of resources) {
            if (selectedResourse.includes(resource)) {
               const subscriberTenantResourses = ['subscribers', 'reviews'];
               const filter = subscriberTenantResourses.includes(resource) ? 
                  { subscriber_tenant_id: tenant?.id } : { tenant_id: tenant?.id };
               const { data: resourceData } = await dataProvider.getList(resource, {
                  filter: filter,
                  pagination: { page: 1, perPage: 100000 }
               });
               const resourseIds = resourceData.map((item) => item.id);
               if (resourseIds.length > 0) {
                  if (resource === 'users' && isAllResourseChecked) {
                     await deleteSectionRecordsAndPasswords(resourseIds);
                  }
                  const resourceIdChunks = chunkArray(resourseIds, 100);
                  for (const resourceIdChunk of resourceIdChunks) {
                     await Promise.all([dataProvider.deleteMany(resource, { ids: resourceIdChunk })]);
                  }
               }
            }
         }
         if (isAllResourseChecked) {
            await dataProvider.delete('tenants', {id: tenant?.id});
         }
      } catch (error) {
         setLoading(false);
         notify(`Tenant ${tenant?.name} data wipping error`, { type: 'error' });
         remoteLog("Error On Tenant WipeTenant handleWipeTenant: ", error);
         console.error("Error On Tenant WipeTenant handleWipeTenant: ", error);
      } finally {
         setTenant(null);
         setLoading(false);
         setRefresh((preValue) => !preValue);
         notify(`Tenant ${tenant?.name} data wipped successfully`, { type: 'success' });
      }
   }

   return (
      <Card sx={{ mt: '1rem' }}>
         <CardHeader title='Wipe Tenant' />
         <CardContent sx={{ height: 'calc(100vh - 9rem)', overflow: 'auto'}}>
         { loading ? <Loading /> :
            <FormControl error={showError}>
               <InputLabel>Tenant</InputLabel>
               <Select
                  onChange={(event) => {
                     setTenant(event.target.value);
                     setShowError(false);
                  }}>
                  {tenants.map((tenant) => (
                     <MenuItem key={tenant.id} value={tenant}>{tenant.name}</MenuItem>
                  ))}
               </Select>
               {showError && <FormHelperText>Please Select the Tenant</FormHelperText>}
               <FormGroup sx={{ mt: '2rem'}}>
                  <FormControlLabel
                     label={'All Resourses'}
                     sx={{ width: '10rem'}}
                     control={
                        <Checkbox
                           checked={isAllResourseChecked}
                           onChange={() => setSelectedResourse(isAllResourseChecked ? [] : resources)}
                        />
                     }
                  />
                  <Grid container>
                     {resources.map((resource) => (
                        <Grid item sm={12} md={3} key={resource}>
                           <FormControlLabel
                              label={resource.replaceAll('_', ' ')}
                              control={
                                 <Checkbox
                                    checked={selectedResourse.includes(resource)}
                                    onChange={handleChange(resource)}
                                 />
                              }
                           />
                        </Grid>
                     ))}
                  </Grid>
               </FormGroup>
               <Box>
                  <Button
                     label='Wipe Tenant'
                     variant="contained"
                     sx={{ width: '8rem', float: 'right', mt: '0.5rem'}}
                     onClick={showConfirmDialog}/>
               </Box>
            </FormControl>
         }
         </CardContent>
      </Card>
   )
}