import { AutocompleteArrayInput, AutocompleteInput, Form, ReferenceArrayInput, 
   ReferenceInput, TextInput, useListContext, 
   useUnselectAll
} from "react-admin";
import { getCurriculumLessons } from "../../backend/curriculum";
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { getLanguagesMap } from "../../utils";
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from "react";
import {getStandardId, isRegularSchoolFlavored} from "../../businessLogic.ts";

//TODO Clean up this code. Default Lesson Filter may not be needed.
export const LessonFilterForm = ({isCurriculumAddLessons, setSelectedCurriculumId, state, isSchoolClass, existLessonIds, mergedLessons, curriculumIds, setListFilter, isDialog}) => {
   const dataProvider = window.swanAppFunctions.dataProvider;
   const [curriculumLessons, setCurriculumLessons] = useState([]);
   const { selectedIds, setFilters } = useListContext();
   const marginBottom = selectedIds.length > 0 ? '1.3rem' : 0;
   const unSelectLessons = useUnselectAll('lessons');
   const isSchool = isSchoolClass;
   const standardId = isSchool ? (isRegularSchoolFlavored() ? getStandardId() :  (state?.standard_id || null)) : null;
   const curriculumFilter = { id: curriculumIds, standard_id: standardId}
   const [defaultFilter, setDefaultFilter] = useState({ id: mergedLessons, "language": "EN" });
   const defaultCurriculumId =  curriculumIds?.length > 0 ?  curriculumIds[0] : null;

   useEffect(() => {
      const fetchCurriculumLessons = async() => {
         const allCurriculumLessons = await getCurriculumLessons(dataProvider);
         setCurriculumLessons(allCurriculumLessons);
         // if is class add lessons, first curriculum is selected by default
         if (!isCurriculumAddLessons && defaultCurriculumId ) {
            const defaultCurriculum = allCurriculumLessons.filter((curriculumLesson) => curriculumLesson.curriculum_id === defaultCurriculumId);
            const lessonIds = defaultCurriculum.map((curriculumLesson) => curriculumLesson.lesson_id);
            const nonExistsIds = lessonIds.filter(lessonId => !existLessonIds.includes(lessonId));
            setListFilter({id: nonExistsIds});
            setSelectedCurriculumId(defaultCurriculumId);
            setDefaultFilter((preValue) => ({...preValue, id: nonExistsIds}));
         }
      }
      unSelectLessons();
      fetchCurriculumLessons();
   }, [])

   const handleSubmit = async(values: any) => {
      const curriculumId = values["curriculum_id"];
      if (curriculumId) {
         if (!isCurriculumAddLessons) {
            setSelectedCurriculumId(curriculumId);
         }
         const selectedCurriculum = curriculumLessons.filter((curriculumLesson) => curriculumLesson.curriculum_id === curriculumId);
         const lessonIds = selectedCurriculum.map((curriculumLesson) => curriculumLesson.lesson_id);
         const nonExistsIds = lessonIds.filter(lessonId => !existLessonIds.includes(lessonId));
         setListFilter({id: nonExistsIds});
         delete values['curriculum_id'];
      } else {
         setListFilter({id: defaultFilter.id});
      }
      setFilters({...values});
   };

   const setDefaultFilters = () => {
      setFilters(defaultFilter);
      setListFilter(defaultFilter)
   };

   return (
      <Form onSubmit={handleSubmit}>
         {isDialog && <Typography variant="h6" sx={{my: 0, pl: '0.5rem'}}>Select Lessons</Typography>}
         <Box sx={{width: isDialog ? '78vw' : '92vw', mb: marginBottom}}>
            <Grid container>
               <Grid item md={isDialog ? 5 : 3} sx={{pr: '0.5rem', mb: '-1.5rem'}}>
                  <TextInput label="Search" source="q" resettable autoComplete="off"
                     InputProps={{ endAdornment: (<SearchIcon color="disabled" />)}} />
               </Grid>

               <Grid item md={isDialog ? 6 : 3} sx={{pr: '0.5rem', mb: '-1.5rem'}}>
                  <ReferenceInput label="Curriculum" source="curriculum_id" reference="curriculum" perPage={1000}
                                  filter={curriculumFilter} queryOptions={{ meta: {scopingEscapeHatch: true} }}>
                     <AutocompleteInput defaultValue={!isCurriculumAddLessons ? defaultCurriculumId : null}
                                        optionText={(record) => `${record.name}`}/>
                  </ReferenceInput>
               </Grid>
               <Grid item md={isDialog ? 5 : 2} sx={{pr: '0.5rem'}}>
                  <AutocompleteInput
                     label="Language"
                     source="language"
                     defaultValue={"EN"}
                     choices={getLanguagesMap()} />
               </Grid>
               <Grid item md={isDialog ? 6 : 3} sx={{pr: '0.5rem'}}>
                  <ReferenceArrayInput source="tag_ids" reference="tags"
                     queryOptions={{meta: {scopingEscapeHatch:true}}} perPage={1000} sort={{ field: 'name', order: 'ASC' }}>
                     <AutocompleteArrayInput label="Tags" />
                  </ReferenceArrayInput>
               </Grid>
               <Grid item md={1} sx={{mt: '1rem'}}>
                  <FilterButtons onClick={setDefaultFilters}/>
               </Grid>
            </Grid>
         </Box>
      </Form>
   );
}

export const FilterButtons = ({onClick}) => {
   const form = useFormContext();

   const handleOnClick = () => {
      form.reset();
      onClick();
   }

   return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
         <IconButton color="primary" type='submit'>
            <FilterAltIcon/>
         </IconButton>
         <IconButton onClick={handleOnClick}>
            <CloseIcon/>
         </IconButton>
      </Box>
   )
}