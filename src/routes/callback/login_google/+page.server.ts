import type { Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { jwtDecode } from "jwt-decode";
import * as api from '../../../assets/js/api';
import * as utils from '../../../assets/js/utils';

export const actions: Actions = {
  default: async ({ request }) => {
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

          let matching_user = await api.restPost({
            url: `get`,
            payload: {
              type: `user`,
              filters: [
                {
                  prop: `connections`,
                  value: {
                    type: `email`,
                    code: google_user_email
                  },
                  condition: `some`,
                  options: []
                }
              ]
            }
          }) || null;
  
          if (matching_user && matching_user.id) {
            api.setCurrentUser(matching_user, true);
          } else {
            let icon_image_file = (
              google_user_icon_image_url ?
                await utils.getFileFromImg(google_user_icon_image_url, `[assign_image_name_in_background]`) :
                null
            ) || null;

            let new_user = await api.restPost({
              url: `load`,
              payload: {
                type: `add_user`,
                obj: {
                  name: utils.shortenString({
                    string: google_user_name,
                    length: 30
                  }) || ``,
                  icon_image_file,
                  timezone: `UTC`,
                  connections: [
                    {
                      type: `email`,
                      code: google_user_email,
                      name: ``
                    }
                  ],
                  stripe_subs: [],
                  settings: {}
                }
              }
            }) || null;
  
            if (new_user && new_user.id) {
              api.setCurrentUser(new_user, true);
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      throw redirect(302, '/settings');
    }
  }
}