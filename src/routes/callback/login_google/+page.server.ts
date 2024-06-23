import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { jwtDecode } from "jwt-decode";
import * as api from '../../../assets/js/api';
import * as utils from '../../../assets/js/utils';

export const actions: Actions = {
  default: async ({ request }) => {
    let form_data = await request.formData();
    var obj = {};
    form_data.forEach((value, key) => obj[key] = value);

    let google_user = jwtDecode(obj[`credential`]); // tba: signup/login google_user to user database in api --- call `adhoc->addUser()`, in which backend functions can be executed, such as uploading user's icon image to google cloud, retrieving the resulting image url, and setting that image url in mongo

    await utils.wait(2); // tba: remove temp wait function

    throw redirect(302, '/'); // tba: redirect to new `/account` page
  }
}