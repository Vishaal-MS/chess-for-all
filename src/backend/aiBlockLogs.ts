import { remoteLog } from "@mahaswami/vc-frontend";

export const aiBlockLogCreate = async(name, command, aiResponse, isAiError, userId) => {
   try {
      const dataProvider = window.swanAppFunctions.dataProvider;
      const { data: aiBlockLog } = await dataProvider.create("ai_block_logs", {data: {
         log_timestamp: new Date(),
         name: name,
         user_command: command,
         ai_response: aiResponse.response,
         ai_usage: aiResponse.usage,
         stack_trace: aiResponse.stackTrace,
         is_ai_error: isAiError,
         is_archived: false,
         user_id: userId,
      }});
      return aiBlockLog;
   } catch(error) {
      remoteLog("Error on create AI Block Log: ", error);
      console.error("Error on create AI Block Log: ", error);
   }
}