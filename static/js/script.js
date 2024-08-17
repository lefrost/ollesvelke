(() => {
  // exports

  let sample_text = document.currentScript.getAttribute(`data-sample-text`) || `Sample text`;

  // consts

  const X_API_KEY = `component`;
  const FALLBACK_USER_IMAGE = `https://your-website.name/images/fallback/user_image.png`;
  // --- prod
  // export const API_ENDPOINT = `https://your-api.herokuapp.com/`;
  // export const URL = `https://your-website.name`;
  // --- dev
  const API_ENDPOINT = `http://localhost:3001/`;
  const URL = `http://localhost:3000`;

  // vars

  let data;
  let jobs = [`get_data`]; // note: has to be declared in vars section rather than jobs section since otherwise js will throw an error "cannot access jobs before initialisation"

  // dynamics
  // none

  // mount

  async function mount() {
    await getData();

    if (data) {
      inject();
    }
  }

  mount();

  // jobs

	async function getData() {
		try {
			jobs.push(`get_data`);
			jobs = jobs;

			data = await restPost({
				url: `load`,
				payload: {
					type: `component_sample`, // note: returns `{text}` as defined in ollesocket->adhoc
					obj: {
						sample_var: sample_text || ``
					}
				}
			}) || null;

			if (data) {
				// todo: data
			}

			jobs = jobs.filter(j => j !== `get_data`);
		} catch (e) {
			console.log(e);
		}
	}

  // execs
  // none

  // funcs

  function inject() {
    try {
      // inject fonts
  
      const link = document.createElement("link");
        link.href =
          "https://fonts.googleapis.com/css2?family=Montserrat:wght@400..900&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
  
      // inject css
  
      const css = `
        .component {
          position: fixed;
          top: unset;
          bottom: 2em;
          left: 2em;
          right: unset;
          background-color: white;
          color: black;
          padding: 0.4em 0.6em;
          font-size: 12px;
          display: flex;
          flex-direction: row;
          align-items: center;
          transition-duration: 0.2s;
        }
  
        @media (min-width: 640px) {
          .component {
            font-size: 15px;
          }
        }

        .component:hover {
          transform: scale(1.04);
        }
  
        .component * {
          font-family: 'Montserrat';
        }
  
        .component > img {
          width: 1.1em;
          height: 1.1em;
          margin-right: 0.4em;
        }
  
        .test > div {
          font-size: 1em;
        }
      `;
  
      const styles = document.createElement(`style`);
      styles.innerHTML = css;
      document.head.appendChild(styles);
  
      // inject html

      const html = `
        <img src="https://raw.githubusercontent.com/lefrost/ollesvege/main/src/lib/assets/images/sample.png" alt="" />
        <div>${(data || {}).text || ``}</div>
      `;
  
      let component = document.createElement("div");
      component.classList.add(`component`);
      component.innerHTML = html;
      
      component.addEventListener(`click`, () => {
        try {
          console.log(`script.js - todo: example of event listener, remove when unneeded`);
        } catch (e) {
          console.log(e);
        }
      });
  
      document.body.appendChild(component);
    } catch (e) {
      console.log(e);
    }
  }

  async function restPost(d) {
    // note: borrowed from /assets/js/api
    try {
      if (!d.skip_intiation_check) {
        let initiated = (
          await bePost({
            url: `init`,
            payload: {}
          })
        ).cache;
    
        if (!initiated) {
          // location.reload(); // note: don't reload client website
          return;
        }
      }
    
      return await bePost(d);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async function bePost(d) {
    // note: borrowed from /assets/js/api
    try {
      let config = {
        method: `POST`,
        headers: {
          'origin': URL,
          Accept: `application/json`,
          'Content-Type': `application/json`,
          'x_api_key': X_API_KEY
        }
      };
  
      config.body = JSON.stringify({
        ...(d.payload || {}),
      });
  
      let res = JSON.parse(await (await fetch(`${API_ENDPOINT}${d.url}`, config)).text());
  
      return d.all ? res : res.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  function clone(obj) {
    try {
      return obj ? JSON.parse(JSON.stringify(obj)) : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
})();