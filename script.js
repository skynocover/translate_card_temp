async function translation(sourceText) {
  if (sourceText && sourceText.length > 0 && sourceText.length < 5001) {
    return await translate(sourceText, {
      from: localStorage.getItem('selectedLanguage'),
      to: 'zh',
      cache: 60 * 60 * 24,
    });
  }

  return 'Translation';
}

function modalHandler(val) {
  const modal = document.getElementById('modal');
  if (val) {
    fadeIn(modal);
  } else {
    fadeOut(modal);
  }
}
function fadeOut(el) {
  el.style.opacity = 1;
  (function fade() {
    if ((el.style.opacity -= 0.1) < 0) {
      el.style.display = 'none';
    } else {
      requestAnimationFrame(fade);
    }
  })();
}
function fadeIn(el, display) {
  el.style.opacity = 0;
  el.style.display = display || 'flex';
  (function fade() {
    let val = parseFloat(el.style.opacity);
    if (!((val += 0.2) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
}

const apps = [
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965306.png',
    name: 'Gmail',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965278.png',
    name: 'Search',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965363.png',
    name: 'Youtube',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965283.png',
    name: 'Translate',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965311.png',
    name: 'Photos',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965293.png',
    name: 'Calendar',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965323.png',
    name: 'Drive',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965281.png',
    name: 'Maps',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965274.png',
    name: 'Hangouts',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965358.png',
    name: 'Keep',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965317.png',
    name: 'Adwords',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965327.png',
    name: 'Sheets',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965330.png',
    name: 'Business',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965360.png',
    name: 'Forms',
  },
  {
    icon: 'https://cdn-icons-png.flaticon.com/512/2965/2965297.png',
    name: 'News',
  },
];

function moveSlide() {
  const slider = document.querySelector('#slider');
  const max = slider.scrollWidth - slider.clientWidth;
  const left = slider.clientWidth;

  if (max === slider.scrollLeft) {
    slider.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    slider.scrollBy({ left, behavior: 'smooth' });
  }
}

function makeURL(url) {
  const u = new URL(url);
  if (u.origin === 'https://api.airtable.com') return url;
  const s = u.pathname.split('/');
  return `https://api.airtable.com/v0/${s[1]}/${s[2]}`;
}

// 取得單字卡
function getTranslations() {
  return {
    async getRecord() {
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });

      const url = JSON.parse(localStorage.getItem('airtableSetting')).filter(
        (item) => item.key === params.language,
      )[0].url;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('airtableKey')}` },
      });

      this.chars = data.records
        .filter((item) => !!item.fields.Nonuc)
        .map((item) => {
          return {
            Nonuc: item.fields.Nonuc,
            Translate: item.fields.Translate,
          };
        });
      console.table(this.chars);
    },

    chars: [],
  };
}

function getData() {
  return {
    async appInit() {
      modalHandler(false);
      new ClipboardJS('#copy-translation');

      this.translatedText = await translation(this.sourceText);

      if (localStorage.getItem('airtableKey')) {
        this.airtableKey = localStorage.getItem('airtableKey');
      }
      if (localStorage.getItem('airtableSetting')) {
        this.airtableSettings = JSON.parse(localStorage.getItem('airtableSetting'));
        console.log(this.airtableSettings);
      }
      if (!localStorage.getItem('selectedLanguage')) {
        localStorage.setItem('selectedLanguage', 'en');
      }
    },

    async getSelectedText() {
      const temp = window.getSelection().toString();
      if (temp) {
        this.selectText = temp;
        const msg = new SpeechSynthesisUtterance();
        msg.text = temp;
        msg.lang = localStorage.getItem('selectedLanguage');
        window.speechSynthesis.speak(msg);
        this.translatedText = await translation(temp);
      }
    },
    async upload(files) {
      const {
        data: { text },
      } = await Tesseract.recognize(files[0], 'eng', {
        logger: (m) => console.log(m),
      });
      this.sourceText = text;
      this.translatedText = '';
      this.selectText = '';
    },

    storeAirtable() {
      localStorage.setItem('airtableKey', this.airtableKey);
      const newsetting = this.airtableSettings.map((item) => {
        return {
          key: item.key,
          url: makeURL(item.url),
        };
      });
      localStorage.setItem('airtableSetting', JSON.stringify(newsetting));
      this.airtableSettings = newsetting;

      modalHandler(false);
    },

    async store() {
      const url = this.airtableSettings.filter(
        (item) => item.key === localStorage.getItem('selectedLanguage'),
      )[0].url;

      if (!this.airtableKey || !url) modalHandler(true);

      const { data } = await axios.post(
        url,
        {
          records: [
            {
              fields: {
                Nonuc: this.selectText,
                Translate: this.translatedText,
                Sentence: this.sourceText,
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('airtableKey')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(data);
    },
    selectLanguage(input) {
      localStorage.setItem('selectedLanguage', input);
      location.reload();
    },
    gotoCard() {
      location.href = 'index2.html?language=' + localStorage.getItem('selectedLanguage');
    },

    airtableKey: '',
    airtableSettings: [
      { key: 'en', url: '' },
      { key: 'ja', url: '' },
    ],
    sourceText:
      'ロシアの独立系新聞「ノーバヤ・ガゼータ」は、ウクライナ侵攻を批判していましたが、ロシア当局のメディア規制の強化を受け、3月に活動を一時停止しています',
    translatedText: 'Translation',
    selectText: '',
  };
}
