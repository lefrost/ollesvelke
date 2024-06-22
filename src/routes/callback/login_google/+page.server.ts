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

    let google_user = jwtDecode(obj[`credential`]); // todo: signup/login google_user to user database in api

    await utils.wait(2); // todo: remove temp wait function

    throw redirect(302, '/'); // todo: redirect to new `/account` page
  }
}