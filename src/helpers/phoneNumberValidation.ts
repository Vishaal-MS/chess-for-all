import { phone } from 'phone';
import { getLocalStorage } from "@mahaswami/vc-frontend";

export const validatePhoneNumber = (country) => (value) => {
    if(!country || !value){
      return undefined;
    }
    const result = phone(value, { country : country });
    console.log(country, ' phone number validation ')
    if (result.isValid) {
      return undefined;
    }
  return 'Invalid phone number';
}