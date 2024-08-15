import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { jwtDecode } from "jwt-decode";
import * as api from '../../../assets/js/api';
import * as utils from '../../../assets/js/utils';

export const actions: Actions = {
  default: async ({ request }) => {
    let url = `/login`;

    try {
      await utils.wait(1); // wait for socket in main +layout.svelte
      let user = await api.getCurrentUser();
  
      if (!(user && user.id)) {
        let form_data = await request.formData();
        var obj = {};
        form_data.forEach((value, key) => obj[key] = value);
  
        let google_user = jwtDecode(obj[`credential`]);
  
        if (google_user && google_user[`email`]) {
          let google_user_email = (google_user[`email`] || ``).trim() || ``;
          let google_user_name = (google_user[`name`] || ``).trim() || ``;
          let google_user_icon_image_url = (google_user[`picture`] || ``).trim() || ``;

          let new_or_matching_user = await api.restPost({
            url: `load`,
            payload: {
              type: `user_add`,
              obj: {
                name: utils.shortenString({
                  string: google_user_name,
                  length: 30
                }) || ``,
                icon_image_obj: {
                  value: google_user_icon_image_url || ``,
                  format: `url`
                },
                timezone: `UTC`,
                connections: [
                  {
                    type: `email`,
                    code: google_user_email,
                    name: google_user_name
                  }
                ],
                stripe_subs: [],
                honoraries: [],
                settings: {}
              }
            }
          }) || null;
  
          if (
            new_or_matching_user &&
            new_or_matching_user.id &&
            new_or_matching_user.access_token_string
          ) {
            url = `/callback/login_access_token?user_id=${new_or_matching_user.id}&access_token_string=${new_or_matching_user.access_token_string}`;
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      throw redirect(302, url);
    }
  }
}