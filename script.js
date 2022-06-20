function appInit() {
  new ClipboardJS("#copy-translation");

  // if (!localStorage.getItem("airtableKey")) {
  //   swal("Input your airtable apikey", {
  //     content: "input",
  //   }).then((value) => {
  //     localStorage.setItem("airtableKey", value);
  //     swal("Input your airtable url", {
  //       content: "input",
  //     }).then((value) => {
  //       // localStorage.setItem("airtableKey", value);
  //       console.log(value);
  //     });
  //   });
  // }
}

async function translation(sourceText) {
  if (sourceText) {
    if (sourceText.length > 0 && sourceText.length < 5001) {
      return await translate(sourceText, {
        from: "en",
        to: "zh",
        cache: 60 * 60 * 24,
      });
    }
  }

  return "Translation";
}

const apps = [
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965306.png",
    name: "Gmail",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965278.png",
    name: "Search",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965363.png",
    name: "Youtube",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965283.png",
    name: "Translate",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965311.png",
    name: "Photos",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965293.png",
    name: "Calendar",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965323.png",
    name: "Drive",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965281.png",
    name: "Maps",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965274.png",
    name: "Hangouts",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965358.png",
    name: "Keep",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965317.png",
    name: "Adwords",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965327.png",
    name: "Sheets",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965330.png",
    name: "Business",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965360.png",
    name: "Forms",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2965/2965297.png",
    name: "News",
  },
];

function moveSlide() {
  const slider = document.querySelector("#slider");
  const max = slider.scrollWidth - slider.clientWidth;
  const left = slider.clientWidth;

  if (max === slider.scrollLeft) {
    slider.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    slider.scrollBy({ left, behavior: "smooth" });
  }
}

function getTranslations() {
  return {
    getRecord() {
      axios
        .get(
          "https://api.airtable.com/v0/appUvZoRwZf6ZHGAj/Table?view=Grid%20view",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("airtableKey")}`,
            },
          }
        )
        .then(({ data }) => {
          console.log(data);
          this.chars = data.records
            .filter((item) => !!item.fields.Nonuc)
            .map((item) => {
              return {
                Nonuc: item.fields.Nonuc,
                Translate: item.fields.Translate,
              };
            });
          console.table(this.chars);
        });
    },

    chars: [],
  };
}

function getData() {
  return {
    async getSelectedText() {
      const temp = window.getSelection().toString();
      if (temp) {
        this.selectText = temp;
        const msg = new SpeechSynthesisUtterance();
        msg.text = temp;
        window.speechSynthesis.speak(msg);
        this.translatedText = await translation(temp);
      }
    },
    async upload(files) {
      const {
        data: { text },
      } = await Tesseract.recognize(files[0], "eng", {
        logger: (m) => console.log(m),
      });
      this.sourceText = text;
      this.translatedText = "";
      this.selectText = "";
    },
    store() {
      console.log({
        selectText: this.selectText,
        translatedText: this.translatedText,
      });
      // return;
      axios
        .post(
          "https://api.airtable.com/v0/appUvZoRwZf6ZHGAj/tblmsZRfBRVfUZkc4",
          {
            records: [
              {
                fields: {
                  Nonuc: this.selectText,
                  Translate: this.translatedText,
                },
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("airtableKey")}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(({ data }) => console.log(data));
    },
    airtableKey: "",
    appsPopupIsActive: false,
    appsIsOpen: false,
    sourceText:
      "No problem is too small or too trivial if we can really do something about it.\n\nRichard Feynman",
    translatedText: "Translation",
    selectText: "",
  };
}
