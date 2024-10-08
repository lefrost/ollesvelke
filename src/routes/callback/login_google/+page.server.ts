import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { jwtDecode } from "jwt-decode";
import * as api from '../../../assets/js/api';
import * as utils from '../../../assets/js/utils';

export const actions: Actions = {
  default: async ({ request, url }) => {
    let new_url = `/login`;

    try {
      await utils.wait(1); // wait for socket in main +layout.svelte
      let user = await api.getCurrentUser();
      
      let redirect_url = (url.searchParams.get(`redirect_url`) || ``).trim() || ``;
  
      if (!(user && user.id)) {
        let form_data = await request.formData();
        var obj = {};
        form_data.forEach((value, key) => obj[key] = value);
  
        let google_user = jwtDecode(obj[`credential`]);
  
        if (google_user && google_user[`email`]) {
          let google_user_email = (google_user[`email`] || ``).trim() || ``;
          let google_user_name = (google_user[`name`] || ``).trim() || ``;
          let google_user_icon_image_url = (google_user[`picture`] || ``).trim() || ``;

          let user_add_res = await api.restPost({
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
            user_add_res &&
            user_add_res.user &&
            user_add_res.user.id &&
            user_add_res.access_token_string
          ) {
            new_url = `/callback/login_access_token?user_id=${user_add_res.user.id}&access_token_string=${user_add_res.access_token_string}${redirect_url ? `&redirect_url=${redirect_url}` : ``}`;
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      throw redirect(302, new_url);
    }
  }
}